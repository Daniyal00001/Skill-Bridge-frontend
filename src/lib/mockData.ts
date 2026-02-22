// Mock data for SkillBridge platform

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'client' | 'freelancer' | 'admin';
  createdAt: string;
}

export interface Freelancer {
  id: string;
  name: string;
  avatar: string;
  title: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  availability: 'available' | 'busy' | 'unavailable';
  bio: string;
  location: string;
  portfolio: PortfolioItem[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: { min: number; max: number };
  complexity: 'simple' | 'moderate' | 'complex';
  skills: string[];
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  clientId: string;
  freelancerId?: string;
  createdAt: string;
  deadline?: string;
  proposalCount: number;
}

export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancer: Freelancer;
  coverLetter: string;
  proposedBudget: number;
  estimatedDuration: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'proposal' | 'message' | 'project' | 'payment' | 'review';
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'client',
    createdAt: '2024-01-15',
  },
  {
    id: 'user-2',
    name: 'Alex Chen',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'freelancer',
    createdAt: '2024-02-20',
  },
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@skillbridge.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'admin',
    createdAt: '2024-01-01',
  },
];

// Mock Freelancers
export const mockFreelancers: Freelancer[] = [
  {
    id: 'dev-1',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    title: 'Full Stack Developer',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    hourlyRate: 85,
    rating: 4.9,
    reviewCount: 47,
    completedProjects: 52,
    availability: 'available',
    bio: 'Passionate full-stack developer with 8+ years of experience building scalable web applications.',
    location: 'San Francisco, CA',
    portfolio: [],
  },
  {
    id: 'dev-2',
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    title: 'UI/UX Designer & Developer',
    skills: ['Figma', 'React', 'Tailwind CSS', 'Next.js', 'Framer Motion'],
    hourlyRate: 75,
    rating: 5.0,
    reviewCount: 38,
    completedProjects: 41,
    availability: 'available',
    bio: 'Design-focused developer creating beautiful, user-friendly interfaces.',
    location: 'New York, NY',
    portfolio: [],
  },
  {
    id: 'dev-3',
    name: 'Marcus Johnson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    title: 'Backend Specialist',
    skills: ['Python', 'Django', 'FastAPI', 'Docker', 'Kubernetes'],
    hourlyRate: 95,
    rating: 4.8,
    reviewCount: 29,
    completedProjects: 34,
    availability: 'busy',
    bio: 'Backend engineer specializing in high-performance, distributed systems.',
    location: 'Austin, TX',
    portfolio: [],
  },
  {
    id: 'dev-4',
    name: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Mobile Developer',
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
    hourlyRate: 80,
    rating: 4.7,
    reviewCount: 23,
    completedProjects: 28,
    availability: 'available',
    bio: 'Mobile-first developer building cross-platform apps that users love.',
    location: 'Seattle, WA',
    portfolio: [],
  },
  {
    id: 'dev-5',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    title: 'AI/ML Engineer',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI', 'LangChain'],
    hourlyRate: 120,
    rating: 4.9,
    reviewCount: 18,
    completedProjects: 21,
    availability: 'available',
    bio: 'AI engineer helping businesses leverage machine learning and LLMs.',
    location: 'Boston, MA',
    portfolio: [],
  },
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'E-commerce Platform Redesign',
    description: 'Looking for a skilled developer to redesign our existing e-commerce platform with modern UI/UX, improved performance, and mobile responsiveness.',
    budget: { min: 5000, max: 10000 },
    complexity: 'complex',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    status: 'open',
    clientId: 'user-1',
    createdAt: '2024-01-10',
    deadline: '2024-03-15',
    proposalCount: 8,
  },
  {
    id: 'proj-2',
    title: 'Mobile App for Fitness Tracking',
    description: 'Need a React Native developer to build a fitness tracking app with workout logging, progress charts, and social features.',
    budget: { min: 8000, max: 15000 },
    complexity: 'complex',
    skills: ['React Native', 'Firebase', 'Node.js'],
    status: 'in_progress',
    clientId: 'user-1',
    freelancerId: 'dev-4',
    createdAt: '2024-01-05',
    deadline: '2024-04-01',
    proposalCount: 12,
  },
  {
    id: 'proj-3',
    title: 'Landing Page for SaaS Product',
    description: 'Quick turnaround needed for a modern, animated landing page for our new SaaS product launch.',
    budget: { min: 1500, max: 3000 },
    complexity: 'simple',
    skills: ['React', 'Tailwind CSS', 'Framer Motion'],
    status: 'open',
    clientId: 'user-1',
    createdAt: '2024-01-12',
    deadline: '2024-02-01',
    proposalCount: 15,
  },
  {
    id: 'proj-4',
    title: 'AI Chatbot Integration',
    description: 'Integrate an AI-powered customer support chatbot into our existing web application using OpenAI APIs.',
    budget: { min: 4000, max: 7000 },
    complexity: 'moderate',
    skills: ['Python', 'OpenAI', 'React', 'Node.js'],
    status: 'open',
    clientId: 'user-1',
    createdAt: '2024-01-08',
    deadline: '2024-02-28',
    proposalCount: 6,
  },
  {
    id: 'proj-5',
    title: 'Dashboard Analytics System',
    description: 'Build a comprehensive analytics dashboard with real-time data visualization and reporting features.',
    budget: { min: 6000, max: 12000 },
    complexity: 'complex',
    skills: ['React', 'D3.js', 'PostgreSQL', 'GraphQL'],
    status: 'completed',
    clientId: 'user-1',
    freelancerId: 'dev-1',
    createdAt: '2023-11-01',
    deadline: '2024-01-15',
    proposalCount: 9,
  },
];

