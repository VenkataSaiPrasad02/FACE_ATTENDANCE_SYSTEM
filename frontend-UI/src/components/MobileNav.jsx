import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import {
  getPermittedMainLinks,
  getPermittedAdminLinks,
  getPermittedSystemLinks,
} from './navConfig';

/*
 * Mobile bottom navigation — the primary way phones move between pages.
 *
 * Design rules:
 *   - visible below lg (the desktop sidebar takes over from lg up)
 *   - fixed to the viewport bottom with safe-area padding
 *   - max five slots: four highest-priority links + a "More" button that
 *     opens the full-screen drawer (Sidebar) for everything else
 *   - 48px+ touch targets, icon + label, clear active state
 */

const MAX_TABS = 4;

export default function MobileNav() {
  const { role } = useAuth();
  const location = useLocation();

  const links = [
    ...getPermittedMainLinks(role),
    ...getPermittedAdminLinks(role),
    ...getPermittedSystemLinks(role),
  ];

  if (links.length === 0) return null;

  const tabs = links.slice(0, MAX_TABS);
  const overflowCount = links.length - tabs.length;

  const openDrawer = () => {
    window.dispatchEvent(new CustomEvent('open-mobile-sidebar'));
  };

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="
        fixed inset-x-0 bottom-0 z-40 lg:hidden
        border-t border-white/[0.08]
        bg-[#070b1c]/92 pb-safe shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.7)]
        backdrop-blur-xl
      "
    >
      <div className="mx-auto flex w-full max-w-lg items-stretch justify-around">
        {tabs.map(({ to, label, icon: Icon }) => {
          const isHome = to === '/';
          const active = isHome
            ? location.pathname === '/'
            : location.pathname === to ||
              location.pathname.startsWith(`${to}/`);

          return (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`
                relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5
                px-1 pt-1.5 text-[10px] font-semibold tracking-tight transition-colors

                ${active ? 'text-cyan-300' : 'text-slate-500 active:text-slate-300'}
              `}
            >
              {active && (
                <span
                  className="absolute top-0 h-0.5 w-8 rounded-b-full bg-gradient-to-r from-blue-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
                  aria-hidden="true"
                />
              )}

              <span
                className={`
                  flex h-7 w-7 items-center justify-center rounded-lg transition-colors
                  ${
                    active
                      ? 'bg-cyan-400/15 text-cyan-300'
                      : 'bg-transparent'
                  }
                `}
              >
                <Icon size={19} strokeWidth={active ? 2.3 : 1.9} />
              </span>

              <span className="max-w-full truncate">{label}</span>
            </NavLink>
          );
        })}

        {/* More — opens the full navigation drawer */}
        <button
          type="button"
          onClick={openDrawer}
          aria-label="Open full menu"
          className="
            relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5
            px-1 pt-1.5 text-[10px] font-semibold tracking-tight text-slate-500
            transition-colors active:text-slate-300
          "
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg">
            <Menu size={19} strokeWidth={1.9} />
          </span>

          <span>
            More
            {overflowCount > 0 && (
              <span className="ml-0.5 rounded-full bg-white/10 px-1 text-[9px] font-bold text-slate-300">
                +{overflowCount}
              </span>
            )}
          </span>
        </button>
      </div>
    </nav>
  );
}
