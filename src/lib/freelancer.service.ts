import { api } from "./api";

export const freelancerService = {
  getMyProfile: async () => {
    const response = await api.get("/freelancers/me");
    return response.data;
  },

  getFreelancerProfile: async (id: string) => {
    const response = await api.get(`/freelancers/${id}`);
    return response.data;
  },

  updateOnboardingStep1: async (data: {
    fullName: string;
    phoneNumber?: string;
    location: string;
    region: string;
    tagline: string;
  }) => {
    const response = await api.post("/freelancers/onboarding/step-1", data);
    return response.data;
  },

  updateOnboardingStep2: async (data: {
    hourlyRate: number;
    bio: string;
    availability: string;
    experienceLevel: string;
    preferredBudgetMin?: number;
    preferredBudgetMax?: number;
  }) => {
    const response = await api.post("/freelancers/onboarding/step-2", data);
    return response.data;
  },

  updateOnboardingStep3: async (data: {
    skills?: any[];
    education?: any[];
    certifications?: any[];
    languages?: any[];
    gigs?: any[];
    preferredCategories?: string[];
  }) => {
    const response = await api.post("/freelancers/onboarding/step-3", data);
    return response.data;
  },

  updateOnboardingStep5: async (data: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    website?: string;
    preferredCategories?: string[];
  }) => {
    const response = await api.post("/freelancers/onboarding/step-5", data);
    return response.data;
  },

  uploadOnboardingFiles: async (formData: FormData) => {
    const response = await api.post(
      "/freelancers/onboarding/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  updateFreelancerProfile: async (data: any) => {
    const response = await api.patch("/freelancers/profile", data);
    return response.data;
  },
};
