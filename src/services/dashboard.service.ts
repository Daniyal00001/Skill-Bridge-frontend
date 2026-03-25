import { api } from '@/lib/api';

export interface AdminDashboardData {
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    openProjects: number;
    inProgressProjects: number;
    completedProjects: number;
    disputedProjects: number;
    openDisputes: number;
    pendingSkills: number;
    pendingProposals: number;
    bannedUsers: number;
    totalRevenue: number;
  };
  lists: {
    recentUsers: any[];
    recentProjects: any[];
    activeDisputes: any[];
    pendingSkills: any[];
    recentAdminLogs: any[];
  };
}

export interface ClientDashboardData {
  stats: {
    activeProjects: number;
    completedProjects: number;
    disputedProjects: number;
    committedBudget: number;
    pendingProposals: number;
    shortlistedProposals: number;
  };
  lists: {
    openProjects: any[];
    recentProposals: any[];
    pendingInvitations: any[];
  };
}

export interface FreelancerDashboardData {
  stats: {
    activeProposals: number;
    shortlistedProposals: number;
    proposalsThisMonth: number;
    activeContractsCount: number;
    completedJobs: number;
    pendingInvitationsCount: number;
    totalEarnings: number;
    monthlyEarnings: number;
    skillTokenBalance: number;
    profileCompletion: number;
    averageRating: number;
    totalReviews: number;
  };
  lists: {
    activeMilestones: any[];
    recentTokenTxs: any[];
    activeProposals: any[];
  };
}

export const getAdminDashboardStats = async (): Promise<AdminDashboardData> => {
  const { data } = await api.get('/dashboard/admin');
  return data.data;
};

export const getClientDashboardStats = async (): Promise<ClientDashboardData> => {
  const { data } = await api.get('/dashboard/client');
  return data.data;
};

export const getFreelancerDashboardStats = async (): Promise<FreelancerDashboardData> => {
  const { data } = await api.get('/dashboard/freelancer');
  return data.data;
};
