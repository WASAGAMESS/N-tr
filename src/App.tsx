import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Home,
  MessageSquareHeart,
  User,
} from 'lucide-react';
import { AccountBioProfile } from './components/AccountBioProfile';
import { DailyCheckIn as DailyCheckInView } from './components/DailyCheckIn';
import { DashboardToday } from './components/DashboardToday';
import { MediaFrame } from './components/MediaFrame';
import { NutritionistHub } from './components/NutritionistHub';
import { SplashOnboarding } from './components/SplashOnboarding';
import { WeeklyPlan } from './components/WeeklyPlan';
import {
  INITIAL_BIO_PROFILE,
  INITIAL_CHAT,
  INITIAL_CHECKINS,
  INITIAL_DELIVERY,
  INITIAL_PROFILE,
  INITIAL_WEEK_PLAN,
  MEAL_CATALOG,
} from './data/catalog';
import {
  AppSection,
  BioProfile,
  ChatMessage,
  ClinicalInsight,
  DailyCheckIn,
  DeliveryPreferences,
  MealPlanDay,
  MealSlot,
  Profile,
} from './types/nutr';
import { calculateExecutiveMacros } from './utils/macroEngine';

const STORAGE_KEY = 'nutr_pro_state_v1';

interface PersistedState {
  profile: Profile;
  bioProfile: BioProfile;
  weekPlan: MealPlanDay[];
  hydrationMl: number;
  checkIns: DailyCheckIn[];
  delivery: DeliveryPreferences;
  weekConfirmed: boolean;
  chatMessages: ChatMessage[];
  insight: ClinicalInsight | null;
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PersistedState;
    }
  } catch {
    // fallback to seed
  }
  return {
    profile: INITIAL_PROFILE,
    bioProfile: INITIAL_BIO_PROFILE,
    weekPlan: INITIAL_WEEK_PLAN,
    hydrationMl: 1250,
    checkIns: INITIAL_CHECKINS,
    delivery: INITIAL_DELIVERY,
    weekConfirmed: false,
    chatMessages: INITIAL_CHAT,
    insight: null,
  };
}

const NAV_ITEMS: { id: AppSection; label: string; shortLabel: string; icon: typeof Home }[] = [
  { id: 'hoy', label: 'Hoy', shortLabel: 'Hoy', icon: Home },
  { id: 'plan', label: 'Plan Semanal', shortLabel: 'Plan', icon: CalendarDays },
  { id: 'checkin', label: 'Check-in Diario', shortLabel: 'Check-in', icon: Activity },
  { id: 'nutriologo', label: 'Nutriólogo', shortLabel: 'Nutriólogo', icon: MessageSquareHeart },
  { id: 'perfil', label: 'Cuenta y Bio-Perfil', shortLabel: 'Perfil', icon: User },
];

