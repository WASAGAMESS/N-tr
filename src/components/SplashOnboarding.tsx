import { useState } from 'react';
import { ArrowRight, Check, ChevronLeft } from 'lucide-react';
import { BioProfile, MembershipTier, Profile } from '../types/nutr';
import { calculateExecutiveMacros } from '../utils/macroEngine';

interface SplashOnboardingProps {
  profile: Profile;
  bioProfile: BioProfile;
  onComplete: (updatedProfile: Profile, updatedBio: BioProfile) => void;
  onSkipToDashboard: () => void;
}

export function SplashOnboarding({
  profile,
  bioProfile,
  onComplete,
  onSkipToDashboard,
}: SplashOnboardingProps) {
  const [phase, setPhase] = useState<'splash' | 'interview'>('splash');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [fullName, setFullName] = useState(profile.fullName);
  const [goal, setGoal] = useState<BioProfile['goal']>(bioProfile.goal);
  const [stressLevel, setStressLevel] = useState<BioProfile['stressLevel']>(bioProfile.stressLevel);
  const [age, setAge] = useState(bioProfile.age);
  const [weightKg, setWeightKg] = useState(bioProfile.weightKg);
  const [heightCm, setHeightCm] = useState(bioProfile.heightCm);
  const [sex, setSex] = useState<BioProfile['sex']>(bioProfile.sex);
  const [sleepHours, setSleepHours] = useState<BioProfile['sleepHours']>(bioProfile.sleepHours);
  const [dietaryStyle, setDietaryStyle] = useState<BioProfile['dietaryStyle']>(bioProfile.dietaryStyle);
  const [allergies, setAllergies] = useState<string[]>(bioProfile.allergies);
  const [tier, setTier] = useState<MembershipTier>(profile.tier);

  const previewBio: BioProfile = {
    ...bioProfile,
    age,
    weightKg,
    heightCm,
    sex,
    goal,
    stressLevel,
    sleepHours,
    dietaryStyle,
    allergies,
  };
  const previewMacros = calculateExecutiveMacros(previewBio);

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleFinish = () => {
    onComplete(
      {
        ...profile,
        fullName: fullName.trim() || profile.fullName,
        tier,
        onboardingCompleted: true,
      },
      previewBio
    );
  };

  if (phase === 'splash') {
    return (
      <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col justify-between px-6 py-10 md:px-14 md:py-12">
        <header className="flex items-center justify-between max-w-6xl w-full mx-auto">
          <span className="font-display text-xl font-semibold tracking-tight text-white">
            nütr PRO
          </span>
          <button
            type="button"
            onClick={onSkipToDashboard}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Ir al panel ejecutivo
          </button>
        </header>

        <main className="max-w-4xl w-full mx-auto my-auto py-16">
          <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-5">
            Nutrición clínica y logística de precisión
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.08] max-w-3xl">
            Delega cada decisión alimentaria sin fricción.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Calibramos tus requerimientos metabólicos según tu carga ejecutiva y descanso, ya sea con recetas guiadas de 7 a 12 minutos o con 21 platillos entregados semanalmente bajo supervisión clínica humana.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setPhase('interview')}
              className="min-h-[48px] inline-flex items-center gap-2.5 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 active:scale-[0.99] transition-all whitespace-nowrap shrink-0"
            >
              <span>Calibrar bio-perfil en 45 seg</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onSkipToDashboard}
              className="min-h-[48px] inline-flex items-center rounded-xl border border-zinc-800 bg-zinc-900/70 px-6 py-3 text-sm font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0"
            >
              Explorar demo cargada
            </button>
          </div>
        </main>

        <footer className="max-w-6xl w-full mx-auto border-t border-zinc-900 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-zinc-400">
          <div>
            <p className="font-display font-medium text-zinc-200">4 pasos adaptativos</p>
            <p className="mt-1 text-zinc-500">Sin formularios extensos ni conteo manual de calorías.</p>
          </div>
          <div>
            <p className="font-display font-medium text-zinc-200">Híbrido IA + Nutriólogo</p>
            <p className="mt-1 text-zinc-500">Síntesis diaria de biomarcadores y ajuste clínico humano.</p>
          </div>
          <div>
            <p className="font-display font-medium text-zinc-200">Logística de ventana exacta</p>
            <p className="mt-1 text-zinc-500">21 comidas semanales o preparación propia en 7–12 minutos.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col px-6 py-8 md:px-14">
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-between">
        {/* Header & Progress */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => (step === 1 ? setPhase('splash') : setStep((step - 1) as 1 | 2 | 3 | 4))}
              className="min-h-[44px] inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Atrás</span>
            </button>

            <span className="font-mono-tabular text-xs text-zinc-400">
              Paso {step} de 4
            </span>

            <button
              type="button"
              onClick={onSkipToDashboard}
              className="min-h-[44px] text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              Omitir
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-colors ${
                  idx <= step ? 'bg-emerald-400' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="my-10">
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-3xl font-semibold text-white tracking-tight">
                  Prioridad ejecutiva y carga diaria
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Ajustamos el reparto de glucosa y aminoácidos según tu ritmo laboral.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Tu nombre
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  placeholder="Ej. Alejandro Domínguez"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400 mb-3">Objetivo principal</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'cognitive_performance' as const,
                      title: 'Claridad cognitiva',
                      desc: 'Energía estable sin caídas postprandiales',
                    },
                    {
                      id: 'recomposition' as const,
                      title: 'Recomposición',
                      desc: 'Masa magra y reducción progresiva de grasa',
                    },
                    {
                      id: 'fat_loss' as const,
                      title: 'Definición metabólica',
                      desc: 'Déficit limpio preservando rendimiento',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id)}
                      className={`text-left rounded-2xl border p-4 transition-colors min-h-[88px] ${
                        goal === item.id
                          ? 'border-emerald-400 bg-emerald-500/10'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }`}
                    >
                      <p className="font-display text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400 mb-3">Nivel de estrés laboral</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'low' as const, label: 'Controlado' },
                    { id: 'moderate' as const, label: 'Demandante' },
                    { id: 'executive_high' as const, label: 'Alta presión' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStressLevel(item.id)}
                      className={`min-h-[48px] rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                        stressLevel === item.id
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-3xl font-semibold text-white tracking-tight">
                  Biometría base y descanso
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Calculamos tu gasto basal y modulamos la hidratación al instante.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Sexo</label>
                  <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-zinc-900 p-1 border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setSex('male')}
                      className={`min-h-[40px] rounded-lg text-xs font-medium transition-colors ${
                        sex === 'male' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                      }`}
                    >
                      Masc.
                    </button>
                    <button
                      type="button"
                      onClick={() => setSex('female')}
                      className={`min-h-[40px] rounded-lg text-xs font-medium transition-colors ${
                        sex === 'female' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                      }`}
                    >
                      Fem.
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Edad</label>
                  <input
                    type="number"
                    min={18}
                    max={85}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value) || 30)}
                    className="w-full min-h-[48px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 text-sm font-mono-tabular text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Peso (kg)</label>
                  <input
                    type="number"
                    min={40}
                    max={180}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value) || 70)}
                    className="w-full min-h-[48px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 text-sm font-mono-tabular text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Estatura (cm)</label>
                  <input
                    type="number"
                    min={140}
                    max={215}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value) || 175)}
                    className="w-full min-h-[48px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 text-sm font-mono-tabular text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400 mb-3">Promedio de sueño nocturno</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['<6h', '6-7h', '7-8h', '>8h'] as const).map((bracket) => (
                    <button
                      key={bracket}
                      type="button"
                      onClick={() => setSleepHours(bracket)}
                      className={`min-h-[48px] rounded-xl border px-3 py-2.5 font-mono-tabular text-sm transition-colors ${
                        sleepHours === bracket
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {bracket}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-3xl font-semibold text-white tracking-tight">
                  Preferencia alimentaria y exclusiones
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Filtramos automáticamente tu plan semanal y tus alternativas de intercambio.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'mediterranean' as const, title: 'Mediterráneo antiinflamatorio', desc: 'Omega-3, aceite de oliva y vegetales verdes' },
                  { id: 'high_protein' as const, title: 'Alto en proteína magra', desc: 'Máxima saciedad y soporte muscular' },
                  { id: 'omnivore' as const, title: 'Omnívoro balanceado', desc: 'Variedad completa y práctica' },
                  { id: 'plant_forward' as const, title: 'Basado en plantas + pescado', desc: 'Ligereza digestiva sin carne roja' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDietaryStyle(item.id)}
                    className={`text-left rounded-2xl border p-4 transition-colors min-h-[84px] ${
                      dietaryStyle === item.id
                        ? 'border-emerald-400 bg-emerald-500/10'
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                    }`}
                  >
                    <p className="font-display text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-zinc-400">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400 mb-3">Sensibilidades o exclusiones</p>
                <div className="flex flex-wrap gap-2.5">
                  {['Lácteos enteros', 'Gluten', 'Mariscos', 'Frutos secos', 'Carne roja'].map((item) => {
                    const active = allergies.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleAllergy(item)}
                        className={`min-h-[44px] inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-colors ${
                          active
                            ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {active && <Check className="h-3.5 w-3.5" />}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-3xl font-semibold text-white tracking-tight">
                  Tu cálculo inicial está calibrado
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Objetivo calculado: <span className="font-mono-tabular text-zinc-200">{previewMacros.calories} kcal</span> ·{' '}
                  <span className="font-mono-tabular text-emerald-400">{previewMacros.proteinG}g P</span> ·{' '}
                  <span className="font-mono-tabular text-sky-400">{previewMacros.carbsG}g C</span> ·{' '}
                  <span className="font-mono-tabular text-amber-400">{previewMacros.fatsG}g G</span> ·{' '}
                  <span className="font-mono-tabular text-zinc-200">{previewMacros.hydrationMl} ml agua</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTier('free')}
                  className={`text-left rounded-2xl border p-6 transition-colors flex flex-col justify-between ${
                    tier === 'free'
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-base font-semibold text-white">Nivel Gratuito</span>
                      <span className="font-mono-tabular text-sm text-zinc-300">$0 MXN</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">Autónomo con IA</p>
                    <ul className="mt-4 space-y-2 text-xs text-zinc-300">
                      <li>· Cálculo adaptativo de macros e hidratación</li>
                      <li>· Check-in biométrico diario sin fricción</li>
                      <li>· Plan semanal con recetas rápidas de 7–12 min</li>
                    </ul>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTier('pro')}
                  className={`text-left rounded-2xl border p-6 transition-colors flex flex-col justify-between ${
                    tier === 'pro'
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-base font-semibold text-white">Membresía Pro</span>
                      <span className="font-mono-tabular text-sm text-emerald-300">$4,800 MXN/mes</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">Fricción cero total</p>
                    <ul className="mt-4 space-y-2 text-xs text-zinc-300">
                      <li>· Nutriólogo humano dedicado (chat y ajustes)</li>
                      <li>· Health Profile IA Insights sobre tus check-ins</li>
                      <li>· Logística y entrega de 21 comidas semanales</li>
                    </ul>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between gap-4">
          <span className="text-xs text-zinc-500">
            Puedes modificar tu nivel y bio-perfil en cualquier momento.
          </span>
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as 2 | 3 | 4)}
              className="min-h-[48px] inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Continuar</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="min-h-[48px] inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Activar nütr PRO</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
