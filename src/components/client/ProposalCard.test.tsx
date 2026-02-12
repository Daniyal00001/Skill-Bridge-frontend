import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProposalCard } from './ProposalCard';
import { Proposal, Developer } from '@/types/client';

// Mock data for testing
const mockDeveloper: Developer = {
  id: 'dev-1',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  profileImage: 'https://example.com/avatar.jpg',
  bio: 'Experienced full-stack developer',
  skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
  rating: 4.9,
  reviewCount: 47,
  completedProjects: 52,
  hourlyRate: 85,
  experienceLevel: 'Senior',
  portfolio: [],
  availability: 'Available',
  joinedAt: new Date('2022-03-15'),
};

const mockProposal: Proposal = {
  id: 'prop-1',
  projectId: 'proj-1',
  developerId: 'dev-1',
  proposedPrice: 8500,
  deliveryTime: 42,
  coverLetter: 'I have extensive experience in e-commerce platforms and would love to bring your vision to life.',
  status: 'Pending',
  submittedAt: new Date('2024-01-11'),
};

const mockProps = {
  proposal: mockProposal,
  developer: mockDeveloper,
  onAccept: vi.fn(),
  onReject: vi.fn(),
  isProcessing: false,
};

describe('ProposalCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders proposal card with all required information', () => {
    render(<ProposalCard {...mockProps} />);

    // Check developer information
    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    expect(screen.getByText('4.9 (47 reviews)')).toBeInTheDocument();
    expect(screen.getByText('Senior')).toBeInTheDocument();
    expect(screen.getByText('52 projects completed')).toBeInTheDocument();

    // Check proposal information
    expect(screen.getByText('8,500')).toBeInTheDocument();
    expect(screen.getByText('Total Price')).toBeInTheDocument();
    expect(screen.getByText('42 days')).toBeInTheDocument();
    expect(screen.getByText('delivery')).toBeInTheDocument();

    // Check cover letter
    expect(screen.getByText('Cover Letter')).toBeInTheDocument();
    expect(screen.getByText(mockProposal.coverLetter)).toBeInTheDocument();

    // Check hourly rate reference
    expect(screen.getByText('Usually charges $85/hour')).toBeInTheDocument();

    // Check skills
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();

    // Check action buttons
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept proposal/i })).toBeInTheDocument();
  });

  it('calls onAccept when accept button is clicked', () => {
    render(<ProposalCard {...mockProps} />);
    
    const acceptButton = screen.getByRole('button', { name: /accept proposal/i });
    fireEvent.click(acceptButton);

    expect(mockProps.onAccept).toHaveBeenCalledWith('prop-1');
  });

  it('calls onReject when reject button is clicked', () => {
    render(<ProposalCard {...mockProps} />);
    
    const rejectButton = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(rejectButton);

    expect(mockProps.onReject).toHaveBeenCalledWith('prop-1');
  });

  it('shows loading state when isProcessing is true', () => {
    render(<ProposalCard {...mockProps} isProcessing={true} />);

    const acceptButton = screen.getByRole('button', { name: /accept proposal/i });
    const rejectButton = screen.getByRole('button', { name: /reject/i });

    expect(acceptButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();
  });

  it('displays correct experience level badge color', () => {
    const seniorDeveloper = { ...mockDeveloper, experienceLevel: 'Senior' as const };
    render(<ProposalCard {...mockProps} developer={seniorDeveloper} />);

    const badge = screen.getByText('Senior');
    expect(badge).toHaveClass('bg-warning/20', 'text-warning', 'border-warning/20');
  });

  it('displays correct availability indicator', () => {
    render(<ProposalCard {...mockProps} />);
    
    // Check that the developer name is present (which confirms the component rendered)
    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    
    // Check that the availability indicator span is present with correct class
    const availabilityIndicator = document.querySelector('.bg-success');
    expect(availabilityIndicator).toBeInTheDocument();
  });

  it('shows skills with overflow indicator when more than 6 skills', () => {
    const developerWithManySkills = {
      ...mockDeveloper,
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL', 'Python']
    };
    
    render(<ProposalCard {...mockProps} developer={developerWithManySkills} />);

    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('formats delivery time correctly', () => {
    const proposalWithDifferentDelivery = { ...mockProposal, deliveryTime: 14 };
    render(<ProposalCard {...mockProps} proposal={proposalWithDifferentDelivery} />);

    expect(screen.getByText('14 days')).toBeInTheDocument();
  });

  it('formats proposed price with proper locale formatting', () => {
    const expensiveProposal = { ...mockProposal, proposedPrice: 15000 };
    render(<ProposalCard {...mockProps} proposal={expensiveProposal} />);

    expect(screen.getByText('15,000')).toBeInTheDocument();
  });
});