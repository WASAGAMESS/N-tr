import { useState } from 'react';
import { Calendar, Check, Lock, Send, Sparkles } from 'lucide-react';
import { IMG_NUTRITIONIST } from '../data/catalog';
import {
  BioProfile,
  ChatMessage,
  ClinicalInsight,
  DailyCheckIn,
  MacroTargets,
  MealItem,
  MembershipTier,
} from '../types/nutr';
import { MediaFrame } from './MediaFrame';

interface NutritionistHubProps {
  tier: MembershipTier;
  bioProfile: BioProfile;
  macroTargets: MacroTargets;
  checkIns: DailyCheckIn[];
  todayMeals: MealItem[];
  insight: ClinicalInsight | null;
  chatMessages: ChatMessage[];
  onUpdateInsight: (insight: ClinicalInsight) => void;
  onApplyMacroAdjustment: (delta: { proteinDeltaG: number; carbsDeltaG: number; fatsDeltaG: number }) => void;
  onAddChatMessage: (msg: ChatMessage) => void;
  onUpgradeToPro: () => void;
}

export function NutritionistHub({
  tier,
  bioProfile,
  macroTargets,
  checkIns,
  todayMeals,
  insight,
  chatMessages,
  onUpdateInsight,
  onApplyMacroAdjustment,
  onAddChatMessage,
  onUpgradeToPro,
}: NutritionistHubProps) {
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [adjustmentApplied, setAdjustmentApplied] = useState(false);

  const [draft, setDraft] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [callBookedSlot, setCallBookedSlot] = useState<string | null>(null);
  const [showCallPicker, setShowCallPicker] = useState(false);

  const handleGenerateInsights = async () => {
    setLoadingInsight(true);
    setInsightError(null);
    setAdjustmentApplied(false);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bioProfile,
          recentCheckIns: checkIns.slice(0, 4),
          macroTargets,
          consumedToday: {
            plannedMeals: todayMeals.map((m) => m.name),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInsightError(data.error || 'No se pudo generar el diagnóstico.');
        setLoadingInsight(false);
        return;
      }
      onUpdateInsight({
        generatedAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        clinicalTags: data.clinicalTags ?? [],
        executiveSummary: data.executiveSummary ?? '',
        nutritionistBrief: data.nutritionistBrief ?? '',
        suggestedMacroAdjustment: data.suggestedMacroAdjustment ?? {
          proteinDeltaG: 0,
          carbsDeltaG: 0,
          fatsDeltaG: 0,
          rationale: '',
        },
      });
      setLoadingInsight(false);
    } catch {
      setInsightError('Error de red al conectar con Health Profile IA.');
      setLoadingInsight(false);
    }
  };

  const handleSendChat = async (customText?: string) => {
    const textToSend = (customText ?? draft).trim();
    if (!textToSend || sendingChat) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      authorName: 'Tú',
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
    };

    onAddChatMessage(userMsg);
    if (!customText) setDraft('');
    setSendingChat(true);
    setChatError(null);

    try {
      const res = await fetch('/api/nutritionist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: [...chatMessages, userMsg],
          bioProfile,
          latestCheckIn: checkIns[0],
          todayMeals,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChatError(data.error || 'No se pudo enviar el mensaje.');
        setSendingChat(false);
        return;
      }

      onAddChatMessage({
        id: `msg_${Date.now() + 1}`,
        sender: 'nutritionist',
        authorName: 'Dra. Valeria Mendoza',
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        text: data.reply,
      });
      setSendingChat(false);
    } catch {
      setChatError('Error de conexión con el escritorio clínico.');
      setSendingChat(false);
    }
  };

  if (tier === 'free') {
    return (
      <div className="rounded-3xl border border-white/[0.07] bg-[#121215] p-8 sm:p-12 max-w-4xl">
        <div className="flex items-center gap-3 text-xs font-medium text-emerald-400">
          <Lock className="h-4 w-4" />
          <span>Exclusivo Membresía Pro · $4,800 MXN/mes</span>
        </div>
        <h2 className="mt-3 font-display text-3xl font-semibold text-white tracking-tight">
          Seguimiento clínico humano e Inteligencia Biométrica
        </h2>
        <p className="mt-3 text-sm text-zinc-400 max-w-2xl leading-relaxed">
          En el Nivel Gratuito tienes acceso autónomo completo a macros, hidratación, check-in y recetas de 7 a 12 minutos. Al activar Membresía Pro desbloqueas a tu nutrióloga clínica dedicada, síntesis Health Profile IA Insights y el despacho semanal de 21 comidas refrigeradas.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5 border-y border-white/[0.07] py-6 text-sm">
          <div>
            <p className="font-display font-semibold text-white">Etiquetas clínicas IA</p>
            <p className="mt-1 text-xs text-zinc-400">
              Detección temprana de caída matutina, inflamación o deuda de descanso.
            </p>
          </div>
          <div>
            <p className="font-display font-semibold text-white">Ajustes manuales</p>
            <p className="mt-1 text-xs text-zinc-400">
              Chat directo y llamadas de 15 min con Dra. Valeria Mendoza.
            </p>
          </div>
          <div>
            <p className="font-display font-semibold text-white">21 platillos/semana</p>
            <p className="mt-1 text-xs text-zinc-400">
              Entrega en ventana horaria exacta en oficina o domicilio.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onUpgradeToPro}
          className="mt-8 min-h-[48px] rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 transition-colors"
        >
          Activar Membresía Pro ($4,800 MXN/mes)
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Health Profile IA Insights */}
      <section className="lg:col-span-5 rounded-3xl border border-white/[0.07] bg-[#121215] p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">
              Health Profile IA Insights
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Síntesis clínica generada a partir de tus últimos check-ins
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateInsights}
            disabled={loadingInsight}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{loadingInsight ? 'Analizando...' : 'Analizar ahora'}</span>
          </button>
        </div>

        {insightError && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 leading-relaxed">
            {insightError}
          </div>
        )}

        {!insight && !loadingInsight && (
          <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-3">
            <p className="text-sm text-zinc-200 font-medium">
              Etiquetas clínicas detectadas hoy (vista previa)
            </p>
            <div className="divide-y divide-white/[0.06] text-xs">
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-zinc-200 font-medium">Caída matutina de energía</span>
                <span className="text-amber-400">Atención · Café en ayunas</span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-zinc-200 font-medium">Inflamación abdominal leve</span>
                <span className="text-amber-400">Ajustar · Fibra nocturna</span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-zinc-200 font-medium">Claridad vespertina óptima</span>
                <span className="text-emerald-400">Óptimo · Post Omega-3</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 pt-1">
              Presiona <strong className="text-zinc-200">Analizar ahora</strong> para sintetizar tus datos actuales con Gemini IA y proponer un ajuste de macros.
            </p>
          </div>
        )}

        {insight && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Diagnóstico clínico IA</span>
              <span className="font-mono-tabular">Actualizado {insight.generatedAt}</span>
            </div>

            <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {insight.clinicalTags.map((tag) => (
                <div key={tag.label} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-white">{tag.label}</span>
                    <span
                      className={
                        tag.severity === 'optimal'
                          ? 'text-emerald-400'
                          : tag.severity === 'adjust'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                      }
                    >
                      {tag.severity === 'optimal'
                        ? 'Óptimo'
                        : tag.severity === 'adjust'
                          ? 'Ajuste sugerido'
                          : 'Observación'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{tag.evidence}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-300">Resumen ejecutivo</p>
              <p className="text-sm text-zinc-200 leading-relaxed">{insight.executiveSummary}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-300">Nota para tu nutriólogo</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{insight.nutritionistBrief}</p>
            </div>

            {/* Macro Adjustment Suggestion */}
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-300">Ajuste clínico de macros</span>
                <span className="font-mono-tabular text-zinc-200">
                  {insight.suggestedMacroAdjustment.proteinDeltaG >= 0 ? '+' : ''}
                  {insight.suggestedMacroAdjustment.proteinDeltaG}g P ·{' '}
                  {insight.suggestedMacroAdjustment.carbsDeltaG >= 0 ? '+' : ''}
                  {insight.suggestedMacroAdjustment.carbsDeltaG}g C ·{' '}
                  {insight.suggestedMacroAdjustment.fatsDeltaG >= 0 ? '+' : ''}
                  {insight.suggestedMacroAdjustment.fatsDeltaG}g G
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {insight.suggestedMacroAdjustment.rationale}
              </p>
              <button
                type="button"
                disabled={adjustmentApplied}
                onClick={() => {
                  onApplyMacroAdjustment(insight.suggestedMacroAdjustment);
                  setAdjustmentApplied(true);
                }}
                className="w-full min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-300 disabled:bg-emerald-500/30 disabled:text-emerald-200 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{adjustmentApplied ? 'Ajuste aplicado a tu meta de hoy' : 'Aplicar ajuste a mi meta'}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Right Column: Human Nutritionist Direct Desk */}
      <section className="lg:col-span-7 rounded-3xl border border-white/[0.07] bg-[#121215] flex flex-col overflow-hidden">
        {/* Specialist Header */}
        <div className="p-6 sm:p-8 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MediaFrame
              src={IMG_NUTRITIONIST}
              alt="Dra. Valeria Mendoza"
              aspectClass="h-14 w-14 rounded-full shrink-0"
            />
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                Dra. Valeria Mendoza
              </h3>
              <p className="text-xs text-zinc-400">
                M.Sc. Nutrición Clínica · Especialista asignada nütr PRO
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCallPicker((prev) => !prev)}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Calendar className="h-3.5 w-3.5 text-emerald-400" />
            <span>{callBookedSlot ? `Llamada: ${callBookedSlot}` : 'Agendar llamada 15 min'}</span>
          </button>
        </div>

        {/* Inline Call Scheduler */}
        {showCallPicker && (
          <div className="px-6 py-4 bg-zinc-900/60 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-zinc-300">Selecciona ventana disponible mañana:</span>
            <div className="flex flex-wrap gap-2">
              {['08:30', '13:15', '18:00'].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    setCallBookedSlot(`Mañana ${slot} h`);
                    setShowCallPicker(false);
                  }}
                  className="min-h-[38px] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono-tabular text-xs text-white hover:border-emerald-400"
                >
                  {slot} h
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Thread */}
        <div className="p-6 sm:p-8 space-y-5 max-h-[440px] overflow-y-auto">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1.5">
                <span>{msg.authorName}</span>
                <span>·</span>
                <span className="font-mono-tabular">{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-400 text-zinc-950 font-medium'
                    : 'bg-zinc-900 border border-white/[0.07] text-zinc-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {sendingChat && (
            <p className="text-xs text-zinc-400">Dra. Valeria está revisando tus registros...</p>
          )}
          {chatError && (
            <p className="text-xs text-amber-300">{chatError}</p>
          )}
        </div>

        {/* Quick Clinical Prompts + Input */}
        <div className="p-6 border-t border-white/[0.07] space-y-3 bg-zinc-950/40">
          <div className="flex flex-wrap gap-2">
            {[
              'Tengo vuelo temprano mañana, ¿qué ajustamos?',
              'Siento leve pesadez después de comer',
              '¿Puedo intercambiar la cena por algo más ligero?',
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSendChat(q)}
                className="min-h-[36px] rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribe a Dra. Valeria Mendoza..."
              className="flex-1 min-h-[46px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sendingChat}
              aria-label="Enviar mensaje"
              className="min-h-[46px] min-w-[46px] inline-flex items-center justify-center rounded-xl bg-emerald-400 text-zinc-950 hover:bg-emerald-300 disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
