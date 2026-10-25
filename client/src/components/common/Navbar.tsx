import React from 'react';
import { Menu, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<Props> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'HR Manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          System Online
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
              <div className="flex items-center justify-end space-x-1 mt-0.5">
                <span
                  className={`text-[11px] font-medium px-2 py-0.2 rounded-full border ${getRoleBadge(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm shadow-sm ring-2 ring-indigo-100">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="inline-flex items-center p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              aria-label="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
