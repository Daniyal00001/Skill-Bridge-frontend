import { api } from "@/lib/api";

export interface AdminUserProfile {
  id: string;
  email: string;
  name: string;
  role: "CLIENT" | "FREELANCER" | "ADMIN";
  profileImage?: string;
  createdAt: string;
  isEmailVerified: boolean;
  isIdVerified: boolean;
  idVerificationStatus?: "UNSUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  idRejectionReason?: string | null;
  isPhoneVerified: boolean;
  isPaymentVerified: boolean;
  isBanned: boolean;
  banReason?: string | null;
  lastActiveAt?: string;
  clientProfile?: {
    id: string;
    fullName?: string;
    company?: string;
    bio?: string;
    location?: string;
    projects: any[];
    _count: { projects: number };
  };
  freelancerProfile?: {
    id: string;
    fullName: string;
    tagline?: string;
    bio?: string;
    hourlyRate?: number;
    skills: any[];
    portfolioItems: any[];
    educations: any[];
    certificates: any[];
    _count: { reviews: number; gigs: number; contracts: number };
  };
  reviews: any[];
  disputeHistory: any[];
  _count?: {
    reviewsReceived: number;
    disputesAsClient: number;
    disputesAsFreelancer: number;
  };
}

export interface VerificationUser {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "FREELANCER";
  idDocumentUrl: string | null;
  idVerificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  idRejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface StatusCounts {
  ALL: number;
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
}

export const adminService = {
  getUserProfile: async (userId: string) => {
    const res = await api.get<{ success: boolean; user: AdminUserProfile }>(
      `/admin/users/${userId}/profile`
    );
    return res.data.user;
  },
  getPendingVerifications: async () => {
    const res = await api.get<{ success: boolean; users: VerificationUser[] }>(`/admin/verifications/pending`);
    return res.data.users;
  },
  getAllVerifications: async (status?: string) => {
    const params = status && status !== 'ALL' ? `?status=${status}` : '';
    const res = await api.get<{ success: boolean; users: VerificationUser[]; statusCounts: StatusCounts }>(`/admin/verifications${params}`);
    return res.data;
  },
  approveVerification: async (userId: string) => {
    const res = await api.post(`/admin/verifications/approve/${userId}`);
    return res.data;
  },
  rejectVerification: async (userId: string, reason: string) => {
    const res = await api.post(`/admin/verifications/reject/${userId}`, { reason });
    return res.data;
  },
  banUser: async (userId: string, ban: boolean, reason?: string) => {
    const res = await api.patch(`/admin/users/${userId}/ban`, { ban, reason });
    return res.data;
  }
};
