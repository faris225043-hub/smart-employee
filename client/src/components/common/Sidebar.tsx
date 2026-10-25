import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarRange,
  FileBarChart2,
  X,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/employees', icon: Users },
    { label: 'Departments', path: '/departments', icon: Building2 },
    { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { label: 'Leaves', path: '/leaves', icon: CalendarRange },
    { label: 'Reports', path: '/reports', icon: FileBarChart2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">Smart EMS</span>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400">
                Enterprise Suite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1.5 px-3 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-3 right-3 rounded-xl bg-slate-800/80 p-4 border border-slate-700/60">
          <p className="text-xs font-semibold text-slate-200">Portfolio Grade Edition</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Powered by React 18, Express, Node.js &amp; MongoDB Atlas.
          </p>
        </div>
      </aside>
    </>
  );
};
