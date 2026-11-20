export type MembershipTier = 'free' | 'pro';

export type BiologicalSex = 'male' | 'female';
export type GoalType = 'fat_loss' | 'recomposition' | 'cognitive_performance';
export type StressLevel = 'low' | 'moderate' | 'executive_high';
export type SleepBracket = '<6h' | '6-7h' | '7-8h' | '>8h';
export type DietaryStyle = 'omnivore' | 'mediterranean' | 'high_protein' | 'plant_forward';

export type MealSlot = 'desayuno' | 'comida' | 'cena';

export type AppSection = 'hoy' | 'plan' | 'checkin' | 'nutriologo' | 'perfil';

export interface Profile {
  id: string;
  fullName: string;
  roleTitle: string;
  email: string;
  avatarUrl: string;
  tier: MembershipTier;
  onboardingCompleted: boolean;
}

export interface BioProfile {
  profileId: string;
  age: number;
  weightKg: number;
  heightCm: number;
  sex: BiologicalSex;
  goal: GoalType;
  stressLevel: StressLevel;
  sleepHours: SleepBracket;
  dietaryStyle: DietaryStyle;
  allergies: string[];
  weeklyWorkouts: number;
  macroOverride?: {
    proteinDeltaG: number;
    carbsDeltaG: number;
    fatsDeltaG: number;
  };
}

export interface MacroTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  hydrationMl: number;
  bmr: number;
  tdee: number;
  stressAdjustmentKcal: number;
}

export interface MealItem {
  id: string;
  slot: MealSlot;
  name: string;
  subtitle: string;
  timeLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepMinutes: number;
  prepMethod: string;
  imageUrl: string;
  ingredients: string[];
  quickSteps: string[];
  proLogisticsNote: string;
  tags: string[];
}

export interface PlannedMealEntry {
  mealId: string;
  completed: boolean;
}

export interface MealPlanDay {
  dayIndex: number; // 0 = Lunes ... 6 = Domingo
  dayShort: string;
  dayName: string;
  dateLabel: string;
  meals: Record<MealSlot, PlannedMealEntry>;
}

export interface PhysicalMarkers {
  digestion: 'Ligera' | 'Pesadez leve' | 'Reflujo / lenta';
  vitality: 'Estable' | 'Caída matutina' | 'Caída 16:00 h';
  skin: 'Clara' | 'Reactiva' | 'Deshidratada';
  inflammation: 'Nula' | 'Leve abdominal' | 'Retención hídrica';
}

export interface DailyCheckIn {
  id: string;
  dateISO: string;
  dateLabel: string;
  hunger: number; // 1-10
  energy: number; // 1-10
  mentalClarity: number; // 1-10
  markers: PhysicalMarkers;
  notes: string;
}

export interface ClinicalTag {
  label: string;
  severity: 'optimal' | 'attention' | 'adjust';
  evidence: string;
}

export interface ClinicalInsight {
  generatedAt: string;
  clinicalTags: ClinicalTag[];
  executiveSummary: string;
  nutritionistBrief: string;
  suggestedMacroAdjustment: {
    proteinDeltaG: number;
    carbsDeltaG: number;
    fatsDeltaG: number;
    rationale: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'nutritionist';
  authorName: string;
  timestamp: string;
  text: string;
}

export interface DeliveryPreferences {
  addressLine: string;
  neighborhood: string;
  city: string;
  windowSlot: '06:30 - 07:00' | '07:30 - 08:00' | '13:00 - 13:30' | '19:30 - 20:00';
  cadence: 'Lun / Mié / Vie (21 comidas)' | 'Entrega diaria matutina';
  refrigerationNotes: string;
  thermalBoxEnabled: boolean;
}
