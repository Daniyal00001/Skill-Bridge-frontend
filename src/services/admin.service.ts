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
  isPhoneVerified: boolean;
  isPaymentVerified: boolean;
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
}

export const adminService = {
  getUserProfile: async (userId: string) => {
    const res = await api.get<{ success: boolean; user: AdminUserProfile }>(
      `/admin/users/${userId}/profile`
    );
    return res.data.user;
  },
};
