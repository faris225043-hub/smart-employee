import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination as PaginationType } from '../../types';

interface Props {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<Props> = ({ pagination, onPageChange }) => {
  const { page, totalPages, totalRecords, limit } = pagination;

  if (totalPages <= 1) return null;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-slate-200 sm:px-6">
      <div className="text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{startRecord}</span> to{' '}
        <span className="font-semibold text-slate-900">{endRecord}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalRecords}</span> entries
      </div>

      <div className="inline-flex items-center -space-x-px rounded-md shadow-sm">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-l-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-slate-300">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-r-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next Page"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
