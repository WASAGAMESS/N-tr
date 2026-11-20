import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { DailyCheckIn as DailyCheckInType, PhysicalMarkers } from '../types/nutr';

interface DailyCheckInProps {
  checkIns: DailyCheckInType[];
  onSaveCheckIn: (entry: DailyCheckInType) => void;
  onGoToInsights: () => void;
}

export function DailyCheckIn({
  checkIns,
  onSaveCheckIn,
  onGoToInsights,
}: DailyCheckInProps) {
  const latest = checkIns[0];

  const [hunger, setHunger] = useState(latest?.hunger ?? 4);
  const [energy, setEnergy] = useState(latest?.energy ?? 6);
  const [mentalClarity, setMentalClarity] = useState(latest?.mentalClarity ?? 7);
  const [markers, setMarkers] = useState<PhysicalMarkers>(
    latest?.markers ?? {
      digestion: 'Ligera',
      vitality: 'Estable',
      skin: 'Clara',
      inflammation: 'Nula',
    }
  );
  const [notes, setNotes] = useState(latest?.notes ?? '');
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayISO = new Date().toISOString().slice(0, 10);
    const newEntry: DailyCheckInType = {
      id: `chk_${Date.now()}`,
      dateISO: todayISO,
      dateLabel: 'Hoy · Registro actualizado',
      hunger,
      energy,
      mentalClarity,
      markers,
      notes: notes.trim(),
    };
    onSaveCheckIn(newEntry);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3500);
  };

  const sliderConfigs = [
    {
      label: 'Hambre percibida',
      value: hunger,
      onChange: setHunger,
      lowLabel: 'Saciedad estable',
      highLabel: 'Hambre intensa',
      accentColor: 'text-amber-300',
    },
    {
      label: 'Energía física',
      value: energy,
      onChange: setEnergy,
      lowLabel: 'Fatiga',
      highLabel: 'Energía sostenida',
      accentColor: 'text-emerald-400',
    },
    {
      label: 'Claridad mental',
      value: mentalClarity,
      onChange: setMentalClarity,
      lowLabel: 'Niebla mental',
      highLabel: 'Enfoque total',
      accentColor: 'text-sky-400',
    },
  ];

  const markerGroups: {
    key: keyof PhysicalMarkers;
    title: string;
    options: PhysicalMarkers[keyof PhysicalMarkers][];
  }[] = [
    {
      key: 'digestion',
      title: 'Digestión',
      options: ['Ligera', 'Pesadez leve', 'Reflujo / lenta'],
    },
    {
      key: 'vitality',
      title: 'Curva de vitalidad',
      options: ['Estable', 'Caída matutina', 'Caída 16:00 h'],
    },
    {
      key: 'skin',
      title: 'Estado de piel',
      options: ['Clara', 'Reactiva', 'Deshidratada'],
    },
    {
      key: 'inflammation',
      title: 'Inflamación',
      options: ['Nula', 'Leve abdominal', 'Retención hídrica'],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: Clue-inspired Gesture Sliders + Physical Markers */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-8 rounded-3xl border border-white/[0.07] bg-[#121215] p-6 sm:p-8 space-y-8"
      >
        <div>
          <h2 className="font-display text-2xl font-semibold text-white tracking-tight">
            Check-in biométrico diario
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400">
            Desliza según tu percepción actual. Estos marcadores alimentan el diagnóstico clínico de IA y tu nutriólogo.
          </p>
        </div>

        {/* Gesture Sliders */}
        <div className="space-y-6">
          {sliderConfigs.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-5"
            >
              <div className="flex items-baseline justify-between mb-3">
                <label className="font-display text-sm font-semibold text-white">
                  {item.label}
                </label>
                <span className={`font-mono-tabular text-lg font-semibold ${item.accentColor}`}>
                  {item.value} / 10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={item.value}
                onChange={(e) => item.onChange(Number(e.target.value))}
                className="nutr-slider"
                aria-label={item.label}
              />
              <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                <span>{item.lowLabel}</span>
                <span>{item.highLabel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Physical Markers */}
        <div className="space-y-5">
          <h3 className="font-display text-base font-semibold text-white">
            Marcadores físicos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {markerGroups.map((group) => (
              <div key={group.key}>
                <p className="text-xs font-medium text-zinc-400 mb-2.5">{group.title}</p>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((opt) => {
                    const active = markers[group.key] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setMarkers((prev) => ({
                            ...prev,
                            [group.key]: opt,
                          }))
                        }
                        className={`min-h-[40px] rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors ${
                          active
                            ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Notes */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Notas del día (juntas, viajes, estrés o entrenamiento)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Vuelo temprano, café antes de desayuno o sesión de fuerza 45 min..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {savedBanner ? (
            <div className="inline-flex items-center gap-2 text-sm text-emerald-400">
              <Check className="h-4 w-4" />
              <span>Registro guardado en tu bio-historial.</span>
            </div>
          ) : (
            <span className="text-xs text-zinc-500">
              Actualiza tus señales en menos de 20 segundos.
            </span>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGoToInsights}
              className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-2.5 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:text-white transition-colors whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Ver diagnóstico IA</span>
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 active:scale-[0.99] transition-all whitespace-nowrap"
            >
              Guardar check-in
            </button>
          </div>
        </div>
      </form>

      {/* Right: Recent Check-in History */}
      <aside className="lg:col-span-4 rounded-3xl border border-white/[0.07] bg-[#121215] p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="font-display text-lg font-semibold text-white">
            Historial reciente
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            Tendencia de señales para ajuste clínico semanal
          </p>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {checkIns.slice(0, 5).map((item) => (
            <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-200">{item.dateLabel}</span>
                <span className="font-mono-tabular text-zinc-400">
                  H {item.hunger} · E {item.energy} · C {item.mentalClarity}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {item.markers.digestion} · {item.markers.vitality} · Inflamación: {item.markers.inflammation}
              </p>
              {item.notes && (
                <p className="text-xs text-zinc-500 leading-relaxed">{item.notes}</p>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
