import { useState } from 'react';
import { ArrowLeftRight, Check, CheckCircle2, Clock, Truck, X } from 'lucide-react';
import {
  DeliveryPreferences,
  MealItem,
  MealPlanDay,
  MealSlot,
  MembershipTier,
} from '../types/nutr';
import { MediaFrame } from './MediaFrame';

interface WeeklyPlanProps {
  tier: MembershipTier;
  weekPlan: MealPlanDay[];
  mealCatalog: MealItem[];
  delivery: DeliveryPreferences;
  weekConfirmed: boolean;
  onSwapDayMeal: (dayIndex: number, slot: MealSlot, newMealId: string) => void;
  onConfirmWeek: () => void;
}

const SLOT_LABELS: Record<MealSlot, string> = {
  desayuno: 'Desayuno',
  comida: 'Comida',
  cena: 'Cena',
};

export function WeeklyPlan({
  tier,
  weekPlan,
  mealCatalog,
  delivery,
  weekConfirmed,
  onSwapDayMeal,
  onConfirmWeek,
}: WeeklyPlanProps) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [previewMeal, setPreviewMeal] = useState<MealItem | null>(null);
  const [swapTarget, setSwapTarget] = useState<{ dayIndex: number; slot: MealSlot } | null>(null);

  const selectedDay = weekPlan[selectedDayIdx] ?? weekPlan[0];
  const slots: MealSlot[] = ['desayuno', 'comida', 'cena'];

  const totalWeeklyMeals = weekPlan.length * 3;
  const dayMacros = slots.reduce(
    (acc, slot) => {
      const meal = mealCatalog.find((m) => m.id === selectedDay.meals[slot].mealId);
      if (!meal) return acc;
      return {
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <div className="space-y-8">
      {/* Header Summary & One-Tap Weekly Confirmation */}
      <section className="rounded-3xl border border-white/[0.07] bg-[#121215] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white tracking-tight">
            Plan semanal de {totalWeeklyMeals} comidas
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400">
            {tier === 'pro'
              ? `Logística refrigerada · ${delivery.cadence} · Ventana ${delivery.windowSlot}`
              : 'Recetas autónomas calibradas entre 7 y 12 minutos de preparación'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {weekConfirmed ? (
            <div className="min-h-[48px] inline-flex items-center gap-2.5 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-5 py-3 text-sm font-medium text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {tier === 'pro'
                  ? '21 comidas confirmadas para despacho'
                  : 'Menú semanal y lista de cocina confirmados'}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConfirmWeek}
              className="min-h-[48px] inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 active:scale-[0.99] transition-all whitespace-nowrap shrink-0"
            >
              <Check className="h-4 w-4" />
              <span>Confirmar semana en un toque</span>
            </button>
          )}
        </div>
      </section>

      {/* Horizontal Day Scroller */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {weekPlan.map((day) => {
          const active = day.dayIndex === selectedDayIdx;
          return (
            <button
              key={day.dayIndex}
              type="button"
              onClick={() => setSelectedDayIdx(day.dayIndex)}
              className={`min-h-[56px] min-w-[84px] flex-1 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                active
                  ? 'border-emerald-400 bg-emerald-500/10 text-white'
                  : 'border-white/[0.07] bg-[#121215] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="block font-display text-xs font-semibold">{day.dayShort}</span>
              <span className="mt-0.5 block font-mono-tabular text-[11px] opacity-80">
                {day.dateLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Meals */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-white">
            {selectedDay.dayName} · {selectedDay.dateLabel}
          </h3>
          <p className="font-mono-tabular text-xs text-zinc-400">
            Total del día: <span className="text-zinc-200">{dayMacros.calories} kcal</span> ·{' '}
            <span className="text-emerald-400">{dayMacros.protein}g P</span> ·{' '}
            {dayMacros.carbs}g C · {dayMacros.fats}g G
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {slots.map((slot) => {
            const meal = mealCatalog.find((m) => m.id === selectedDay.meals[slot].mealId) ?? mealCatalog[0];
            return (
              <article
                key={slot}
                className="rounded-3xl border border-white/[0.07] bg-[#121215] overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => setPreviewMeal(meal)}
                    className="w-full text-left group"
                  >
                    <MediaFrame
                      src={meal.imageUrl}
                      alt={meal.name}
                      fallbackLabel={meal.name}
                      className="w-full group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </button>

                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-medium text-zinc-200">{SLOT_LABELS[slot]}</span>
                      <span className="font-mono-tabular">
                        {meal.calories} kcal · {meal.protein}g P
                      </span>
                    </div>
                    <h4 className="mt-2 font-display text-base font-semibold text-white leading-snug">
                      {meal.name}
                    </h4>
                    <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                      {meal.subtitle}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPreviewMeal(meal)}
                    className="flex-1 min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:text-white transition-colors whitespace-nowrap"
                  >
                    {tier === 'pro' ? 'Ver ficha y envío' : `Receta (${meal.prepMinutes} min)`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSwapTarget({ dayIndex: selectedDay.dayIndex, slot })}
                    className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    <span>Elegir otro</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Compact 7-Day Matrix Overview */}
      <section className="rounded-3xl border border-white/[0.07] bg-[#121215] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-base font-semibold text-white">
            Resumen semanal completo
          </h3>
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            {tier === 'pro' ? (
              <>
                <Truck className="h-3.5 w-3.5 text-emerald-400" />
                <span>21 contenedores refrigerados</span>
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Cocina práctica &lt; 12 min</span>
              </>
            )}
          </span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {weekPlan.map((day) => {
            const dMeal = mealCatalog.find((m) => m.id === day.meals.desayuno.mealId);
            const cMeal = mealCatalog.find((m) => m.id === day.meals.comida.mealId);
            const nMeal = mealCatalog.find((m) => m.id === day.meals.cena.mealId);
            return (
              <div
                key={day.dayIndex}
                className="py-3.5 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center text-xs"
              >
                <button
                  type="button"
                  onClick={() => setSelectedDayIdx(day.dayIndex)}
                  className="md:col-span-2 text-left font-medium text-zinc-200 hover:text-emerald-300"
                >
                  {day.dayName} <span className="font-mono-tabular text-zinc-500">· {day.dateLabel}</span>
                </button>
                <span className="md:col-span-3 text-zinc-400 truncate">
                  {dMeal?.name}
                </span>
                <span className="md:col-span-4 text-zinc-300 truncate">
                  {cMeal?.name}
                </span>
                <span className="md:col-span-3 text-zinc-400 truncate">
                  {nMeal?.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Swap Modal */}
      {swapTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-6">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-[#121215] p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-white">
                Seleccionar {SLOT_LABELS[swapTarget.slot]} · {weekPlan[swapTarget.dayIndex]?.dayName}
              </h3>
              <button
                type="button"
                onClick={() => setSwapTarget(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {mealCatalog
                .filter((m) => m.slot === swapTarget.slot)
                .map((candidate) => {
                  const isCurrent =
                    weekPlan[swapTarget.dayIndex]?.meals[swapTarget.slot].mealId === candidate.id;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => {
                        onSwapDayMeal(swapTarget.dayIndex, swapTarget.slot, candidate.id);
                        setSwapTarget(null);
                      }}
                      className={`w-full text-left rounded-2xl border p-4 flex items-center gap-4 transition-colors ${
                        isCurrent
                          ? 'border-emerald-400 bg-emerald-500/10'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }`}
                    >
                      <MediaFrame
                        src={candidate.imageUrl}
                        alt={candidate.name}
                        aspectClass="w-16 h-14 rounded-xl shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-semibold text-white truncate">
                          {candidate.name}
                        </p>
                        <p className="mt-1 font-mono-tabular text-xs text-zinc-400">
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

      {/* Recipe Preview Drawer */}
      {previewMeal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-6">
          <div className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-[#121215] p-6 sm:p-8 max-h-[88vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono-tabular text-xs text-emerald-400">
                  {previewMeal.prepMinutes} min · {previewMeal.calories} kcal · {previewMeal.protein}g P
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-white">
                  {previewMeal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMeal(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <MediaFrame
              src={previewMeal.imageUrl}
              alt={previewMeal.name}
              aspectClass="aspect-[16/9] rounded-2xl"
            />

            <div>
              <h4 className="font-display text-sm font-semibold text-white mb-2">Ingredientes</h4>
              <ul className="space-y-1 text-sm text-zinc-300">
                {previewMeal.ingredients.map((ing) => (
                  <li key={ing}>· {ing}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-white mb-2">
                Pasos ({previewMeal.prepMinutes} minutos)
              </h4>
              <ol className="space-y-2 text-sm text-zinc-300">
                {previewMeal.quickSteps.map((st, idx) => (
                  <li key={st} className="flex gap-2.5">
                    <span className="font-mono-tabular text-xs text-emerald-400 pt-0.5">0{idx + 1}.</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
