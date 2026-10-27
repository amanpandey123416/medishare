import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  EquipmentItem,
  AssistanceRequest,
  BloodDonor,
  MedicalSupply,
  HealthcareFacility,
  HandoverRecord,
  InAppNotification,
  AuditLog,
  EquipmentReview,
  MedicineListing,
  MedicineRequest
} from '../types';
import {
  SAMPLE_USERS,
  SAMPLE_EQUIPMENT,
  SAMPLE_BLOOD_DONORS,
  SAMPLE_REQUESTS,
  SAMPLE_ORGANIZATIONS,
  SAMPLE_SUPPLIES,
  SAMPLE_FACILITIES,
  SAMPLE_HANDOVERS,
  SAMPLE_NOTIFICATIONS,
  SAMPLE_AUDIT_LOGS,
  SAMPLE_REVIEWS,
  SAMPLE_MEDICINES,
  SAMPLE_MEDICINE_REQUESTS
} from '../data/sampleData';
import { autoVerifyMedicineSafety, findMedicineMatchesForRequest } from '../utils/medicineMatcher';

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  setCurrentRole: (role: UserRole) => void;
  setCurrentUser: (user: UserProfile) => void;
  equipment: EquipmentItem[];
  addEquipment: (item: Omit<EquipmentItem, 'id' | 'dateListed'>) => EquipmentItem;
  requestEquipment: (equipmentId: string, borrowerNotes?: string) => { success: boolean; handover?: HandoverRecord; message: string };
  approveEquipmentRequest: (equipmentId: string, scheduledDate: string) => { success: boolean; handover?: HandoverRecord };
  rejectEquipmentRequest: (equipmentId: string, reason: string) => void;
  confirmHandover: (transactionCode: string, notes?: string) => { success: boolean; message: string; record?: HandoverRecord };
  confirmReturn: (transactionCode: string, notes?: string) => { success: boolean; message: string; record?: HandoverRecord };
  updateEquipmentStatus: (equipmentId: string, status: EquipmentItem['status']) => void;

  requests: AssistanceRequest[];
  createAssistanceRequest: (req: Omit<AssistanceRequest, 'id' | 'requestedDate' | 'status'>) => AssistanceRequest;
  updateRequestStatus: (requestId: string, status: AssistanceRequest['status'], notes?: string) => void;
  assignMatchedResource: (requestId: string, resourceId: string, resourceName: string) => void;

  bloodDonors: BloodDonor[];
  registerBloodDonor: (donor: Omit<BloodDonor, 'id' | 'lastUpdated'>) => BloodDonor;
  toggleDonorAvailability: (donorId: string, availability: BloodDonor['availability']) => void;

  supplies: MedicalSupply[];
  addMedicalSupply: (supply: Omit<MedicalSupply, 'id' | 'dateListed'>) => MedicalSupply;
  reserveSupply: (supplyId: string, quantity: number) => { success: boolean; message: string };

  medicines: MedicineListing[];
  addMedicineListing: (item: Omit<MedicineListing, 'id' | 'dateListed' | 'verificationStatus' | 'safetyFlags'>) => { listing: MedicineListing; autoSafetyCheck: ReturnType<typeof autoVerifyMedicineSafety> };
  verifyMedicineDonation: (medicineId: string, decision: 'Approved' | 'Rejected', notes: string) => { success: boolean; message: string };
  medicineRequests: MedicineRequest[];
  createMedicineRequest: (req: Omit<MedicineRequest, 'id' | 'requestDate' | 'status'>) => { request: MedicineRequest; matchesFound: number };
  updateMedicineRequestStatus: (requestId: string, status: MedicineRequest['status'], notes?: string) => void;
  allocateMedicineToRequest: (requestId: string, listingId: string) => { success: boolean; message: string };

  facilities: HealthcareFacility[];
  handovers: HandoverRecord[];
  notifications: InAppNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string) => void;

  reviews: EquipmentReview[];
  addReview: (review: Omit<EquipmentReview, 'id' | 'date'>) => { success: boolean; message: string };

  organizations: typeof SAMPLE_ORGANIZATIONS;
  verifyOrganization: (orgId: string, status: boolean) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;
  resetToSampleData: () => void;
}

