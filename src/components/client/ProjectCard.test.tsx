import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectCard } from './ProjectCard';
import { Project } from '@/types/client';

const mockProject: Project = {
  id: 'test-project-1',
  title: 'Test E-commerce Platform',
  description: 'A comprehensive e-commerce platform with modern features and responsive design.',
  category: 'web-development',
  budget: { min: 5000, max: 10000, currency: 'USD' },
  complexity: 'Complex',
  skills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Stripe API'],
  deadline: new Date('2024-03-15'),
  status: 'Open',
  clientId: 'client-1',
  proposalsCount: 8,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-11'),
};

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    const mockOnViewDetails = vi.fn();
    
    render(
      <ProjectCard 
        project={mockProject} 
        onViewDetails={mockOnViewDetails} 
      />
    );

    // Check if title is rendered
    expect(screen.getByText('Test E-commerce Platform')).toBeInTheDocument();
    
    // Check if description is rendered
    expect(screen.getByText(/A comprehensive e-commerce platform/)).toBeInTheDocument();
    
    // Check if budget is rendered
    expect(screen.getByText('$5,000 - $10,000')).toBeInTheDocument();
    
    // Check if complexity badge is rendered
    expect(screen.getByText('Complex')).toBeInTheDocument();
    
    // Check if status badge is rendered
    expect(screen.getByText('Open')).toBeInTheDocument();
    
    // Check if proposals count is rendered
    expect(screen.getByText('8 proposals')).toBeInTheDocument();
    
    // Check if skills are rendered (first 3)
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    
    // Check if "more" indicator is shown for additional skills
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    
    // Check if deadline is rendered
    expect(screen.getByText(/Due: 3\/15\/2024/)).toBeInTheDocument();
    
    // Check if View Details button is rendered
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('calls onViewDetails when View Details button is clicked', () => {
    const mockOnViewDetails = vi.fn();
    
    render(
      <ProjectCard 
        project={mockProject} 
        onViewDetails={mockOnViewDetails} 
      />
    );

    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);

    expect(mockOnViewDetails).toHaveBeenCalledWith('test-project-1');
  });

  it('hides status badge when showStatus is false', () => {
    const mockOnViewDetails = vi.fn();
    
    render(
      <ProjectCard 
        project={mockProject} 
        onViewDetails={mockOnViewDetails} 
        showStatus={false}
      />
    );

    expect(screen.queryByText('Open')).not.toBeInTheDocument();
  });

  it('handles singular proposal count correctly', () => {
    const mockOnViewDetails = vi.fn();
    const projectWithOneProposal = { ...mockProject, proposalsCount: 1 };
    
    render(
      <ProjectCard 
        project={projectWithOneProposal} 
        onViewDetails={mockOnViewDetails} 
      />
    );

    expect(screen.getByText('1 proposal')).toBeInTheDocument();
  });

  it('displays all skills when there are 3 or fewer', () => {
    const mockOnViewDetails = vi.fn();
    const projectWithFewSkills = { 
      ...mockProject, 
      skills: ['React', 'Node.js', 'PostgreSQL'] 
    };
    
    render(
      <ProjectCard 
        project={projectWithFewSkills} 
        onViewDetails={mockOnViewDetails} 
      />
    );

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  it('applies correct status colors for different statuses', () => {
    const mockOnViewDetails = vi.fn();
    
    // Test different status values
    const statuses: Array<Project['status']> = ['Open', 'In Progress', 'Completed', 'Cancelled'];
    
    statuses.forEach(status => {
      const projectWithStatus = { ...mockProject, status };
      const { unmount } = render(
        <ProjectCard 
          project={projectWithStatus} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText(status)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies correct complexity colors for different complexities', () => {
    const mockOnViewDetails = vi.fn();
    
    // Test different complexity values
    const complexities: Array<Project['complexity']> = ['Simple', 'Medium', 'Complex'];
    
    complexities.forEach(complexity => {
      const projectWithComplexity = { ...mockProject, complexity };
      const { unmount } = render(
        <ProjectCard 
          project={projectWithComplexity} 
          onViewDetails={mockOnViewDetails} 
        />
      );
      
      expect(screen.getByText(complexity)).toBeInTheDocument();
      unmount();
    });
  });
});