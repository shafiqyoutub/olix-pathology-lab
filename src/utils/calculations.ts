import { ReferenceRange, Gender, ResultFlag } from '../types';

export interface CalculationResult {
  value?: number;
  warning?: string;
}

/**
 * Automatically calculate age (Years, Months, Days) from Date of Birth
 */
export function calculateAgeFromDob(dobString: string): { years: number; months: number; days: number } {
  if (!dobString) return { years: 0, months: 0, days: 0 };
  const dob = new Date(dobString);
  const now = new Date();

  if (isNaN(dob.getTime()) || dob > now) {
    return { years: 0, months: 0, days: 0 };
  }

  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
}

/**
 * Format age for display: e.g. "36 Y", "4 M 12 D", "8 D"
 */
export function formatAge(years: number, months: number, days: number): string {
  if (years > 0) {
    if (years < 2 && months > 0) return `${years}Y ${months}M`;
    return `${years} Years`;
  }
  if (months > 0) {
    return `${months} Months ${days > 0 ? `${days} Days` : ''}`.trim();
  }
  return `${days} Days`;
}

/**
 * Match the most relevant reference range based on patient's gender and age (in years)
 */
export function getMatchingReferenceRange(
  ranges: ReferenceRange[] = [],
  patientGender: 'male' | 'female' | 'other' = 'male',
  patientAgeYears: number = 25
): ReferenceRange | null {
  if (!ranges || ranges.length === 0) return null;

  // 1. Exact gender match with age bracket
  const exactGender = ranges.find(r => 
    (r.gender === patientGender || (patientGender === 'other' && r.gender === 'both')) &&
    (r.ageMin === undefined || patientAgeYears >= r.ageMin) &&
    (r.ageMax === undefined || patientAgeYears <= r.ageMax)
  );
  if (exactGender) return exactGender;

  // 2. Both genders match with age bracket
  const bothGender = ranges.find(r => 
    r.gender === 'both' &&
    (r.ageMin === undefined || patientAgeYears >= r.ageMin) &&
    (r.ageMax === undefined || patientAgeYears <= r.ageMax)
  );
  if (bothGender) return bothGender;

  // 3. Any range for this gender
  const anyGender = ranges.find(r => r.gender === patientGender);
  if (anyGender) return anyGender;

  // 4. Fallback to first range
  return ranges[0] || null;
}

/**
 * Determine Result Flag (normal, high, low, abnormal)
 */
export function evaluateResultFlag(
  value: string | number | undefined,
  range: ReferenceRange | null
): ResultFlag {
  if (value === undefined || value === null || value === '') return 'normal';

  const numVal = typeof value === 'number' ? value : parseFloat(String(value));

  // Numerical range evaluation
  if (!isNaN(numVal) && range && (range.low !== undefined || range.high !== undefined)) {
    if (range.low !== undefined && numVal < range.low) {
      return 'low';
    }
    if (range.high !== undefined && numVal > range.high) {
      return 'high';
    }
    return 'normal';
  }

  // Qualitative / text string evaluation
  const strVal = String(value).toLowerCase().trim();
  if (
    strVal.includes('positive') ||
    strVal.includes('reactive') ||
    strVal.includes('present') ||
    strVal.includes('abnormal') ||
    strVal.includes('turbid') ||
    strVal.includes('trace') ||
    strVal.includes('+') ||
    strVal.includes('1:160') ||
    strVal.includes('1:320') ||
    strVal.includes('1:640')
  ) {
    if (strVal.includes('non-reactive') || strVal.includes('negative')) {
      return 'normal';
    }
    return 'abnormal';
  }

  return 'normal';
}

/**
 * Execute automatic calculation formulas
 */
