import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-border border-dashed bg-surface/50">
      <h3 className="text-lg font-display text-primary mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
};