const STORAGE_PREFIX = 'medishare_data_v1_';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Load from LocalStorage or initialize with samples
  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'currentUser');
    return saved ? JSON.parse(saved) : SAMPLE_USERS[0]; // defaults to patient
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'allUsers');
    return saved ? JSON.parse(saved) : SAMPLE_USERS;
  });

  const [equipment, setEquipment] = useState<EquipmentItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'equipment');
    return saved ? JSON.parse(saved) : SAMPLE_EQUIPMENT;
  });

  const [requests, setRequests] = useState<AssistanceRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'requests');
    return saved ? JSON.parse(saved) : SAMPLE_REQUESTS;
  });

  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'bloodDonors');
    return saved ? JSON.parse(saved) : SAMPLE_BLOOD_DONORS;
  });

  const [supplies, setSupplies] = useState<MedicalSupply[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'supplies');
    return saved ? JSON.parse(saved) : SAMPLE_SUPPLIES;
  });

  const [facilities] = useState<HealthcareFacility[]>(SAMPLE_FACILITIES);

  const [handovers, setHandovers] = useState<HandoverRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'handovers');
    return saved ? JSON.parse(saved) : SAMPLE_HANDOVERS;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'notifications');
    return saved ? JSON.parse(saved) : SAMPLE_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'auditLogs');
    return saved ? JSON.parse(saved) : SAMPLE_AUDIT_LOGS;
  });

  const [reviews, setReviews] = useState<EquipmentReview[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'reviews');
    return saved ? JSON.parse(saved) : SAMPLE_REVIEWS;
  });

  const [organizations, setOrganizations] = useState<typeof SAMPLE_ORGANIZATIONS>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'organizations');
    return saved ? JSON.parse(saved) : SAMPLE_ORGANIZATIONS;
  });

  const [medicines, setMedicines] = useState<MedicineListing[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'medicines');
    return saved ? JSON.parse(saved) : SAMPLE_MEDICINES;
  });

  const [medicineRequests, setMedicineRequests] = useState<MedicineRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'medicineRequests');
    return saved ? JSON.parse(saved) : SAMPLE_MEDICINE_REQUESTS;
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'allUsers', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'bloodDonors', JSON.stringify(bloodDonors));
  }, [bloodDonors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'supplies', JSON.stringify(supplies));
  }, [supplies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'handovers', JSON.stringify(handovers));
  }, [handovers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'organizations', JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'medicineRequests', JSON.stringify(medicineRequests));
  }, [medicineRequests]);

  // Role switching
  const setCurrentRole = (role: UserRole) => {
    const matchingUser = allUsers.find((u) => u.role === role);
    if (matchingUser) {
      setCurrentUserState(matchingUser);
      addAuditLog('ROLE_SWITCH', `Switched active session to ${matchingUser.name} (${role})`);
    } else {
      // Create a default role mock user
      const newUser: UserProfile = {
        id: `user-${role}-auto`,
        name: `${role.toUpperCase()} User`,
        email: `${role}@medishare.org`,
        role,
        city: 'Mumbai',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      setAllUsers((prev) => [...prev, newUser]);
      setCurrentUserState(newUser);
    }
  };

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
    if (!allUsers.find((u) => u.id === user.id)) {
      setAllUsers((prev) => [...prev, user]);
    }
  };

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '127.0.0.1 (Local Verified)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (userId: string, title: string, message: string, type: InAppNotification['type'], linkTab?: string) => {
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      type,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
      linkTab,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Equipment Actions
  const addEquipment = (itemData: Omit<EquipmentItem, 'id' | 'dateListed'>) => {
    const newItem: EquipmentItem = {
      ...itemData,
      id: `eq-${Date.now()}`,
      dateListed: new Date().toISOString().split('T')[0],
    };
    setEquipment((prev) => [newItem, ...prev]);
    addAuditLog('EQUIPMENT_LISTED', `Added listing: "${newItem.name}" (${newItem.category}) in ${newItem.city}`);
    addNotification(
      currentUser.id,
      'Listing Published',
      `Your equipment "${newItem.name}" is now listed and discoverable for community assistance.`,
      'approval',
      'equipment'
    );
    return newItem;
  };

  const requestEquipment = (equipmentId: string, borrowerNotes?: string) => {
    const target = equipment.find((e) => e.id === equipmentId);
    if (!target) return { success: false, message: 'Equipment item not found.' };

    if (target.status !== 'Available') {
      return { success: false, message: `Cannot reserve: Equipment is currently ${target.status}.` };
    }

    // Check if current user already has a pending or active request for this equipment
    const existingHandover = handovers.find(
      (h) => h.equipmentId === equipmentId && (h.status === 'Scheduled' || h.status === 'Handed Over')
    );
    if (existingHandover) {
      return { success: false, message: 'Equipment is already reserved or handed over for this timeframe.' };
    }

    // Update equipment status
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === equipmentId
          ? {
              ...e,
              status: 'Requested',
              currentBorrowerId: currentUser.id,
              currentBorrowerName: currentUser.name,
            }
          : e
      )
    );

    const transactionCode = `MS-HO-${Math.floor(100000 + Math.random() * 900000)}`;
    const newHandover: HandoverRecord = {
      id: `ho-${Date.now()}`,
      transactionCode,
      equipmentId: target.id,
      equipmentName: target.name,
      donorId: target.donorId,
      donorName: target.donorName,
      borrowerId: currentUser.id,
      borrowerName: currentUser.name,
      type: target.type,
      status: 'Scheduled',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      handoverNotes: borrowerNotes || 'Request submitted through MediShare web platform.',
      qrVerified: false,
    };

    setHandovers((prev) => [newHandover, ...prev]);

    // Notify donor & borrower
    addNotification(
      target.donorId,
      'New Equipment Request Received',
      `${currentUser.name} requested "${target.name}". Handover code ${transactionCode} created.`,
      'request',
      'dashboard'
    );
    addNotification(
      currentUser.id,
      'Equipment Request Submitted',
      `Your reservation for "${target.name}" is pending donor approval. Handover code: ${transactionCode}`,
      'handover',
      'dashboard'
    );

    addAuditLog(
      'EQUIPMENT_REQUESTED',
      `${currentUser.name} requested "${target.name}" from ${target.donorName} [Code: ${transactionCode}]`
    );

    return { success: true, handover: newHandover, message: 'Equipment requested successfully!' };
  };

  const approveEquipmentRequest = (equipmentId: string, scheduledDate: string) => {
    setEquipment((prev) =>
      prev.map((e) => (e.id === equipmentId ? { ...e, status: 'Handover Scheduled' } : e))
    );

    let updatedHandover: HandoverRecord | undefined;
    setHandovers((prev) =>
      prev.map((h) => {
        if (h.equipmentId === equipmentId && h.status === 'Scheduled') {
          updatedHandover = { ...h, scheduledDate };
          return updatedHandover;
        }
        return h;
      })
    );

    const eq = equipment.find((e) => e.id === equipmentId);
    if (eq && eq.currentBorrowerId) {
      addNotification(
        eq.currentBorrowerId,
        'Equipment Request Approved',
        `Your request for "${eq.name}" has been approved for handover on ${scheduledDate}. Present QR code at collection.`,
        'approval',
        'dashboard'
      );
    }

    addAuditLog('EQUIPMENT_APPROVED', `Donor approved handover schedule for equipment ${equipmentId}`);
    return { success: true, handover: updatedHandover };
  };

  const rejectEquipmentRequest = (equipmentId: string, reason: string) => {
    const eq = equipment.find((e) => e.id === equipmentId);
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === equipmentId
          ? {
              ...e,
              status: 'Available',
              currentBorrowerId: undefined,
              currentBorrowerName: undefined,
            }
          : e
      )
    );

    setHandovers((prev) =>
      prev.map((h) => (h.equipmentId === equipmentId && h.status === 'Scheduled' ? { ...h, status: 'Cancelled' } : h))
    );

    if (eq && eq.currentBorrowerId) {
      addNotification(
        eq.currentBorrowerId,
        'Equipment Request Update',
        `Your request for "${eq.name}" could not be approved at this time: ${reason}`,
        'request',
        'equipment'
      );
    }
    addAuditLog('EQUIPMENT_REJECTED', `Request for ${equipmentId} was declined by donor (${reason})`);
  };

  const confirmHandover = (transactionCode: string, notes?: string) => {
    const target = handovers.find(
      (h) => h.transactionCode.toLowerCase() === transactionCode.toLowerCase()
    );
    if (!target) {
      return { success: false, message: 'No matching transaction code found.' };
    }

    if (target.status === 'Handed Over') {
      return { success: false, message: 'This equipment handover has already been confirmed.' };
    }
    if (target.status === 'Returned') {
      return { success: false, message: 'This transaction is already marked as returned and closed.' };
    }

    const now = new Date().toISOString();
    const updatedRecord: HandoverRecord = {
      ...target,
      status: 'Handed Over',
      handoverCompletedAt: now,
      handoverNotes: notes ? `${target.handoverNotes} | ${notes}` : target.handoverNotes,
      qrVerified: true,
    };

    setHandovers((prev) => prev.map((h) => (h.id === target.id ? updatedRecord : h)));

    // Update equipment
    setEquipment((prev) =>
      prev.map((e) => (e.id === target.equipmentId ? { ...e, status: 'Handed Over' } : e))
    );

    addAuditLog(
      'QR_HANDOVER_CONFIRMED',
      `Handover verified via QR code for ${target.equipmentName} (${target.transactionCode})`
    );

    addNotification(
      target.borrowerId,
      'Handover Confirmed',
      `Physical receipt of "${target.equipmentName}" verified. You may submit a review after use.`,
      'approval',
      'dashboard'
    );
    addNotification(
      target.donorId,
      'Handover Completed',
      `Handover for "${target.equipmentName}" successfully completed. Transaction: ${target.transactionCode}`,
      'handover',
      'dashboard'
    );

    return { success: true, message: 'Handover verified and recorded successfully!', record: updatedRecord };
  };

  const confirmReturn = (transactionCode: string, notes?: string) => {
    const target = handovers.find(
      (h) => h.transactionCode.toLowerCase() === transactionCode.toLowerCase()
    );
    if (!target) return { success: false, message: 'Transaction record not found.' };

    if (target.status !== 'Handed Over') {
      return { success: false, message: `Cannot return: Current transaction status is "${target.status}".` };
    }

    const now = new Date().toISOString();
    const updatedRecord: HandoverRecord = {
      ...target,
      status: 'Returned',
      returnCompletedAt: now,
      handoverNotes: notes ? `${target.handoverNotes} | Return: ${notes}` : target.handoverNotes,
    };

    setHandovers((prev) => prev.map((h) => (h.id === target.id ? updatedRecord : h)));

    // Update equipment to Available and mark for sanitation inspection
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === target.equipmentId
          ? {
              ...e,
              status: 'Available',
              currentBorrowerId: undefined,
              currentBorrowerName: undefined,
              cleaningStatus: 'Sanitized & Inspected',
            }
          : e
      )
    );

    addAuditLog(
      'EQUIPMENT_RETURNED',
      `Loaned item "${target.equipmentName}" returned by ${target.borrowerName}. Sanitization inspection scheduled.`
    );

    addNotification(
      target.donorId,
      'Equipment Returned',
      `"${target.equipmentName}" has been safely returned by borrower. Inspection complete.`,
      'approval',
      'equipment'
    );
    addNotification(
      target.borrowerId,
      'Return Receipt Acknowledged',
      `Thank you for returning "${target.equipmentName}" in good condition. Your loan record is closed.`,
      'approval',
      'dashboard'
    );

    return { success: true, message: 'Equipment return confirmed and marked Available for next patient!', record: updatedRecord };
  };

  const updateEquipmentStatus = (equipmentId: string, status: EquipmentItem['status']) => {
    setEquipment((prev) => prev.map((e) => (e.id === equipmentId ? { ...e, status } : e)));
    addAuditLog('EQUIPMENT_STATUS_UPDATE', `Equipment ${equipmentId} status changed to ${status}`);
  };

  // Assistance Request Actions
  const createAssistanceRequest = (reqData: Omit<AssistanceRequest, 'id' | 'requestedDate' | 'status'>) => {
    const newReq: AssistanceRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
    };
    setRequests((prev) => [newReq, ...prev]);

    addAuditLog('ASSISTANCE_REQUEST_CREATED', `New request for "${newReq.title}" by ${newReq.userName} (${newReq.urgency})`);

    addNotification(
      currentUser.id,
      'Assistance Request Submitted',
      `Your request for "${newReq.title}" has been submitted for review. Nearby organisations notified.`,
      'request',
      'requests'
    );

    return newReq;
  };

  const updateRequestStatus = (requestId: string, status: AssistanceRequest['status'], notes?: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              notes: notes ? (r.notes ? `${r.notes} | ${notes}` : notes) : r.notes,
            }
          : r
      )
    );

    const targetReq = requests.find((r) => r.id === requestId);
    if (targetReq) {
      addNotification(
        targetReq.userId,
        `Assistance Request: ${status}`,
        `Your request "${targetReq.title}" status has changed to "${status}".`,
        'request',
        'requests'
      );
    }

    addAuditLog('REQUEST_STATUS_UPDATED', `Request ${requestId} status updated to ${status}`);
  };

  const assignMatchedResource = (requestId: string, resourceId: string, resourceName: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Matched',
              matchedResourceId: resourceId,
              matchedResourceName: resourceName,
              assignedOrgName: currentUser.organizationName || 'MediShare Verified Network',
            }
          : r
      )
    );

    const targetReq = requests.find((r) => r.id === requestId);
    if (targetReq) {
      addNotification(
        targetReq.userId,
        'Resource Matched to Your Request',
        `We have matched "${resourceName}" to your request "${targetReq.title}".`,
        'approval',
        'requests'
      );
    }

    addAuditLog('RESOURCE_MATCHED', `Assistance request ${requestId} matched with resource "${resourceName}"`);
  };

  // Blood Donor Actions
  const registerBloodDonor = (donorData: Omit<BloodDonor, 'id' | 'lastUpdated'>) => {
    const newDonor: BloodDonor = {
      ...donorData,
      id: `bd-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      totalDonations: 0,
    };
    setBloodDonors((prev) => [newDonor, ...prev]);

    // Update currentUser opt-in flag
    setCurrentUserState((prev) => ({
      ...prev,
      isBloodDonorOptedIn: true,
      bloodGroup: donorData.bloodGroup,
    }));

    addAuditLog('BLOOD_DONOR_OPTED_IN', `User opted in as blood donor (${donorData.bloodGroup}, ${donorData.city})`);

    addNotification(
      currentUser.id,
      'Blood Donor Registration Confirmed',
      `Thank you for opting in as a voluntary blood donor (${donorData.bloodGroup}). Your contact details remain confidential.`,
      'system',
      'blood-donors'
    );

    return newDonor;
  };

  const toggleDonorAvailability = (donorId: string, availability: BloodDonor['availability']) => {
    setBloodDonors((prev) =>
      prev.map((d) => (d.id === donorId ? { ...d, availability, lastUpdated: new Date().toISOString().split('T')[0] } : d))
    );
    addAuditLog('BLOOD_DONOR_AVAILABILITY', `Donor ${donorId} availability set to ${availability}`);
  };

  // Medical Supply Actions
  const addMedicalSupply = (supplyData: Omit<MedicalSupply, 'id' | 'dateListed'>) => {
    const newSupply: MedicalSupply = {
      ...supplyData,
      id: `sup-${Date.now()}`,
      dateListed: new Date().toISOString().split('T')[0],
    };
    setSupplies((prev) => [newSupply, ...prev]);
    addAuditLog('SUPPLY_LISTED', `Medical supply listed: "${newSupply.name}" (${newSupply.quantity} ${newSupply.unit})`);
    return newSupply;
  };

  const reserveSupply = (supplyId: string, quantity: number) => {
    const target = supplies.find((s) => s.id === supplyId);
    if (!target) return { success: false, message: 'Supply item not found.' };

    if (target.quantity < quantity) {
      return { success: false, message: `Only ${target.quantity} units available.` };
    }

    setSupplies((prev) =>
      prev.map((s) =>
        s.id === supplyId
          ? {
              ...s,
              quantity: s.quantity - quantity,
              status: s.quantity - quantity === 0 ? 'Dispatched' : 'Available',
            }
          : s
      )
    );

    addAuditLog('SUPPLY_RESERVED', `Reserved ${quantity} units of ${target.name} for assistance`);
    return { success: true, message: `Successfully allocated ${quantity} units of ${target.name}.` };
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Reviews
  const addReview = (reviewData: Omit<EquipmentReview, 'id' | 'date'>) => {
    const existing = reviews.find(
      (r) => r.transactionId === reviewData.transactionId && r.reviewerId === reviewData.reviewerId
    );
    if (existing) {
      return { success: false, message: 'You have already submitted a review for this transaction.' };
    }

    const newRev: EquipmentReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [newRev, ...prev]);
    addAuditLog('REVIEW_SUBMITTED', `Feedback posted for transaction ${reviewData.transactionId} (Rating: ${reviewData.rating}/5)`);
    return { success: true, message: 'Thank you! Your verified feedback has been submitted.' };
  };

  // Admin / Organization Verification
  const verifyOrganization = (orgId: string, status: boolean) => {
    setOrganizations((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, verified: status } : o))
    );
    addAuditLog(
      status ? 'ORGANIZATION_APPROVED' : 'ORGANIZATION_REJECTED',
      `Admin updated verification status for organization ${orgId} to ${status ? 'Verified' : 'Rejected'}`
    );
  };

  // Leftover Medicine Actions
  const addMedicineListing = (itemData: Omit<MedicineListing, 'id' | 'dateListed' | 'verificationStatus' | 'safetyFlags'>) => {
    // 1. Run automated safety verification
    const autoSafety = autoVerifyMedicineSafety({
      expiryDate: itemData.expiryDate,
      packagingCondition: itemData.packagingCondition,
      storageDetails: itemData.storageDetails,
      batchNumber: itemData.batchNumber,
    });

    const isFlaggedUnsafe = !autoSafety.isSafeToReview;
    const initialStatus: MedicineListing['verificationStatus'] = isFlaggedUnsafe
      ? 'Flagged Unsafe'
      : 'Pending Verification';

    const newListing: MedicineListing = {
      ...itemData,
      id: `med-${Date.now()}`,
      dateListed: new Date().toISOString().split('T')[0],
      verificationStatus: initialStatus,
      verificationNotes: isFlaggedUnsafe
        ? `AUTOMATED SAFETY REJECTION: ${autoSafety.issues.join(' | ')}`
        : undefined,
      safetyFlags: {
        isExpired: autoSafety.isExpired,
        isDamagedPackaging: autoSafety.isDamagedPackaging,
        isUnsafeStorage: autoSafety.isUnsafeStorage,
        isRecalledBatch: autoSafety.isRecalledBatch,
      },
    };

    setMedicines((prev) => [newListing, ...prev]);

    addAuditLog(
      'MEDICINE_DONATION_SUBMITTED',
      `Submitted "${newListing.brand} (${newListing.medicineName} ${newListing.strength})". Status: ${initialStatus}`
    );

    addNotification(
      currentUser.id,
      isFlaggedUnsafe ? 'Medicine Listing Flagged Unsafe' : 'Medicine Submitted for Review',
      isFlaggedUnsafe
        ? `Your medicine "${newListing.brand}" was automatically flagged due to: ${autoSafety.issues[0]}. Ineligible for redistribution.`
        : `Your leftover medicine "${newListing.brand}" is queued for professional verification by an authorized healthcare organisation.`,
      isFlaggedUnsafe ? 'system' : 'approval',
      'medicines'
    );

    // If safe, also check if any existing pending medicine requests match this new listing!
    if (!isFlaggedUnsafe) {
      medicineRequests.forEach((req) => {
        if (req.status === 'Pending' || req.status === 'Under Review') {
          const matches = findMedicineMatchesForRequest(req, [newListing]);
          if (matches.length > 0) {
            addNotification(
              req.userId,
              'Potential Medicine Match Found',
              `A new verified medicine donation ("${newListing.brand} ${newListing.strength}") closely matches your pending request. Healthcare coordinators notified.`,
              'approval',
              'medicines'
            );
          }
        }
      });
    }

    return { listing: newListing, autoSafetyCheck: autoSafety };
  };

  const verifyMedicineDonation = (medicineId: string, decision: 'Approved' | 'Rejected', notes: string) => {
    const target = medicines.find((m) => m.id === medicineId);
    if (!target) return { success: false, message: 'Medicine listing not found.' };

    const newStatus: MedicineListing['verificationStatus'] = decision === 'Approved'
      ? 'Verified & Approved'
      : 'Rejected';

    setMedicines((prev) =>
      prev.map((m) =>
        m.id === medicineId
          ? {
              ...m,
              verificationStatus: newStatus,
              verificationNotes: notes,
              verifiedByOrgId: currentUser.id,
              verifiedByOrgName: currentUser.organizationName || currentUser.name,
              verifiedDate: new Date().toISOString().split('T')[0],
            }
          : m
      )
    );

    addAuditLog(
      'MEDICINE_VERIFIED',
      `Decision: ${decision} for "${target.brand} (${target.medicineName})" by ${currentUser.name} (${notes})`
    );

    addNotification(
      target.donorId,
      `Medicine Donation ${decision}`,
      `Your leftover medicine listing "${target.brand}" was ${decision.toLowerCase()} by ${currentUser.organizationName || 'authorised organisation'}. Notes: ${notes}`,
      decision === 'Approved' ? 'approval' : 'system',
      'medicines'
    );

    return { success: true, message: `Medicine listing successfully marked as ${newStatus}.` };
  };

  const createMedicineRequest = (reqData: Omit<MedicineRequest, 'id' | 'requestDate' | 'status'>) => {
    const newReq: MedicineRequest = {
      ...reqData,
      id: `mreq-${Date.now()}`,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };

    // Run smart matcher against current approved medicines
    const potentialMatches = findMedicineMatchesForRequest(newReq, medicines);
    let matchedListing: MedicineListing | undefined;

    if (potentialMatches.length > 0) {
      matchedListing = potentialMatches[0].listing;
      newReq.matchedListingId = matchedListing.id;
      newReq.matchedListingName = `${matchedListing.brand} (${matchedListing.strength})`;
      newReq.status = 'Under Review'; // Coordinator notified to review
    }

    setMedicineRequests((prev) => [newReq, ...prev]);

    addAuditLog(
      'MEDICINE_REQUESTED',
      `Patient ${newReq.userName} requested "${newReq.medicineName} ${newReq.strength}". Matches found: ${potentialMatches.length}`
    );

    addNotification(
      currentUser.id,
      'Medicine Request Submitted',
      potentialMatches.length > 0
        ? `Your request for "${newReq.medicineName}" was submitted and linked with potential donation "${matchedListing?.brand}". Awaiting pharmacist review.`
        : `Your request for "${newReq.medicineName}" has been submitted to authorized health organisations.`,
      'request',
      'medicines'
    );

    return { request: newReq, matchesFound: potentialMatches.length };
  };

  const updateMedicineRequestStatus = (requestId: string, status: MedicineRequest['status'], notes?: string) => {
    setMedicineRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              reviewNotes: notes ? (r.reviewNotes ? `${r.reviewNotes} | ${notes}` : notes) : r.reviewNotes,
              assignedOrgName: currentUser.organizationName || r.assignedOrgName,
            }
          : r
      )
    );

    const target = medicineRequests.find((r) => r.id === requestId);
    if (target) {
      addNotification(
        target.userId,
        `Medicine Request: ${status}`,
        `Your request for "${target.medicineName}" status updated to ${status}. ${notes ? `(${notes})` : ''}`,
        'request',
        'medicines'
      );
    }

    addAuditLog('MEDICINE_REQUEST_STATUS', `Request ${requestId} status updated to ${status}`);
  };

  const allocateMedicineToRequest = (requestId: string, listingId: string) => {
    const req = medicineRequests.find((r) => r.id === requestId);
    const med = medicines.find((m) => m.id === listingId);
    if (!req || !med) return { success: false, message: 'Request or Medicine record not found.' };

    setMedicineRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Approved',
              matchedListingId: med.id,
              matchedListingName: `${med.brand} (${med.strength})`,
              assignedOrgName: currentUser.organizationName || 'Authorized Pharmacy Partner',
              reviewNotes: 'Allocated by authorized coordinator for prescription verification and pharmacy dispensation.',
            }
          : r
      )
    );

    setMedicines((prev) =>
      prev.map((m) =>
        m.id === listingId
          ? {
              ...m,
              verificationStatus: 'Allocated to Pharmacy',
              matchedRequestId: req.id,
            }
          : m
      )
    );

    addNotification(
      req.userId,
      'Medicine Allocation Approved',
      `Your request for "${req.medicineName}" has been approved! Ready for pickup at ${med.pickupLocation} upon presenting your valid physical prescription.`,
      'approval',
      'medicines'
    );

    addNotification(
      med.donorId,
      'Donated Medicine Allocated',
      `Your donation of "${med.brand}" has been verified and allocated to a patient under supervision of ${currentUser.organizationName || 'authorized clinic'}.`,
      'approval',
      'medicines'
    );

    addAuditLog(
      'MEDICINE_ALLOCATED',
      `Allocated medicine ${med.id} (${med.brand}) to request ${req.id} (${req.userName})`
    );

    return { success: true, message: 'Medicine allocated to request and routed for lawful pharmacy dispensation!' };
  };

  // Reset to initial sample data
  const resetToSampleData = () => {
    setEquipment(SAMPLE_EQUIPMENT);
    setRequests(SAMPLE_REQUESTS);
    setBloodDonors(SAMPLE_BLOOD_DONORS);
    setSupplies(SAMPLE_SUPPLIES);
    setHandovers(SAMPLE_HANDOVERS);
    setNotifications(SAMPLE_NOTIFICATIONS);
    setAuditLogs(SAMPLE_AUDIT_LOGS);
    setReviews(SAMPLE_REVIEWS);
    setOrganizations(SAMPLE_ORGANIZATIONS);
    setMedicines(SAMPLE_MEDICINES);
    setMedicineRequests(SAMPLE_MEDICINE_REQUESTS);
    setCurrentUserState(SAMPLE_USERS[0]);
    setAllUsers(SAMPLE_USERS);
    localStorage.clear();
    addAuditLog('SYSTEM_RESET', 'Demonstration database reset to initial verified sample data state.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentRole,
        setCurrentUser,
        equipment,
        addEquipment,
        requestEquipment,
        approveEquipmentRequest,
        rejectEquipmentRequest,
        confirmHandover,
        confirmReturn,
        updateEquipmentStatus,
        requests,
        createAssistanceRequest,
        updateRequestStatus,
        assignMatchedResource,
        bloodDonors,
        registerBloodDonor,
        toggleDonorAvailability,
        supplies,
        addMedicalSupply,
        reserveSupply,
        medicines,
        addMedicineListing,
        verifyMedicineDonation,
        medicineRequests,
        createMedicineRequest,
        updateMedicineRequestStatus,
        allocateMedicineToRequest,
        facilities,
        handovers,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        auditLogs,
        addAuditLog,
        reviews,
        addReview,
        organizations,
        verifyOrganization,
        activeTab,
        setActiveTab,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
