'use client';

import { User } from '@/lib/api/users';
import { useAuth } from '@/context/AuthContext';

interface Props {
  onClose: () => void;
}

export function AccountSwitcher({ onClose }: Props) {
  const { user, users, switchUser, isLoading } = useAuth();

  const handleSwitch = async (target: User) => {
    if (target.id === user?.id) return;
    await switchUser(target);
    onClose();
  };

  return (
    <div className="absolute right-full top-0 mr-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
      {users.map((u) => (
        <button
          key={u.id}
          onClick={() => handleSwitch(u)}
          disabled={isLoading}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {u.name.charAt(0).toUpperCase()}
          </div>
          <span className="flex-1 truncate text-gray-700">{u.name}</span>
          {u.id === user?.id && (
            <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
