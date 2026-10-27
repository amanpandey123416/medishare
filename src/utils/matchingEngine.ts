import { AssistanceRequest, EquipmentItem, MedicalSupply } from '../types';

export interface MatchResult {
  resourceId: string;
  resourceName: string;
  resourceType: 'equipment' | 'supply';
  score: number; // 0 - 100
  explanations: string[];
  city: string;
  serviceArea: string;
  condition?: string;
  item: EquipmentItem | MedicalSupply;
}

export function findMatchesForRequest(
  request: AssistanceRequest,
  equipmentList: EquipmentItem[],
  suppliesList: MedicalSupply[]
): MatchResult[] {
  const matches: MatchResult[] = [];

  // Match against Equipment
  equipmentList.forEach((eq) => {
    // Equipment must be available or under gentle review
    if (eq.status !== 'Available') return;

    let score = 0;
    const reasons: string[] = [];

    // 1. Category Matching (Max 45 points)
    if (eq.category.toLowerCase() === request.category.toLowerCase()) {
      score += 45;
      reasons.push(`Exact category match: "${eq.category}"`);
    } else if (
      (request.category.includes('Mobility') && eq.category.includes('Mobility')) ||
      (request.category.includes('Bed') && eq.category.includes('Bed')) ||
      (request.category.includes('Walk') && eq.category.includes('Walk')) ||
      (request.category.includes('Suction') && eq.category.includes('Suction'))
    ) {
      score += 35;
      reasons.push(`Close functional category correlation`);
    } else if ((request.category as string).includes('equipment') || (request.category as string).includes('Mobility')) {
      score += 25;
      reasons.push(`General medical equipment alignment`);
    }

    // 2. Location & Service Area (Max 35 points)
    const cityMatch = eq.city.toLowerCase() === request.city.toLowerCase();
    if (cityMatch) {
      score += 25;
      reasons.push(`Located in the same city: ${eq.city}`);

      // Sub-area match bonus
      if (
        request.serviceArea &&
        (eq.serviceArea.toLowerCase().includes(request.serviceArea.toLowerCase()) ||
          request.serviceArea.toLowerCase().includes(eq.serviceArea.toLowerCase()))
      ) {
        score += 10;
        reasons.push(`Immediate service area alignment: ${request.serviceArea}`);
      }
    } else {
      reasons.push(`Inter-city transit required (${eq.city} to ${request.city})`);
    }

    // 3. Condition & Sanitation verification (Max 10 points)
    if (eq.cleaningStatus === 'Sanitized & Inspected') {
      score += 10;
      reasons.push('Sanitized & inspected verified');
    } else if (eq.cleaningStatus === 'Cleaned') {
      score += 5;
    }

    // 4. Urgency fit (Max 10 points)
    if (request.urgency.startsWith('Critical') && cityMatch) {
      score += 10;
      reasons.push('Fast local access for critical timeline');
    } else if (request.urgency.startsWith('Urgent') && cityMatch) {
      score += 8;
    } else {
      score += 5;
    }

    if (score >= 40) {
      matches.push({
        resourceId: eq.id,
        resourceName: eq.name,
        resourceType: 'equipment',
        score: Math.min(score, 98),
        explanations: reasons,
        city: eq.city,
        serviceArea: eq.serviceArea,
        condition: eq.condition,
        item: eq
      });
    }
  });

  // Match against Medical Supplies
  suppliesList.forEach((sup) => {
    if (sup.status !== 'Available') return;

    let score = 0;
    const reasons: string[] = [];

    if (
      request.category === 'Medical supply assistance' ||
      (request.category.includes('supply') && sup.category.includes('Consumables')) ||
      (request.title.toLowerCase().includes('dressing') && sup.category.includes('Dressings')) ||
      (request.title.toLowerCase().includes('gloves') && sup.category.includes('Protective'))
    ) {
      score += 45;
      reasons.push(`Supply category match: "${sup.category}"`);
    }

    const cityMatch = sup.city.toLowerCase() === request.city.toLowerCase();
    if (cityMatch) {
      score += 25;
      reasons.push(`Available in ${sup.city}`);
    }

    if (sup.packagingCondition === 'Factory Sealed & Pristine') {
      score += 15;
      reasons.push('Factory sealed & pristine packaging condition');
    }

    if (sup.quantity >= request.quantityRequired) {
      score += 15;
      reasons.push(`Fulfills required quantity (${request.quantityRequired} requested, ${sup.quantity} available)`);
    }

    if (score >= 40) {
      matches.push({
        resourceId: sup.id,
        resourceName: `${sup.name} (${sup.quantity} ${sup.unit})`,
        resourceType: 'supply',
        score: Math.min(score, 96),
        explanations: reasons,
        city: sup.city,
        serviceArea: sup.serviceArea,
        condition: sup.packagingCondition,
        item: sup
      });
    }
  });

  return matches.sort((a, b) => b.score - a.score);
}
