'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const COLORS = ['#e8e0d0', '#c8bfaf', '#d4a017', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#6b7280'];

interface TypeDistributionProps {
  data: any[];
}

export const TypeDistribution = ({ data }: TypeDistributionProps) => {
  return (
    <div className="card p-8">
      <h3 className="text-sm uppercase tracking-widest text-primary font-medium mb-8">Classification Analysis</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} 
              width={100}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: '0' }}
            />
            <Bar dataKey="value" fill="var(--color-accent)" radius={[0, 2, 2, 0]}>
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
