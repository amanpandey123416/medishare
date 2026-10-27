export type UserRole = 'patient' | 'donor' | 'ngo' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city: string;
  organizationName?: string;
  organizationType?: 'Hospital' | 'NGO' | 'Charity Clinic' | 'Community Trust';
  verificationStatus?: 'verified' | 'pending' | 'unverified' | 'rejected';
  verificationDocument?: string;
  isBloodDonorOptedIn?: boolean;
  bloodGroup?: string;
  joinedDate: string;
  suspended?: boolean;
}

export type EquipmentCategory =
  | 'Wheelchairs & Mobility'
  | 'Hospital Beds & Mattresses'
  | 'Walking Aids & Crutches'
  | 'Patient Transfer & Lifts'
  | 'Respiratory & Suction'
  | 'Bathroom & Hygiene Aids'
  | 'Monitoring & Non-Invasive';

export type EquipmentCondition = 'Brand New' | 'Gently Used / Certified' | 'Good Condition' | 'Requires Minor Service';

export type EquipmentListingStatus =
  | 'Available'
  | 'Requested'
  | 'Approved'
  | 'Handover Scheduled'
  | 'Handed Over'
  | 'Returned'
  | 'Under Maintenance'
  | 'Unavailable'
  | 'Withdrawn';

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  condition: EquipmentCondition;
  type: 'Lending' | 'Donation';
  status: EquipmentListingStatus;
  donorId: string;
  donorName: string;
  donorOrg?: string;
  city: string;
  serviceArea: string;
  description: string;
  imageUrl?: string;
  cleaningStatus: 'Sanitized & Inspected' | 'Cleaned' | 'Pending Disinfection';
  handlingInstructions?: string;
  maxLendingDays?: number;
  currentBorrowerId?: string;
  currentBorrowerName?: string;
  dateListed: string;
  requiresInspectionNotice?: boolean;
}

export type RequestUrgency = 'Critical (Within 24h)' | 'Urgent (1-3 Days)' | 'Standard (Within a Week)';

export type RequestStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Matched'
  | 'Assistance Arranged'
  | 'Completed'
  | 'Cancelled';

export interface AssistanceRequest {
  id: string;
  userId: string;
  userName: string;
  userContact: string;
  title: string;
  category: EquipmentCategory | 'Blood donor connection' | 'Hospital resource information' | 'Medical supply assistance' | 'Other non-diagnostic assistance';
  description: string;
  quantityRequired: number;
  city: string;
  serviceArea: string;
  urgency: RequestUrgency;
  requestedDate: string;
  contactPreference: 'Phone' | 'In-App Message' | 'Email';
  status: RequestStatus;
  assignedOrgId?: string;
  assignedOrgName?: string;
  matchedResourceId?: string;
  matchedResourceName?: string;
  notes?: string;
}

export interface BloodDonor {
  id: string;
  userId?: string;
  displayName: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  city: string;
  serviceArea: string;
  preferredContact: 'In-App Secure Chat' | 'Verified Phone Request' | 'Email Dispatch';
  availability: 'Available to Donate' | 'Temporarily Unavailable' | 'Recently Donated (Cooldown)';
  consentToParticipate: boolean;
  lastUpdated: string;
  totalDonations?: number;
  verifiedDonorBadge?: boolean;
}

export interface MedicalSupply {
  id: string;
  name: string;
  category: 'Unopened First-Aid' | 'Sterile Dressings & Bandages' | 'Personal Protective Equipment' | 'Non-Drug Diagnostic Consumables' | 'Sanitation & Disinfection';
  quantity: number;
  unit: string;
  packagingCondition: 'Factory Sealed & Pristine' | 'Original Intact Packaging';
  expiryDate: string;
  storageRequirements: string;
  city: string;
  serviceArea: string;
  donorOrg: string;
  donorId: string;
  status: 'Available' | 'Reserved' | 'Dispatched';
  dateListed: string;
}