export function runFormulaCalculation(
  formulaName: string,
  allValues: Record<string, string | number | undefined>
): CalculationResult {
  switch (formulaName) {
    // --- Hematology ---
    case 'mcv': {
      // MCV = (PCV * 10) / RBC
      const pcv = parseFloat(String(allValues['pcv'] ?? ''));
      const rbc = parseFloat(String(allValues['rbc'] ?? ''));
      if (isNaN(pcv) || isNaN(rbc) || rbc <= 0) {
        return { warning: 'MCV requires valid PCV and RBC > 0' };
      }
      return { value: Number(((pcv * 10) / rbc).toFixed(1)) };
    }

    case 'mch': {
      // MCH = (Hb * 10) / RBC
      const hb = parseFloat(String(allValues['hb'] ?? ''));
      const rbc = parseFloat(String(allValues['rbc'] ?? ''));
      if (isNaN(hb) || isNaN(rbc) || rbc <= 0) {
        return { warning: 'MCH requires valid Hb and RBC > 0' };
      }
      return { value: Number(((hb * 10) / rbc).toFixed(1)) };
    }

    case 'mchc': {
      // MCHC = (Hb * 100) / PCV
      const hb = parseFloat(String(allValues['hb'] ?? ''));
      const pcv = parseFloat(String(allValues['pcv'] ?? ''));
      if (isNaN(hb) || isNaN(pcv) || pcv <= 0) {
        return { warning: 'MCHC requires valid Hb and PCV > 0' };
      }
      return { value: Number(((hb * 100) / pcv).toFixed(1)) };
    }

    case 'pcv': {
      // If PCV is blank but RBC and MCV exist, calculate PCV = (RBC * MCV) / 10
      const rbc = parseFloat(String(allValues['rbc'] ?? ''));
      const mcv = parseFloat(String(allValues['mcv'] ?? ''));
      const hb = parseFloat(String(allValues['hb'] ?? ''));
      if (!isNaN(rbc) && !isNaN(mcv) && rbc > 0 && mcv > 0) {
        return { value: Number(((rbc * mcv) / 10).toFixed(1)) };
      }
      if (!isNaN(hb) && hb > 0) {
        // Fallback approximation: Hb * 3.1
        return { value: Number((hb * 3.1).toFixed(1)) };
      }
      return {};
    }

    // --- Liver Function Tests ---
    case 'indirect_bilirubin': {
      // Indirect Bilirubin = Total Bilirubin - Direct Bilirubin
      const total = parseFloat(String(allValues['bili_total'] ?? ''));
      const direct = parseFloat(String(allValues['bili_direct'] ?? ''));
      if (isNaN(total) || isNaN(direct)) return {};
      if (direct > total) {
        return {
          warning: 'Direct Bilirubin cannot exceed Total Bilirubin'
        };
      }
      return { value: Number((total - direct).toFixed(2)) };
    }

    case 'globulin': {
      // Globulin = Total Protein - Albumin
      const tp = parseFloat(String(allValues['total_protein'] ?? ''));
      const alb = parseFloat(String(allValues['albumin'] ?? ''));
      if (isNaN(tp) || isNaN(alb)) return {};
      if (alb > tp) {
        return {
          warning: 'Albumin cannot exceed Total Protein'
        };
      }
      return { value: Number((tp - alb).toFixed(2)) };
    }

    case 'ag_ratio': {
      // A/G Ratio = Albumin / Globulin
      const alb = parseFloat(String(allValues['albumin'] ?? ''));
      let glob = parseFloat(String(allValues['globulin'] ?? ''));
      const tp = parseFloat(String(allValues['total_protein'] ?? ''));

      if (isNaN(glob) && !isNaN(tp) && !isNaN(alb)) {
        glob = tp - alb;
      }

      if (isNaN(alb) || isNaN(glob)) return {};
      if (glob <= 0) {
        return { warning: 'Globulin must be greater than zero for A/G Ratio' };
      }
      return { value: Number((alb / glob).toFixed(2)) };
    }

    // --- Renal Function Tests ---
    case 'bun': {
      // BUN = Urea / 2.14
      const urea = parseFloat(String(allValues['urea'] ?? ''));
      if (isNaN(urea)) return {};
      return { value: Number((urea / 2.14).toFixed(1)) };
    }

    // --- Lipid Profile ---
    case 'ldl_friedewald': {
      // LDL = Total Cholesterol - HDL - (Triglycerides / 5)
      const chol = parseFloat(String(allValues['chol_total'] ?? ''));
      const hdl = parseFloat(String(allValues['hdl'] ?? ''));
      const tg = parseFloat(String(allValues['triglycerides'] ?? ''));

      if (isNaN(chol) || isNaN(hdl) || isNaN(tg)) return {};

      if (tg > 400) {
        return {
          warning: 'Triglycerides > 400 mg/dL: Friedewald equation is invalid. Direct LDL assay recommended.'
        };
      }
      const ldl = chol - hdl - (tg / 5);
      return { value: Number(Math.max(0, ldl).toFixed(1)) };
    }

    case 'vldl': {
      // VLDL = Triglycerides / 5
      const tg = parseFloat(String(allValues['triglycerides'] ?? ''));
      if (isNaN(tg)) return {};
      return { value: Number((tg / 5).toFixed(1)) };
    }

    case 'chol_hdl_ratio': {
      // Total Cholesterol / HDL
      const chol = parseFloat(String(allValues['chol_total'] ?? ''));
      const hdl = parseFloat(String(allValues['hdl'] ?? ''));
      if (isNaN(chol) || isNaN(hdl) || hdl <= 0) return {};
      return { value: Number((chol / hdl).toFixed(2)) };
    }

    case 'inr': {
      // INR = (PT_Patient / PT_Control) ^ ISI (default ISI = 1.0)
      const pt = parseFloat(String(allValues['pt_patient'] ?? ''));
      const control = parseFloat(String(allValues['pt_control'] ?? '12.5'));
      if (isNaN(pt) || isNaN(control) || control <= 0) return {};
      return { value: Number((pt / control).toFixed(2)) };
    }

    default:
      return {};
  }
}