export default function App() {
  const initial = useMemo(() => loadInitialState(), []);

  const [profile, setProfile] = useState<Profile>(initial.profile);
  const [bioProfile, setBioProfile] = useState<BioProfile>(initial.bioProfile);
  const [weekPlan, setWeekPlan] = useState<MealPlanDay[]>(initial.weekPlan);
  const [hydrationMl, setHydrationMl] = useState<number>(initial.hydrationMl);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(initial.checkIns);
  const [delivery, setDelivery] = useState<DeliveryPreferences>(initial.delivery);
  const [weekConfirmed, setWeekConfirmed] = useState<boolean>(initial.weekConfirmed);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initial.chatMessages);
  const [insight, setInsight] = useState<ClinicalInsight | null>(initial.insight);

  const [activeSection, setActiveSection] = useState<AppSection>('hoy');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!initial.profile.onboardingCompleted);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        profile,
        bioProfile,
        weekPlan,
        hydrationMl,
        checkIns,
        delivery,
        weekConfirmed,
        chatMessages,
        insight,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  }, [
    profile,
    bioProfile,
    weekPlan,
    hydrationMl,
    checkIns,
    delivery,
    weekConfirmed,
    chatMessages,
    insight,
  ]);

  const macroTargets = useMemo(() => calculateExecutiveMacros(bioProfile), [bioProfile]);

  const todayPlan = weekPlan[0];
  const todayMeals = (['desayuno', 'comida', 'cena'] as MealSlot[]).map(
    (slot) => MEAL_CATALOG.find((m) => m.id === todayPlan.meals[slot].mealId) ?? MEAL_CATALOG[0]
  );

  const handleToggleMealCompleted = (slot: MealSlot) => {
    setWeekPlan((prev) =>
      prev.map((day, idx) =>
        idx === 0
          ? {
              ...day,
              meals: {
                ...day.meals,
                [slot]: {
                  ...day.meals[slot],
                  completed: !day.meals[slot].completed,
                },
              },
            }
          : day
      )
    );
  };

  const handleSwapDayMeal = (dayIndex: number, slot: MealSlot, newMealId: string) => {
    setWeekPlan((prev) =>
      prev.map((day) =>
        day.dayIndex === dayIndex
          ? {
              ...day,
              meals: {
                ...day.meals,
                [slot]: {
                  mealId: newMealId,
                  completed: false,
                },
              },
            }
          : day
      )
    );
    setWeekConfirmed(false);
  };

  const handleAddHydration = (deltaMl: number) => {
    setHydrationMl((prev) => Math.max(0, Math.min(5000, prev + deltaMl)));
  };

  const handleSaveCheckIn = (entry: DailyCheckIn) => {
    setCheckIns((prev) => [entry, ...prev]);
  };

  const handleApplyMacroAdjustment = (delta: {
    proteinDeltaG: number;
    carbsDeltaG: number;
    fatsDeltaG: number;
  }) => {
    setBioProfile((prev) => ({
      ...prev,
      macroOverride: {
        proteinDeltaG: (prev.macroOverride?.proteinDeltaG ?? 0) + delta.proteinDeltaG,
        carbsDeltaG: (prev.macroOverride?.carbsDeltaG ?? 0) + delta.carbsDeltaG,
        fatsDeltaG: (prev.macroOverride?.fatsDeltaG ?? 0) + delta.fatsDeltaG,
      },
    }));
  };

  if (showOnboarding) {
    return (
      <SplashOnboarding
        profile={profile}
        bioProfile={bioProfile}
        onComplete={(nextProfile, nextBio) => {
          setProfile(nextProfile);
          setBioProfile(nextBio);
          setShowOnboarding(false);
        }}
        onSkipToDashboard={() => {
          setProfile((prev) => ({ ...prev, onboardingCompleted: true }));
          setShowOnboarding(false);
        }}
      />
    );
  }

  const currentNav = NAV_ITEMS.find((item) => item.id === activeSection) ?? NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-white/[0.07] bg-[#09090B] px-5 py-7 justify-between">
        <div>
          <div className="px-3 mb-9">
            <span className="font-display text-xl font-semibold tracking-tight text-white">
              nütr PRO
            </span>
          </div>

          <nav className="space-y-1.5" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full min-h-[44px] flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-white/[0.08] text-white'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-400' : 'text-zinc-500'}`}
                    strokeWidth={1.9}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('perfil')}
          className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#121215] p-3 text-left hover:border-zinc-700 transition-colors"
        >
          <MediaFrame
            src={profile.avatarUrl}
            alt={profile.fullName}
            aspectClass="h-10 w-10 rounded-full shrink-0"
          />
          <div className="min-w-0">
            <p className="font-display text-xs font-semibold text-white truncate">
              {profile.fullName}
            </p>
            <p className="text-[11px] text-zinc-400 truncate">
              {profile.tier === 'pro' ? 'Membresía Pro' : 'Nivel Gratuito'}
            </p>
          </div>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header (Mobile compact 52px / Desktop clean 3-zone) */}
        <header className="sticky top-0 z-30 h-[52px] lg:h-[68px] border-b border-white/[0.07] bg-[#09090B]/90 backdrop-blur-md px-5 sm:px-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="lg:hidden font-display text-base font-semibold text-white whitespace-nowrap shrink-0">
              nütr PRO
            </span>
            <span className="lg:hidden text-zinc-700" aria-hidden="true">/</span>
            <h1 className="font-display text-sm lg:text-lg font-semibold text-white truncate">
              {currentNav.label}
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400 whitespace-nowrap">
            <span>Viernes 20 Nov</span>
            <span aria-hidden="true">·</span>
            <span className={profile.tier === 'pro' ? 'text-emerald-400 font-medium' : 'text-zinc-300'}>
              {profile.tier === 'pro' ? 'Membresía Pro' : 'Autónomo IA'}
            </span>
          </div>

          <div className="shrink-0">
            {activeSection !== 'checkin' ? (
              <button
                type="button"
                onClick={() => setActiveSection('checkin')}
                className="min-h-[36px] lg:min-h-[40px] rounded-xl bg-white/[0.08] hover:bg-white/[0.13] px-3.5 py-1.5 text-xs font-medium text-white transition-colors whitespace-nowrap"
              >
                Check-in rápido
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveSection('hoy')}
                className="min-h-[36px] lg:min-h-[40px] rounded-xl bg-white/[0.08] hover:bg-white/[0.13] px-3.5 py-1.5 text-xs font-medium text-white transition-colors whitespace-nowrap"
              >
                Volver a Hoy
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Workspace */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-24 lg:pb-12">
          {activeSection === 'hoy' && (
            <DashboardToday
              tier={profile.tier}
              todayPlan={todayPlan}
              mealCatalog={MEAL_CATALOG}
              macroTargets={macroTargets}
              hydrationMl={hydrationMl}
              bioProfile={bioProfile}
              latestCheckIn={checkIns[0]}
              delivery={delivery}
              onAddHydration={handleAddHydration}
              onToggleMealCompleted={handleToggleMealCompleted}
              onSwapMeal={(slot, mealId) => handleSwapDayMeal(0, slot, mealId)}
              onGoToCheckIn={() => setActiveSection('checkin')}
            />
          )}

          {activeSection === 'plan' && (
            <WeeklyPlan
              tier={profile.tier}
              weekPlan={weekPlan}
              mealCatalog={MEAL_CATALOG}
              delivery={delivery}
              weekConfirmed={weekConfirmed}
              onSwapDayMeal={handleSwapDayMeal}
              onConfirmWeek={() => setWeekConfirmed(true)}
            />
          )}

          {activeSection === 'checkin' && (
            <DailyCheckInView
              checkIns={checkIns}
              onSaveCheckIn={handleSaveCheckIn}
              onGoToInsights={() => setActiveSection('nutriologo')}
            />
          )}

          {activeSection === 'nutriologo' && (
            <NutritionistHub
              tier={profile.tier}
              bioProfile={bioProfile}
              macroTargets={macroTargets}
              checkIns={checkIns}
              todayMeals={todayMeals}
              insight={insight}
              chatMessages={chatMessages}
              onUpdateInsight={setInsight}
              onApplyMacroAdjustment={handleApplyMacroAdjustment}
              onAddChatMessage={(msg) => setChatMessages((prev) => [...prev, msg])}
              onUpgradeToPro={() => setProfile((prev) => ({ ...prev, tier: 'pro' }))}
            />
          )}

          {activeSection === 'perfil' && (
            <AccountBioProfile
              profile={profile}
              bioProfile={bioProfile}
              macroTargets={macroTargets}
              delivery={delivery}
              onUpdateProfile={setProfile}
              onUpdateBioProfile={setBioProfile}
              onUpdateDelivery={setDelivery}
              onRerunOnboarding={() => setShowOnboarding(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Tab Bar (64px height; combined with 52px header = 116px <= 15% cap) */}
      <nav
        aria-label="Navegación inferior"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-16 border-t border-white/[0.08] bg-[#09090B]/95 backdrop-blur-md grid grid-cols-5 items-center"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className="min-h-[48px] flex flex-col items-center justify-center gap-1 px-1"
            >
              <Icon
                className={`h-5 w-5 ${active ? 'text-emerald-400' : 'text-zinc-500'}`}
                strokeWidth={active ? 2.2 : 1.75}
              />
              <span
                className={`text-[10px] font-medium tracking-tight whitespace-nowrap ${
                  active ? 'text-white' : 'text-zinc-500'
                }`}
              >
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
