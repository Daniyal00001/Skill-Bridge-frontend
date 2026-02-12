// TypeScript interfaces for SkillBridge Client Side Module
// Extends existing interfaces from mockData.ts with additional client-specific types

export type ProjectCategory =
  | 'web-development'
  | 'mobile-development'
  | 'ui-ux-design'
  | 'backend-development'
  | 'ai-ml'
  | 'devops'
  | 'data-science'
  | 'blockchain';

export type ProjectComplexity = 'Simple' | 'Medium' | 'Complex';

export type ProjectStatus = 'Open' | 'In Progress' | 'Completed' | 'Cancelled';

export type ProposalStatus = 'Pending' | 'Accepted' | 'Rejected';

export type MilestoneStatus = 'Pending' | 'In Progress' | 'Completed' | 'Released';

export type PaymentStatus = 'Escrow' | 'Released' | 'Refunded';

export type MessageType = 'text' | 'file' | 'system';

export type ExperienceLevel = 'Junior' | 'Mid' | 'Senior' | 'Expert';

export type AvailabilityStatus = 'Available' | 'Busy' | 'Unavailable';

// Core data models for the client module
export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  complexity: ProjectComplexity;
  skills: string[];
  deadline: Date;
  status: ProjectStatus;
  clientId: string;
  developerId?: string;
  proposalsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Developer {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  bio: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  completedProjects: number;
  hourlyRate: number;
  experienceLevel: ExperienceLevel;
  portfolio: PortfolioItem[];
  availability: AvailabilityStatus;
  joinedAt: Date;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  technologies: string[];
}

export interface Proposal {
  id: string;
  projectId: string;
  developerId: string;
  proposedPrice: number;
  deliveryTime: number; // in days
  coverLetter: string;
  status: ProposalStatus;
  submittedAt: Date;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: MilestoneStatus;
  deliverables: string[];
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  seen: boolean;
  messageType: MessageType;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  projectId?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
}

export interface Payment {
  id: string;
  projectId: string;
  milestoneId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transactionDate: Date;
  receiptUrl?: string;
}

export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  isBlind: boolean;
  createdAt: Date;
}

// UI Component Props interfaces
export interface ProjectCardProps {
  project: Project;
  onViewDetails: (id: string) => void;
  showStatus?: boolean;
}

export interface DeveloperCardProps {
  developer: Developer;
  onViewProfile: (id: string) => void;
  showInviteButton?: boolean;
}

export interface ProposalCardProps {
  proposal: Proposal;
  developer: Developer;
  onAccept: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
  onViewProfile?: (developerId: string) => void;
  onMessage?: (developerId: string) => void;
  isProcessing?: boolean;
}

export interface MilestoneCardProps {
  milestone: Milestone;
  onRelease: (milestoneId: string) => void;
  onMarkComplete: (milestoneId: string) => void;
  canRelease: boolean;
}

export interface ChatUIProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
  isTyping?: boolean;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

// Form data interfaces
export interface ProjectFormData {
  title: string;
  description: string;
  category: ProjectCategory;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  complexity?: ProjectComplexity;
  skills: string[];
  deadline: Date;
  visibility: 'public' | 'private';
}

export interface AIScoping {
  complexity: ProjectComplexity;
  budgetRange: {
    min: number;
    max: number;
  };
  suggestedSkills: string[];
  estimatedTimeline: string;
  confidence: number;
}

export interface DeveloperFilters {
  skills: string[];
  rating: number;
  experienceLevel: ExperienceLevel[];
  budgetRange: {
    min: number;
    max: number;
  };
  availability: AvailabilityStatus[];
}

export interface ProjectFilters {
  status: ProjectStatus[];
  complexity: ProjectComplexity[];
  budgetRange: {
    min: number;
    max: number;
  };
  skills: string[];
}

// Settings interfaces
export interface UserSettings {
  profile: {
    name: string;
    email: string;
    avatar: string;
    bio: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    projectUpdates: boolean;
    messageNotifications: boolean;
    proposalNotifications: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showLocation: boolean;
  };
}

// API Response interfaces (for future backend integration)
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error handling interfaces
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}