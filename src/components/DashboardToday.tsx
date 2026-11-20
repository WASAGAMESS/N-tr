import { useState } from 'react';
import {
  ArrowLeftRight,
  Check,
  Clock,
  Droplets,
  Minus,
  Plus,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import {
  BioProfile,
  DailyCheckIn,
  DeliveryPreferences,
  MacroTargets,
  MealItem,
  MealPlanDay,
  MealSlot,
  MembershipTier,
} from '../types/nutr';
import { MediaFrame } from './MediaFrame';

interface DashboardTodayProps {
  tier: MembershipTier;
  todayPlan: MealPlanDay;
  mealCatalog: MealItem[];
  macroTargets: MacroTargets;
  hydrationMl: number;
  bioProfile: BioProfile;
  latestCheckIn?: DailyCheckIn;
  delivery: DeliveryPreferences;
  onAddHydration: (deltaMl: number) => void;
  onToggleMealCompleted: (slot: MealSlot) => void;
  onSwapMeal: (slot: MealSlot, newMealId: string) => void;
  onGoToCheckIn: () => void;
}

const SLOT_LABELS: Record<MealSlot, string> = {
  desayuno: 'Desayuno',
  comida: 'Comida',
  cena: 'Cena',
};

export function DashboardToday({
  tier,
  todayPlan,
  mealCatalog,
  macroTargets,
  hydrationMl,
  bioProfile,
  latestCheckIn,
  delivery,
  onAddHydration,
  onToggleMealCompleted,
  onSwapMeal,
  onGoToCheckIn,
}: DashboardTodayProps) {
  const [swapSlot, setSwapSlot] = useState<MealSlot | null>(null);
  const [detailMeal, setDetailMeal] = useState<MealItem | null>(null);
  const [aiSwapState, setAiSwapState] = useState<{
    loading: boolean;
    recommendedId?: string;
    reason?: string;
    error?: string;
  }>({ loading: false });

  const slots: MealSlot[] = ['desayuno', 'comida', 'cena'];

  const resolvedMeals = slots.map((slot) => {
    const entry = todayPlan.meals[slot];
    const meal = mealCatalog.find((m) => m.id === entry.mealId) ?? mealCatalog[0];
    return { slot, completed: entry.completed, meal };
  });

  // Consumed macros calculation
  const consumed = resolvedMeals.reduce(
    (acc, item) => {
      if (!item.completed) return acc;
      return {
        calories: acc.calories + item.meal.calories,
        protein: acc.protein + item.meal.protein,
        carbs: acc.carbs + item.meal.carbs,
        fats: acc.fats + item.meal.fats,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const plannedCalories = resolvedMeals.reduce((acc, item) => acc + item.meal.calories, 0);
  const calPct = Math.min(100, Math.round((consumed.calories / macroTargets.calories) * 100));
  const hydrationPct = Math.min(100, Math.round((hydrationMl / macroTargets.hydrationMl) * 100));

  // SVG Ring math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPct / 100) * circumference;

  const macroBars = [
    {
      label: 'Proteína',
      current: consumed.protein,
      target: macroTargets.proteinG,
      colorClass: 'bg-emerald-400',
      textClass: 'text-emerald-400',
    },
    {
      label: 'Carbohidratos',
      current: consumed.carbs,
      target: macroTargets.carbsG,
      colorClass: 'bg-sky-400',
      textClass: 'text-sky-400',
    },
    {
      label: 'Grasas',
      current: consumed.fats,
      target: macroTargets.fatsG,
      colorClass: 'bg-amber-400',
      textClass: 'text-amber-400',
    },
  ];

  const handleRequestAiSwap = async (slot: MealSlot, currentMeal: MealItem) => {
    const candidates = mealCatalog.filter((m) => m.slot === slot && m.id !== currentMeal.id);
    setAiSwapState({ loading: true });
    try {
      const res = await fetch('/api/meal-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMeal,
          candidates,
          bioProfile,
          latestCheckIn,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiSwapState({ loading: false, error: data.error || 'No se pudo consultar IA.' });
        return;
      }
      setAiSwapState({
        loading: false,
        recommendedId: data.recommendedId,
        reason: data.reason,
      });
    } catch {
      setAiSwapState({
        loading: false,
        error: 'Error de conexión al consultar recomendación de intercambio.',
      });
    }
  };

  const openSwapModal = (slot: MealSlot) => {
    setAiSwapState({ loading: false });
    setSwapSlot(slot);
  };

  return (
    <div className="space-y-8">
      {/* Top Hero Row: Macro Ring + Hydration Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Calorie & Macro Focal Anchor */}
        <section className="lg:col-span-8 rounded-3xl border border-white/[0.07] bg-[#121215] p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Balance calórico de hoy
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Meta calibrada: <span className="font-mono-tabular text-zinc-200">{macroTargets.calories} kcal</span> · Plan cargado: <span className="font-mono-tabular text-zinc-300">{plannedCalories} kcal</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToCheckIn}
              className="min-h-[40px] text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap"
            >
              Registrar check-in biométrico
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-12 gap-8 items-center">
            {/* Precision Calorie Ring */}
            <div className="sm:col-span-5 flex items-center justify-center">
              <div className="relative h-44 w-44 flex items-center justify-center">
                <svg className="h-44 w-44 -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono-tabular text-3xl font-semibold text-white tracking-tight">
                    {consumed.calories}
                  </span>
                  <span className="text-xs text-zinc-400 mt-0.5">
                    de {macroTargets.calories} kcal
                  </span>
                  <span className="font-mono-tabular text-[11px] text-emerald-400 mt-1">
                    {Math.max(0, macroTargets.calories - consumed.calories)} restantes
                  </span>
                </div>
              </div>
            </div>

            {/* Macronutrient Progress Bars */}
            <div className="sm:col-span-7 space-y-5">
              {macroBars.map((macro) => {
                const pct = Math.min(100, Math.round((macro.current / macro.target) * 100));
                return (
                  <div key={macro.label}>
                    <div className="flex items-baseline justify-between text-sm mb-2">
                      <span className="font-medium text-zinc-200">{macro.label}</span>
                      <span className="font-mono-tabular text-xs text-zinc-400">
                        <strong className={`font-semibold ${macro.textClass}`}>{macro.current}g</strong> / {macro.target}g
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${macro.colorClass} transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Hydration Control */}
        <section className="lg:col-span-4 rounded-3xl border border-white/[0.07] bg-[#121215] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">Hidratación</h2>
              <Droplets className="h-5 w-5 text-sky-400" strokeWidth={1.75} />
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Meta diaria ajustada por peso y carga laboral
            </p>

            <div className="mt-6">
              <div className="flex items-baseline gap-2">
                <span className="font-mono-tabular text-4xl font-semibold text-white">
                  {hydrationMl}
                </span>
                <span className="font-mono-tabular text-sm text-zinc-400">
                  / {macroTargets.hydrationMl} ml
                </span>
              </div>
              <div className="mt-4 h-2.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-400 transition-all duration-300"
                  style={{ width: `${hydrationPct}%` }}
                />
              </div>
              <p className="mt-2 font-mono-tabular text-xs text-zinc-400">
                {hydrationPct}% completado
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => onAddHydration(-250)}
              disabled={hydrationMl <= 0}
              aria-label="Restar 250 ml"
              className="min-h-[44px] inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:text-white disabled:opacity-40 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onAddHydration(250)}
              className="min-h-[44px] inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 text-xs font-mono-tabular font-medium text-zinc-200 hover:border-sky-400/50 hover:text-sky-300 transition-colors whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>250 ml</span>
            </button>
            <button
              type="button"
              onClick={() => onAddHydration(500)}
              className="min-h-[44px] inline-flex items-center justify-center gap-1 rounded-xl bg-sky-500/15 border border-sky-400/30 px-3 text-xs font-mono-tabular font-medium text-sky-300 hover:bg-sky-500/25 transition-colors whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>500 ml</span>
            </button>
          </div>
        </section>
      </div>

      {/* Delivery / Prep Mode Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-white/[0.07] py-4 text-xs text-zinc-400">
        {tier === 'pro' ? (
          <div className="flex flex-wrap items-center gap-3">
            <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-200 font-medium">Entrega logística Pro confirmada</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{delivery.windowSlot}</span>
            <span aria-hidden="true">·</span>
            <span>{delivery.addressLine}, {delivery.neighborhood}</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-200 font-medium">Modo Autónomo con IA</span>
            <span aria-hidden="true">·</span>
            <span>Instrucciones express de 7 a 12 minutos por platillo</span>
          </div>
        )}
        <span className="font-mono-tabular text-zinc-500">
          {resolvedMeals.filter((m) => m.completed).length} de 3 comidas registradas
        </span>
      </div>

      {/* 3 Meals of the Day */}
      <div>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-xl font-semibold text-white">Tus tres comidas de hoy</h2>
          <span className="text-xs text-zinc-400">
            Toca un platillo para ver receta rápida o instrucciones térmicas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resolvedMeals.map(({ slot, completed, meal }) => (
            <article
              key={slot}
              className={`rounded-3xl border transition-colors overflow-hidden flex flex-col justify-between ${
                completed
                  ? 'border-emerald-500/35 bg-[#121215]'
                  : 'border-white/[0.07] bg-[#121215]'
              }`}
            >
              <div>
                <button
                  type="button"
                  onClick={() => setDetailMeal(meal)}
                  className="w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <div className="relative">
                    <MediaFrame
                      src={meal.imageUrl}
                      alt={meal.name}
                      fallbackLabel={meal.name}
                      className="w-full group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#121215] via-[#121215]/40 to-transparent" />
                  </div>
                </button>

                <div className="px-6 pt-3 pb-5">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-medium text-zinc-300">{SLOT_LABELS[slot]}</span>
                    <span className="font-mono-tabular">
                      {meal.timeLabel} · {tier === 'pro' ? 'Listo 2 min' : `${meal.prepMinutes} min`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailMeal(meal)}
                    className="mt-2 text-left block w-full"
                  >
                    <h3 className="font-display text-base font-semibold text-white leading-snug hover:text-emerald-300 transition-colors">
                      {meal.name}
                    </h3>
                  </button>
                  <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {meal.subtitle}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono-tabular text-xs text-zinc-300">
                    <span>{meal.calories} kcal</span>
                    <span className="text-zinc-500">
                      <span className="text-emerald-400">{meal.protein}g P</span> · {meal.carbs}g C · {meal.fats}g G
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onToggleMealCompleted(slot)}
                  className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    completed
                      ? 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300'
                      : 'border border-zinc-800 bg-zinc-900/70 text-zinc-200 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{completed ? 'Completada' : 'Marcar comida'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => openSwapModal(slot)}
                  aria-label={`Intercambiar ${SLOT_LABELS[slot]}`}
                  className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  <span>Cambiar</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Quick Swap Modal */}
      {swapSlot && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-6">
          <div className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-[#121215] p-6 sm:p-8 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-white">
                  Intercambio rápido · {SLOT_LABELS[swapSlot]}
                </h3>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Opciones calibradas para mantener tu presupuesto proteico
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSwapSlot(null)}
                aria-label="Cerrar"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Smart AI Recommendation Trigger */}
            {(() => {
              const current = resolvedMeals.find((r) => r.slot === swapSlot)?.meal;
              if (!current) return null;
              return (
                <div className="mt-5 rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-medium text-zinc-200">Sugerencia clínica según tu check-in</p>
                      <p className="text-zinc-400 mt-0.5">
                        Evalúa digestión, claridad mental y carga del día.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={aiSwapState.loading}
                      onClick={() => handleRequestAiSwap(swapSlot, current)}
                      className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-emerald-400/15 border border-emerald-400/30 px-3.5 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-400/25 disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{aiSwapState.loading ? 'Analizando...' : 'Sugerir con IA'}</span>
                    </button>
                  </div>
                  {aiSwapState.error && (
                    <p className="mt-3 text-xs text-amber-300">{aiSwapState.error}</p>
                  )}
                  {aiSwapState.reason && (
                    <p className="mt-3 text-xs text-emerald-200 leading-relaxed">
                      {aiSwapState.reason}
                    </p>
                  )}
                </div>
              );
            })()}

            <div className="mt-5 space-y-3">
              {mealCatalog
                .filter((m) => m.slot === swapSlot)
                .map((candidate) => {
                  const isCurrent = todayPlan.meals[swapSlot].mealId === candidate.id;
                  const isRecommended = aiSwapState.recommendedId === candidate.id;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => {
                        onSwapMeal(swapSlot, candidate.id);
                        setSwapSlot(null);
                      }}
                      className={`w-full text-left rounded-2xl border p-4 flex items-center gap-4 transition-colors ${
                        isCurrent
                          ? 'border-emerald-400 bg-emerald-500/10'
                          : isRecommended
                            ? 'border-emerald-400/60 bg-zinc-900'
                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }`}
                    >
                      <MediaFrame
                        src={candidate.imageUrl}
                        alt={candidate.name}
                        aspectClass="w-20 h-16 rounded-xl shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-display text-sm font-semibold text-white truncate">
                            {candidate.name}
                          </p>
                          {isCurrent && (
                            <span className="text-[11px] font-medium text-emerald-400 shrink-0">
                              Actual
                            </span>
                          )}
                          {!isCurrent && isRecommended && (
                            <span className="text-[11px] font-medium text-emerald-300 shrink-0">
                              Recomendado IA
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-zinc-400 truncate">{candidate.subtitle}</p>
                        <p className="mt-1.5 font-mono-tabular text-xs text-zinc-300">
                          {candidate.calories} kcal · {candidate.protein}g P · {candidate.prepMinutes} min
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Meal Recipe / Pro Logistics Detail Modal */}
      {detailMeal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-6">
          <div className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-[#121215] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative h-52 sm:h-60 shrink-0">
              <MediaFrame
                src={detailMeal.imageUrl}
                alt={detailMeal.name}
                aspectClass="h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/30 to-transparent" />
              <button
                type="button"
                onClick={() => setDetailMeal(null)}
                aria-label="Cerrar detalle"
                className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div>
                <p className="font-mono-tabular text-xs text-emerald-400">
                  {detailMeal.prepMinutes} min · {detailMeal.prepMethod} · {detailMeal.calories} kcal
                </p>
                <h3 className="mt-1.5 font-display text-2xl font-semibold text-white">
                  {detailMeal.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">{detailMeal.subtitle}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 border-y border-white/[0.07] py-4 font-mono-tabular text-sm">
                <div>
                  <span className="text-xs text-zinc-400 block">Proteína</span>
                  <span className="text-emerald-400 font-semibold">{detailMeal.protein} g</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block">Carbohidratos</span>
                  <span className="text-sky-400 font-semibold">{detailMeal.carbs} g</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block">Grasas</span>
                  <span className="text-amber-400 font-semibold">{detailMeal.fats} g</span>
                </div>
              </div>

              {tier === 'pro' && (
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                  <p className="text-xs font-semibold text-emerald-300">
                    Logística Membresía Pro
                  </p>
                  <p className="mt-1 text-xs text-zinc-200 leading-relaxed">
                    {detailMeal.proLogisticsNote}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-display text-sm font-semibold text-white mb-2.5">
                  Ingredientes calibrados
                </h4>
                <ul className="space-y-1.5 text-sm text-zinc-300">
                  {detailMeal.ingredients.map((ing) => (
                    <li key={ing}>· {ing}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-display text-sm font-semibold text-white mb-2.5">
                  Preparación express ({detailMeal.prepMinutes} minutos)
                </h4>
                <ol className="space-y-2.5 text-sm text-zinc-300">
                  {detailMeal.quickSteps.map((stepText, idx) => (
                    <li key={stepText} className="flex gap-3">
                      <span className="font-mono-tabular text-xs text-emerald-400 pt-0.5 shrink-0">
                        0{idx + 1}.
                      </span>
                      <span className="leading-relaxed">{stepText}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