// Mock Proposals
export const mockProposals: Proposal[] = [
  {
    id: 'prop-1',
    projectId: 'proj-1',
    freelancerId: 'dev-1',
    freelancer: mockFreelancers[0],
    coverLetter: 'I have extensive experience in e-commerce platforms and would love to bring your vision to life with modern technologies and best practices.',
    proposedBudget: 8500,
    estimatedDuration: '6 weeks',
    status: 'pending',
    createdAt: '2024-01-11',
  },
  {
    id: 'prop-2',
    projectId: 'proj-1',
    freelancerId: 'dev-2',
    freelancer: mockFreelancers[1],
    coverLetter: 'As a UI/UX focused developer, I can ensure your platform not only functions well but looks stunning and provides an exceptional user experience.',
    proposedBudget: 7800,
    estimatedDuration: '5 weeks',
    status: 'pending',
    createdAt: '2024-01-11',
  },
  {
    id: 'prop-3',
    projectId: 'proj-3',
    freelancerId: 'dev-2',
    freelancer: mockFreelancers[1],
    coverLetter: 'Landing pages are my specialty! I can create an eye-catching, conversion-optimized page with smooth animations.',
    proposedBudget: 2200,
    estimatedDuration: '1 week',
    status: 'pending',
    createdAt: '2024-01-13',
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'proposal',
    title: 'New Proposal Received',
    description: 'Alex Chen submitted a proposal for your E-commerce Platform project',
    read: false,
    createdAt: '2024-01-11T10:30:00Z',
    link: '/client/projects/proj-1',
  },
  {
    id: 'notif-2',
    type: 'message',
    title: 'New Message',
    description: 'Emma Wilson sent you a message about the Landing Page project',
    read: false,
    createdAt: '2024-01-11T09:15:00Z',
    link: '/messages',
  },
  {
    id: 'notif-3',
    type: 'project',
    title: 'Project Milestone Completed',
    description: 'Your Fitness App project has reached 50% completion',
    read: true,
    createdAt: '2024-01-10T14:00:00Z',
    link: '/client/projects/proj-2',
  },
];

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: {
      id: 'msg-1',
      senderId: 'user-2',
      receiverId: 'user-1',
      content: 'I can start working on the project next week. Does that work for you?',
      createdAt: '2024-01-11T15:30:00Z',
      read: false,
    },
    unreadCount: 2,
  },
];

// Mock Stats for Dashboards
export const clientDashboardStats = {
  activeProjects: 3,
  totalSpent: 24500,
  pendingProposals: 14,
  completedProjects: 8,
};

export const freelancerDashboardStats = {
  activeBids: 5,
  totalEarnings: 45200,
  completedProjects: 52,
  averageRating: 4.9,
};

export const adminDashboardStats = {
  totalUsers: 1247,
  activeProjects: 342,
  totalRevenue: 892000,
  disputesOpen: 3,
  newUsersThisMonth: 89,
  projectsThisMonth: 156,
};
