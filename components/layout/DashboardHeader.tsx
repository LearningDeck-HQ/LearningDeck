import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const DashboardHeader = ({ title, description, children }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-xl font-medium text-[#1B2559] tracking-tight">{title}</h1>
        {description && <p className="text-[#A3AED0] text-xs mt-1">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
};
