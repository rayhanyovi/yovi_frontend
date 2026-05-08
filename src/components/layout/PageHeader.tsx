'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface Props {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  showBack?: boolean;
}

export function PageHeader({ title, breadcrumbs, actions, showBack = true }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-lg text-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ backgroundColor: '#4A8394' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 mt-0.5">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1 text-sm text-gray-500">
                  {i > 0 && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {crumb.href ? (
                    <a href={crumb.href} className="cursor-pointer hover:text-teal-600 transition-colors">{crumb.label}</a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
