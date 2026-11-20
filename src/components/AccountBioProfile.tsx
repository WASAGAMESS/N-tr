import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Database, Truck } from 'lucide-react';
import {
  BioProfile,
  DeliveryPreferences,
  MacroTargets,
  MembershipTier,
  Profile,
} from '../types/nutr';
import { MediaFrame } from './MediaFrame';

interface AccountBioProfileProps {
  profile: Profile;
  bioProfile: BioProfile;
  macroTargets: MacroTargets;
  delivery: DeliveryPreferences;
  onUpdateProfile: (next: Profile) => void;
  onUpdateBioProfile: (next: BioProfile) => void;
  onUpdateDelivery: (next: DeliveryPreferences) => void;
  onRerunOnboarding: () => void;
}

export function AccountBioProfile({
  profile,
  bioProfile,
  macroTargets,
  delivery,
  onUpdateProfile,
  onUpdateBioProfile,
  onUpdateDelivery,
  onRerunOnboarding,
}: AccountBioProfileProps) {
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [showTechSpec, setShowTechSpec] = useState(false);

  const notify = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleTierChange = (tier: MembershipTier) => {
    onUpdateProfile({ ...profile, tier });
    notify(
      tier === 'pro'
        ? 'Membresía Pro ($4,800 MXN/mes) activada.'
        : 'Cambiado a Nivel Gratuito (Autónomo con IA).'
    );
  };

  return (
    <div className="space-y-8">
      {savedNotice && (
        <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/15 px-5 py-3 text-sm text-emerald-200 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Top Row: User Header & Membership Tier Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section className="lg:col-span-5 rounded-3xl border border-white/[0.07] bg-[#121215] p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <MediaFrame
              src={profile.avatarUrl}
              alt={profile.fullName}
              aspectClass="h-16 w-16 rounded-full shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-display text-xl font-semibold text-white truncate">
                {profile.fullName}
              </h2>
              <p className="text-xs text-zinc-400 truncate">
                {profile.roleTitle} · {profile.email}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-y border-white/[0.07] py-4 font-mono-tabular">
            <div>
              <span className="text-xs text-zinc-400 block">Gasto basal (BMR)</span>
              <span className="text-lg font-semibold text-white">{macroTargets.bmr} kcal</span>
            </div>
            <div>
              <span className="text-xs text-zinc-400 block">Gasto total (TDEE)</span>
              <span className="text-lg font-semibold text-emerald-400">{macroTargets.tdee} kcal</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-400">
              Plan actual:{' '}
              <strong className="text-white">
                {profile.tier === 'pro' ? 'Membresía Pro' : 'Nivel Gratuito'}
              </strong>
            </span>
            <button
              type="button"
              onClick={onRerunOnboarding}
              className="min-h-[40px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:text-white transition-colors"
            >
              Repetir entrevista 45s
            </button>
          </div>
        </section>

        {/* Subscription Switcher */}
        <section className="lg:col-span-7 rounded-3xl border border-white/[0.07] bg-[#121215] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Modelo de suscripción
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Cambia de modalidad en cualquier momento para alternar entre cocina rápida o entrega logística total.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleTierChange('free')}
              className={`text-left rounded-2xl border p-5 transition-colors ${
                profile.tier === 'free'
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-sm font-semibold text-white">Nivel Gratuito</span>
                <span className="font-mono-tabular text-xs text-zinc-300">$0 / mes</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Macros automáticos, hidratación, check-in biométrico y recetas de 7–12 min para cocinar por tu cuenta.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleTierChange('pro')}
              className={`text-left rounded-2xl border p-5 transition-colors ${
                profile.tier === 'pro'
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-sm font-semibold text-white">Membresía Pro</span>
                <span className="font-mono-tabular text-xs text-emerald-300">$4,800 MXN/mes</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Nutriólogo humano dedicado, Health Profile IA Insights y logística de entrega de 21 comidas semanales.
              </p>
            </button>
          </div>
        </section>
      </div>

      {/* Bottom Row: Biometrics Editor + Logistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Biometrics */}
        <section className="lg:col-span-6 rounded-3xl border border-white/[0.07] bg-[#121215] p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Archivo biométrico y cálculo automático
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Cualquier ajuste recalcula calorías, macronutrientes e hidratación al instante.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Peso (kg)</label>
              <input
                type="number"
                value={bioProfile.weightKg}
                onChange={(e) =>
                  onUpdateBioProfile({ ...bioProfile, weightKg: Number(e.target.value) || 70 })
                }
                className="w-full min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 font-mono-tabular text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Estatura (cm)</label>
              <input
                type="number"
                value={bioProfile.heightCm}
                onChange={(e) =>
                  onUpdateBioProfile({ ...bioProfile, heightCm: Number(e.target.value) || 175 })
                }
                className="w-full min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 font-mono-tabular text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Edad</label>
              <input
                type="number"
                value={bioProfile.age}
                onChange={(e) =>
                  onUpdateBioProfile({ ...bioProfile, age: Number(e.target.value) || 35 })
                }
                className="w-full min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 font-mono-tabular text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Entrenos/sem</label>
              <input
                type="number"
                min={0}
                max={7}
                value={bioProfile.weeklyWorkouts}
                onChange={(e) =>
                  onUpdateBioProfile({
                    ...bioProfile,
                    weeklyWorkouts: Math.min(7, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
                className="w-full min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 font-mono-tabular text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Objetivo metabólico</label>
              <select
                value={bioProfile.goal}
                onChange={(e) =>
                  onUpdateBioProfile({
                    ...bioProfile,
                    goal: e.target.value as BioProfile['goal'],
                  })
                }
                className="w-full min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="cognitive_performance">Claridad cognitiva y rendimiento</option>
                <option value="recomposition">Recomposición corporal</option>
                <option value="fat_loss">Definición metabólica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Estrés laboral</label>
              <select
                value={bioProfile.stressLevel}
                onChange={(e) =>
                  onUpdateBioProfile({
                    ...bioProfile,
                    stressLevel: e.target.value as BioProfile['stressLevel'],
                  })
                }
                className="w-full min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="low">Carga controlada</option>
                <option value="moderate">Agenda demandante</option>
                <option value="executive_high">Alta presión ejecutiva</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4 flex flex-wrap items-center justify-between gap-3 font-mono-tabular text-xs">
            <span className="text-zinc-400">Meta calculada resultante</span>
            <span className="text-zinc-200">
              {macroTargets.calories} kcal · <span className="text-emerald-400">{macroTargets.proteinG}g P</span> ·{' '}
              <span className="text-sky-400">{macroTargets.carbsG}g C</span> ·{' '}
              <span className="text-amber-400">{macroTargets.fatsG}g G</span>
            </span>
          </div>
        </section>

        {/* Logistics Preferences */}
        <section className="lg:col-span-6 rounded-3xl border border-white/[0.07] bg-[#121215] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                Logística de entrega semanal
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Ventana exacta e instrucciones de cadena fría (4 °C)
              </p>
            </div>
            <Truck className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Dirección ejecutiva / domicilio</label>
              <input
                type="text"
                value={delivery.addressLine}
                onChange={(e) => onUpdateDelivery({ ...delivery, addressLine: e.target.value })}
                className="w-full min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Ventana horaria exacta</label>
                <select
                  value={delivery.windowSlot}
                  onChange={(e) =>
                    onUpdateDelivery({
                      ...delivery,
                      windowSlot: e.target.value as DeliveryPreferences['windowSlot'],
                    })
                  }
                  className="w-full min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 font-mono-tabular text-sm text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="06:30 - 07:00">06:30 - 07:00</option>
                  <option value="07:30 - 08:00">07:30 - 08:00</option>
                  <option value="13:00 - 13:30">13:00 - 13:30</option>
                  <option value="19:30 - 20:00">19:30 - 20:00</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Frecuencia de despacho</label>
                <select
                  value={delivery.cadence}
                  onChange={(e) =>
                    onUpdateDelivery({
                      ...delivery,
                      cadence: e.target.value as DeliveryPreferences['cadence'],
                    })
                  }
                  className="w-full min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="Lun / Mié / Vie (21 comidas)">Lun / Mié / Vie (21 comidas)</option>
                  <option value="Entrega diaria matutina">Entrega diaria matutina</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">
                Instrucciones de refrigeración y acceso
              </label>
              <textarea
                rows={2}
                value={delivery.refrigerationNotes}
                onChange={(e) =>
                  onUpdateDelivery({ ...delivery, refrigerationNotes: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-zinc-400">Hielera térmica retornable con gel frío</span>
              <button
                type="button"
                onClick={() => {
                  onUpdateDelivery({
                    ...delivery,
                    thermalBoxEnabled: !delivery.thermalBoxEnabled,
                  });
                  notify('Preferencia logística actualizada.');
                }}
                className={`min-h-[40px] rounded-xl border px-4 py-1.5 text-xs font-medium transition-colors ${
                  delivery.thermalBoxEnabled
                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                }`}
              >
                {delivery.thermalBoxEnabled ? 'Activa' : 'Desactivada'}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Expandable Technical / Supabase Macro Calculation Spec */}
      <section className="rounded-3xl border border-white/[0.07] bg-[#121215] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTechSpec((prev) => !prev)}
          className="w-full px-6 py-5 sm:px-8 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Database className="h-4 w-4 text-emerald-400" />
            <span className="font-display text-sm font-semibold text-white">
              Arquitectura de cálculo automático de macros y esquema Supabase
            </span>
          </div>
          {showTechSpec ? (
            <ChevronUp className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          )}
        </button>

        {showTechSpec && (
          <div className="px-6 pb-8 sm:px-8 pt-2 border-t border-white/[0.06] space-y-4 text-xs text-zinc-300 leading-relaxed">
            <p>
              El cálculo en tiempo real que ves arriba implementa la función determinística de <span className="font-mono-tabular text-emerald-300">bio_profiles</span> lista para ejecutarse como Trigger / RPC en PostgreSQL (Supabase):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono-tabular text-[11px] text-zinc-300 space-y-1.5">
                <p className="text-emerald-400 font-semibold">Fórmula adaptativa aplicada</p>
                <p>1. BMR (Mifflin-St Jeor) = 10×peso + 6.25×altura − 5×edad + (+5 H / −161 M)</p>
                <p>2. TDEE = BMR × FactorActividad (1.25 – 1.55 según sesiones)</p>
                <p>3. Modulador ejecutivo = +60 kcal (alta presión) +80 kcal (&lt;6h sueño)</p>
                <p>4. Proteína = 1.85–2.10 g/kg · Grasa = 30–33% kcal · Carbs = residuales</p>
                <p>5. Hidratación = 35 ml/kg + bono por sesiones y carga laboral</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono-tabular text-[11px] text-zinc-300 space-y-1.5">
                <p className="text-sky-400 font-semibold">Tablas relacionales sincronizadas</p>
                <p>· profiles (id, full_name, tier, onboarding_completed)</p>
                <p>· bio_profiles (profile_id, weight_kg, stress_level, sleep_hours, targets)</p>
                <p>· daily_check_ins (profile_id, hunger, energy, mental_clarity, markers)</p>
                <p>· meal_plans (profile_id, week_start, slot, meal_id, completed)</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
