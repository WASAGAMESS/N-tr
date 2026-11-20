import { BioProfile, MacroTargets } from '../types/nutr';

/**
 * Motor determinístico de cálculo automático de macros (equivalente a RPC / Edge Function en Supabase).
 * Combina Mifflin-St Jeor + factor de actividad + carga alostática ejecutiva (estrés laboral y sueño).
 */
export function calculateExecutiveMacros(bio: BioProfile): MacroTargets {
  // 1. Tasa Metabólica Basal (Mifflin-St Jeor)
  const sexOffset = bio.sex === 'male' ? 5 : -161;
  const bmr = Math.round(10 * bio.weightKg + 6.25 * bio.heightCm - 5 * bio.age + sexOffset);

  // 2. Factor de actividad física semanal
  let activityMultiplier = 1.25;
  if (bio.weeklyWorkouts >= 5) activityMultiplier = 1.55;
  else if (bio.weeklyWorkouts >= 3) activityMultiplier = 1.42;
  else if (bio.weeklyWorkouts >= 1) activityMultiplier = 1.32;

  const baseTdee = Math.round(bmr * activityMultiplier);

  // 3. Modulador de objetivo
  let goalDelta = 0;
  if (bio.goal === 'fat_loss') goalDelta = -380;
  else if (bio.goal === 'recomposition') goalDelta = -120;
  else if (bio.goal === 'cognitive_performance') goalDelta = 60;

  // 4. Modulador ejecutivo de estrés y deuda de sueño
  let stressAdjustmentKcal = 0;
  if (bio.stressLevel === 'executive_high') stressAdjustmentKcal += 60;
  if (bio.sleepHours === '<6h') stressAdjustmentKcal += 80;

  const rawCalories = Math.max(1450, baseTdee + goalDelta + stressAdjustmentKcal);

  // 5. Distribución de macronutrientes según objetivo y estilo
  const proteinPerKg =
    bio.goal === 'recomposition' || bio.dietaryStyle === 'high_protein'
      ? 2.1
      : bio.goal === 'fat_loss'
        ? 2.0
        : 1.85;

  let proteinG = Math.round(bio.weightKg * proteinPerKg);
  let fatsG = Math.round((rawCalories * (bio.dietaryStyle === 'mediterranean' ? 0.33 : 0.3)) / 9);

  // Carbohidratos complejos residuales ajustados por claridad cognitiva
  const proteinKcal = proteinG * 4;
  const fatsKcal = fatsG * 9;
  let carbsG = Math.max(95, Math.round((rawCalories - proteinKcal - fatsKcal) / 4));

  if (bio.macroOverride) {
    proteinG = Math.max(70, proteinG + bio.macroOverride.proteinDeltaG);
    carbsG = Math.max(60, carbsG + bio.macroOverride.carbsDeltaG);
    fatsG = Math.max(40, fatsG + bio.macroOverride.fatsDeltaG);
  }

  const finalCalories = proteinG * 4 + carbsG * 4 + fatsG * 9;

  // 6. Hidratación personalizada (35 ml/kg + bono por sesiones y estrés)
  const hydrationMl = Math.round((bio.weightKg * 35 + bio.weeklyWorkouts * 90 + (bio.stressLevel === 'executive_high' ? 250 : 0)) / 50) * 50;

  return {
    calories: finalCalories,
    proteinG,
    carbsG,
    fatsG,
    hydrationMl,
    bmr,
    tdee: baseTdee,
    stressAdjustmentKcal,
  };
}

export const GOAL_LABELS: Record<BioProfile['goal'], string> = {
  fat_loss: 'Definición metabólica',
  recomposition: 'Recomposición corporal',
  cognitive_performance: 'Claridad cognitiva y rendimiento',
};

export const STRESS_LABELS: Record<BioProfile['stressLevel'], string> = {
  low: 'Carga controlada',
  moderate: 'Agenda demandante',
  executive_high: 'Alta presión ejecutiva',
};

export const DIET_LABELS: Record<BioProfile['dietaryStyle'], string> = {
  omnivore: 'Omnívoro balanceado',
  mediterranean: 'Mediterráneo antiinflamatorio',
  high_protein: 'Alto en proteína magra',
  plant_forward: 'Basado en plantas + pescado',
};
