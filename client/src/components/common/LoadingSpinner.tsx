import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<Props> = ({ text = 'Loading...', size = 'md', fullPage = false }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <Loader2 className={`${sizeMap[size]} text-indigo-600 animate-spin`} />
      {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