export type FacilityCategory =
  | 'Hospital'
  | 'Blood Bank'
  | 'Licensed 24/7 Pharmacy'
  | 'Authorised Medicine Disposal Site'
  | 'Medical Equipment Lending Hub'
  | 'Charity Community Clinic';

export interface HealthcareFacility {
  id: string;
  name: string;
  category: FacilityCategory;
  address: string;
  city: string;
  phone: string;
  website?: string;
  operatingHours: string;
  verified: boolean;
  coordinates: [number, number]; // [lat, lng]
  services: string[];
}

export interface HandoverRecord {
  id: string;
  transactionCode: string;
  equipmentId: string;
  equipmentName: string;
  donorId: string;
  donorName: string;
  borrowerId: string;
  borrowerName: string;
  type: 'Lending' | 'Donation';
  status: 'Scheduled' | 'Handed Over' | 'Returned' | 'Cancelled';
  scheduledDate: string;
  handoverCompletedAt?: string;
  returnCompletedAt?: string;
  handoverNotes?: string;
  qrVerified: boolean;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'request' | 'handover' | 'approval' | 'verification' | 'system';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorName: string;
  actorRole: UserRole;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface EquipmentReview {
  id: string;
  equipmentId: string;
  transactionId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: UserRole;
  rating: number; // 1 to 5
  communicationRating: number;
  conditionRating: number;
  comment: string;
  date: string;
}

export type MedicinePackagingCondition =
  | 'Intact Blister / Strip'
  | 'Original Sealed Bottle'
  | 'Intact Foil'
  | 'Opened / Loose Pack'
  | 'Damaged Box / Broken Seal';

export type MedicineVerificationStatus =
  | 'Pending Verification'
  | 'Verified & Approved'
  | 'Flagged Unsafe'
  | 'Rejected'
  | 'Allocated to Pharmacy'
  | 'Dispatched';

export interface MedicineListing {
  id: string;
  medicineName: string;
  brand: string;
  strength: string; // e.g. "500 mg", "10 mg", "250 mg/5ml"
  dosageForm: 'Tablets' | 'Capsules' | 'Syrup (Sealed)' | 'Inhaler (Sealed)' | 'Eye/Ear Drops (Sealed)' | 'Ointment (Sealed)' | 'Other';
  quantity: number;
  unit: string; // e.g. "strips (10 tabs)", "bottles", "tablets", "inhalers"
  expiryDate: string; // YYYY-MM-DD
  batchNumber: string;
  packagingCondition: MedicinePackagingCondition;
  storageDetails: string;
  photoUrl?: string;
  pickupLocation: string;
  city: string;
  serviceArea: string;
  donorId: string;
  donorName: string;
  donorContact: string;
  verificationStatus: MedicineVerificationStatus;
  verificationNotes?: string;
  verifiedByOrgId?: string;
  verifiedByOrgName?: string;
  verifiedDate?: string;
  safetyFlags: {
    isExpired: boolean;
    isDamagedPackaging: boolean;
    isUnsafeStorage: boolean;
    isRecalledBatch?: boolean;
  };
  matchedRequestId?: string;
  dateListed: string;
}

export type MedicineRequestStatus =
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Dispensed';

export interface MedicineRequest {
  id: string;
  userId: string;
  userName: string;
  userContact: string;
  medicineName: string;
  strength: string;
  quantityNeeded: number;
  unit: string;
  prescriptionDetails?: string; // Doctor name, Rx reference, clinical note
  city: string;
  serviceArea: string;
  urgency: 'Critical (Within 24h)' | 'Urgent (1-3 Days)' | 'Standard (Within a Week)';
  status: MedicineRequestStatus;
  assignedOrgId?: string;
  assignedOrgName?: string;
  matchedListingId?: string;
  matchedListingName?: string;
  reviewNotes?: string;
  requestDate: string;
}

