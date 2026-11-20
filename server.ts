import 'dotenv/config';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('403') || raw.includes('PERMISSION_DENIED')) {
    return {
      status: 403,
      message: 'Permiso denegado en Gemini API. Verifica tu clave en Settings > Secrets.',
    };
  }
  if (raw.includes('400') || raw.includes('API_KEY_INVALID')) {
    return {
      status: 400,
      message: 'Clave de Gemini API inválida. Revisa la configuración en Settings > Secrets.',
    };
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'Cuota temporal alcanzada en el modelo. Intenta nuevamente en unos segundos.',
    };
  }
  return {
    status: 500,
    message: `Error al consultar el motor clínico de IA: ${raw}`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'nutr-pro-api' });
  });

  app.post('/api/insights', async (req: Request, res: Response) => {
    const ai = createGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no está configurada en el entorno del servidor (Settings > Secrets).',
      });
    }

    try {
      const { bioProfile, recentCheckIns, macroTargets, consumedToday } = req.body;

      const prompt = `Analiza el perfil biométrico, los últimos check-ins diarios y el consumo de macros de este usuario ejecutivo de nütr PRO.
Bio-Perfil: ${JSON.stringify(bioProfile)}
Objetivos diarios: ${JSON.stringify(macroTargets)}
Consumo actual de hoy: ${JSON.stringify(consumedToday)}
Check-ins recientes: ${JSON.stringify(recentCheckIns)}

Genera un diagnóstico clínico conciso en español mexicano profesional para la Dra. Valeria Mendoza y el ejecutivo:
- 3 etiquetas clínicas breves (2 a 4 palabras cada una, ej. "Caída matutina de enfoque", "Inflamación leve postprandial", "Súperavit proteico estable") con severidad ('optimal' | 'attention' | 'adjust').
- Un resumen ejecutivo de 2 oraciones claras y accionables.
- Una nota clínica técnica para el ajuste del nutriólogo humano.
- Un ajuste sugerido de macros (proteína, carbohidratos, grasas en gramos delta, entre -20 y +25) con justificación corta.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Eres el motor de análisis clínico Health Profile IA de nütr PRO. Responde siempre en español neutro/mexicano clínico, conciso, sin exageraciones ni jerga artificial.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              clinicalTags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    evidence: { type: Type.STRING },
                  },
                },
              },
              executiveSummary: { type: Type.STRING },
              nutritionistBrief: { type: Type.STRING },
              suggestedMacroAdjustment: {
                type: Type.OBJECT,
                properties: {
                  proteinDeltaG: { type: Type.INTEGER },
                  carbsDeltaG: { type: Type.INTEGER },
                  fatsDeltaG: { type: Type.INTEGER },
                  rationale: { type: Type.STRING },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err) {
      const { status, message } = parseGeminiError(err);
      return res.status(status).json({ error: message });
    }
  });

  app.post('/api/nutritionist/chat', async (req: Request, res: Response) => {
    const ai = createGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no está configurada en el entorno del servidor (Settings > Secrets).',
      });
    }

    try {
      const { message, history, bioProfile, latestCheckIn, todayMeals } = req.body;

      const contextText = `Contexto del paciente ejecutivo:
Nombre: ${bioProfile?.fullName ?? 'Ejecutivo'}
Objetivo: ${bioProfile?.goal ?? 'rendimiento'}
Estrés laboral: ${bioProfile?.stressLevel ?? 'alto'}
Sueño promedio: ${bioProfile?.sleepHours ?? '6-7h'}
Último check-in: Hambre ${latestCheckIn?.hunger ?? '-'}/10, Energía ${latestCheckIn?.energy ?? '-'}/10, Claridad ${latestCheckIn?.mentalClarity ?? '-'}/10, Digestión: ${latestCheckIn?.markers?.digestion ?? '-'}, Inflamación: ${latestCheckIn?.markers?.inflammation ?? '-'}.
Comidas de hoy: ${(todayMeals ?? []).map((m: { name: string }) => m.name).join(', ')}.`;

      const conversationHistory = (history ?? [])
        .slice(-6)
        .map((m: { sender: string; text: string }) => `${m.sender === 'user' ? 'Paciente' : 'Dra. Valeria'}: ${m.text}`)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `${contextText}\n\nHistorial reciente:\n${conversationHistory}\n\nMensaje nuevo del paciente: "${message}"\n\nResponde como la Dra. Valeria Mendoza (M.Sc. Nutrición Clínica en nütr PRO) de forma directa, empática, práctica para alguien sin tiempo, en 2 a 4 oraciones concretas.`,
        config: {
          systemInstruction:
            'Eres la Dra. Valeria Mendoza, nutrióloga clínica senior de nütr PRO. Das respuestas breves, precisas y accionables para ejecutivos ocupados en CDMX/LATAM. No uses asteriscos de markdown ni listas largas; escribe en tono humano directo.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      return res.json({ reply: (response.text ?? '').trim() });
    } catch (err) {
      const { status, message } = parseGeminiError(err);
      return res.status(status).json({ error: message });
    }
  });

  app.post('/api/meal-swap', async (req: Request, res: Response) => {
    const ai = createGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no está configurada en el entorno del servidor (Settings > Secrets).',
      });
    }

    try {
      const { currentMeal, candidates, bioProfile, latestCheckIn } = req.body;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `El usuario quiere intercambiar su comida "${currentMeal?.name}" (${currentMeal?.slot}).
Perfil: objetivo ${bioProfile?.goal}, preferencia ${bioProfile?.dietaryStyle}, alergias: ${(bioProfile?.allergies ?? []).join(', ') || 'ninguna'}.
Check-in hoy: Energía ${latestCheckIn?.energy ?? 7}/10, Claridad ${latestCheckIn?.mentalClarity ?? 7}/10, Digestión ${latestCheckIn?.markers?.digestion ?? 'Ligera'}.
Opciones disponibles: ${JSON.stringify(candidates.map((c: { id: string; name: string; calories: number; protein: number; carbs: number; fats: number; prepMinutes: number }) => ({ id: c.id, name: c.name, calories: c.calories, protein: c.protein, prepMinutes: c.prepMinutes })))}

Elige el ID de la mejor opción y explica en una sola frase clínica por qué conviene hoy.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedId: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err) {
      const { status, message } = parseGeminiError(err);
      return res.status(status).json({ error: message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`nütr PRO server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
