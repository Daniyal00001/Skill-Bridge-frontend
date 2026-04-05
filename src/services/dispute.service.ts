import { api } from '@/lib/api';

const BASE_URL = '/disputes';

// ── Types ─────────────────────────────────────────────────────

export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'CLOSED';

export type DisputeResolution =
  | 'FAVOR_CLIENT'
  | 'FAVOR_FREELANCER'
  | 'PARTIAL_SPLIT'
  | 'PROJECT_CANCELLED'
  | 'DISMISSED';

export type DisputeType =
  | 'PAYMENT'
  | 'SCOPE'
  | 'DEADLINE'
  | 'QUALITY'
  | 'REVISION'
  | 'DELIVERABLES'
  | 'IP';

export interface DisputeUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  clientProfile?: { fullName: string; company?: string };
  freelancerProfile?: { fullName: string; tagline?: string };
}

export interface Dispute {
  id: string;
  projectId: string;
  clientId: string;
  freelancerId: string;
  adminId?: string;
  disputeType: DisputeType;
  filedBy: 'CLIENT' | 'FREELANCER';
  reason: string;
  details?: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolution?: DisputeResolution;
  resolutionNote?: string;
  openedAt: string;
  resolvedAt?: string;
  updatedAt: string;
  relatedDisputeId?: string;
  relatedDispute?: any;

  project?: {
    id: string;
    title: string;
    description: string;
    budget: number;
    budgetType: string;
    status: string;
    deadline?: string;
    experienceLevel: string;
    attachments: string[];
    createdAt: string;
    category?: { name: string };
    subCategory?: { name: string };
    skills?: { skill: { name: string } }[];
      contract?: {
        id: string;
        status: string;
        agreedPrice: number;
        startDate: string;
        endDate?: string;
        milestones: {
          id: string;
          title: string;
          description?: string;
          amount: number;
          status: string;
          dueDate?: string;
          revisionNote?: string;
          deliverables?: string;
          attachments: string[];
          history?: any;
          approvedAt?: string;
          submittedAt?: string;
        }[];
        chatRooms?: {
          id: string;
          messages: {
            id: string;
            content: string;
            type: string;
            fileUrl?: string;
            sentAt: string;
            sender: { name: string, profileImage?: string, role: string };
          }[];
        }[];
        freelancerProfile: {
          user: { name: string, profileImage?: string };
        };
      };
    proposals?: {
      id: string;
      coverLetter: string;
      proposedPrice: number;
      deliveryTime: number;
      attachments: string[];
    }[];
    chatRooms?: {
      id: string;
      messages: {
        id: string;
        content: string;
        type: string;
        fileUrl?: string;
        sentAt: string;
        sender: { name: string, profileImage?: string, role: string };
      }[];
    }[];
  };
  client?: DisputeUser;
  freelancer?: DisputeUser;
  admin?: { id: string; fullName: string };
}
export interface DisputeStats {
  open: number;
  underReview: number;
  resolved: number;
  closed: number;
}

interface GetAllDisputesParams {
  status?: DisputeStatus | '';
  type?: DisputeType | '';
  search?: string;
  page?: number;
  limit?: number;
}

// ── API Calls ─────────────────────────────────────────────────

export const getAllDisputes = async (params: GetAllDisputesParams = {}) => {
  const { data } = await api.get(`${BASE_URL}/`, { params });
  return data as {
    success: boolean;
    disputes: Dispute[];
    pagination: { total: number; page: number; limit: number };
    stats: DisputeStats;
  };
};

export const getDisputeById = async (id: string) => {
  const { data } = await api.get(`${BASE_URL}/${id}`);
  return data as { success: boolean; dispute: Dispute };
};

export const updateDisputeStatus = async (id: string, status: DisputeStatus) => {
  const { data } = await api.patch(`${BASE_URL}/${id}/status`, { status });
  return data as { success: boolean; dispute: Dispute };
};

export const resolveDispute = async (
  id: string,
  resolution: DisputeResolution,
  resolutionNote?: string
) => {
  const { data } = await api.patch(`${BASE_URL}/${id}/resolve`, { resolution, resolutionNote });
  return data as { success: boolean; dispute: Dispute; message: string };
};

export const createDispute = async (payload: {
  projectId: string;
  disputeType: DisputeType;
  reason: string;
  details?: string;
  evidenceUrls?: string[];
}) => {
  const { data } = await api.post(`${BASE_URL}/`, payload);
  return data as { success: boolean; dispute: Dispute; message: string };
};

export const getMyDispute = async (projectId: string) => {
  const { data } = await api.get(`${BASE_URL}/my/${projectId}`);
  return data as { success: boolean; dispute: Dispute };
};

// Frontend helper for the full detail page (uses Admin endpoint)
export const getDisputeFullDetail = async (id: string) => {
  const { data } = await api.get(`${BASE_URL}/${id}`);
  return data as { success: boolean; dispute: Dispute };
};
