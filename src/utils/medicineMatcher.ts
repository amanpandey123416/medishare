import { MedicineListing, MedicineRequest } from '../types';

export interface MedicineMatchResult {
  listing: MedicineListing;
  score: number; // 0 - 100
  reasons: string[];
  cityMatch: boolean;
  strengthMatch: boolean;
  verifiedByOrg: boolean;
}

// Known recalled batch list (demonstration data)
const RECALLED_BATCHES = ['REC-2024-001', 'LIP-BAD-99', 'AUG-RECALL-11'];

export function autoVerifyMedicineSafety(item: {
  expiryDate: string;
  packagingCondition: MedicineListing['packagingCondition'];
  storageDetails: string;
  batchNumber: string;
}): {
  isSafeToReview: boolean;
  isExpired: boolean;
  isDamagedPackaging: boolean;
  isUnsafeStorage: boolean;
  isRecalledBatch: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // 1. Expiration check
  const exp = new Date(item.expiryDate);
  const now = new Date();
  const isExpired = exp <= now;
  if (isExpired) {
    issues.push(`Medicine has EXPIRED on ${item.expiryDate}. Expired medicines undergo chemical decomposition and are prohibited from redistribution.`);
  }

  // 2. Packaging integrity check
  const isDamagedPackaging =
    item.packagingCondition === 'Opened / Loose Pack' ||
    item.packagingCondition === 'Damaged Box / Broken Seal';
  if (isDamagedPackaging) {
    issues.push(`Packaging condition is "${item.packagingCondition}". Medicine must be in factory-intact blister foil or sealed manufacturer bottles to guarantee sterile integrity.`);
  }

  // 3. Storage details check
  const storageLower = item.storageDetails.toLowerCase();
  const isUnsafeStorage =
    storageLower.includes('bathroom') ||
    storageLower.includes('sunlight') ||
    storageLower.includes('humid') ||
    storageLower.includes('car trunk') ||
    storageLower.includes('hot');
  if (isUnsafeStorage) {
    issues.push(`Storage details indicate improper environmental exposure (${item.storageDetails}). Moisture or heat causes molecular degradation.`);
  }

  // 4. Batch recall check
  const isRecalledBatch = RECALLED_BATCHES.includes(item.batchNumber.trim().toUpperCase());
  if (isRecalledBatch) {
    issues.push(`Batch ${item.batchNumber} appears on the pharmacovigilance safety recall notice.`);
  }

  const isSafeToReview = !isExpired && !isDamagedPackaging && !isUnsafeStorage && !isRecalledBatch;

  return {
    isSafeToReview,
    isExpired,
    isDamagedPackaging,
    isUnsafeStorage,
    isRecalledBatch,
    issues,
  };
}

export function findMedicineMatchesForRequest(
  request: MedicineRequest,
  listings: MedicineListing[]
): MedicineMatchResult[] {
  const results: MedicineMatchResult[] = [];
  const reqName = request.medicineName.toLowerCase();
  const reqStrength = request.strength.toLowerCase().replace(/\s+/g, '');

  listings.forEach((listing) => {
    // Only listings that are NOT expired and NOT flagged unsafe can be considered
    if (listing.verificationStatus === 'Flagged Unsafe' || listing.safetyFlags.isExpired) {
      return;
    }

    let score = 0;
    const reasons: string[] = [];

    const listName = listing.medicineName.toLowerCase();
    const listBrand = listing.brand.toLowerCase();
    const listStrength = listing.strength.toLowerCase().replace(/\s+/g, '');

    // 1. Name Match (Max 45 pts)
    if (listName === reqName || listBrand === reqName) {
      score += 45;
      reasons.push(`Exact medicine molecule/brand match ("${listing.brand} - ${listing.medicineName}")`);
    } else if (
      listName.includes(reqName) ||
      reqName.includes(listName) ||
      listBrand.includes(reqName) ||
      reqName.includes(listBrand)
    ) {
      score += 35;
      reasons.push(`Generic molecule alignment`);
    } else {
      // Split words (e.g. "Metformin", "Augmentin", "Salbutamol")
      const words = reqName.split(/\s+/).filter((w) => w.length > 3);
      const hasWordMatch = words.some((w) => listName.includes(w) || listBrand.includes(w));
      if (hasWordMatch) {
        score += 25;
        reasons.push(`Partial generic match`);
      } else {
        return; // No match at all
      }
    }

    // 2. Strength Match (Max 25 pts)
    const strengthMatch = listStrength === reqStrength || listStrength.includes(reqStrength) || reqStrength.includes(listStrength);
    if (strengthMatch) {
      score += 25;
      reasons.push(`Dosage strength aligns (${listing.strength})`);
    } else {
      reasons.push(`Strength differs: requested ${request.strength}, donor listed ${listing.strength} (requires physician verification)`);
    }

    // 3. Location Match (Max 20 pts)
    const cityMatch = listing.city.toLowerCase() === request.city.toLowerCase();
    if (cityMatch) {
      score += 15;
      reasons.push(`Available in the same city (${listing.city})`);
      if (
        request.serviceArea &&
        listing.serviceArea.toLowerCase().includes(request.serviceArea.toLowerCase())
      ) {
        score += 5;
        reasons.push(`Immediate neighborhood proximity (${request.serviceArea})`);
      }
    } else {
      reasons.push(`Inter-city transit required (${listing.city} to ${request.city})`);
    }

    // 4. Verification bonus (Max 10 pts)
    const verifiedByOrg = listing.verificationStatus === 'Verified & Approved';
    if (verifiedByOrg) {
      score += 10;
      reasons.push(`Verified by ${listing.verifiedByOrgName || 'Authorised Healthcare Organisation'}`);
    } else {
      score += 5;
      reasons.push(`Pending pharmacist inspection verification`);
    }

    if (score >= 40) {
      results.push({
        listing,
        score: Math.min(score, 99),
        reasons,
        cityMatch,
        strengthMatch,
        verifiedByOrg,
      });
    }
  });

  return results.sort((a, b) => b.score - a.score);
}
