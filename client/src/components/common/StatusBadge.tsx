import React from 'react';

interface Props {
  status: string;
  type?: 'status' | 'employmentType' | 'leaveType';
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const getStyle = (val: string) => {
    switch (val) {
      case 'Active':
      case 'Present':
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
      case 'Inactive':
      case 'Absent':
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20';
      case 'On Leave':
      case 'Late':
      case 'Pending':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
      case 'Full-time':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
      case 'Part-time':
        return 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20';
      case 'Contract':
        return 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20';
      case 'Intern':
        return 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/20';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${getStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
};
