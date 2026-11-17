"use client";

import { useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import useOutsideClick from "@/hooks/useOutsideClick";
import LoginButton from "@/ui/LoginButton";
import NavLink from "@/components/Navlink";
import { useAuth } from "@/context/AuthContext";
import { BookOpenIcon, HomeIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

const links = [
  { href: "/", label: "خانه" },
  { href: "/blogs", label: "بلاگ" },
  { href: "/about", label: "درباره ما" },
];

const navIcons = {
  "/": HomeIcon,
  "/blogs": BookOpenIcon,
  "/about": InformationCircleIcon,
};

export default function MobileMenu({ isOpen, onClose, ignoredRefs = [] }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const menuRef = useRef(null);
  const closeMenu = useCallback(() => onClose(), [onClose]);
  useOutsideClick(menuRef, closeMenu, isOpen, ignoredRefs);

  if (!isOpen) return null;

  return (
    <nav ref={menuRef} className="overflow-visible rounded-b-[1.25rem] border-t border-border-light bg-background-card px-3 py-2 shadow-lg lg:hidden" aria-label="ناوبری موبایل">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-1 text-right">
        {links.map((link) => {
          const isActive = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = navIcons[link.href];
          return (
            <NavLink
              key={link.href}
              path={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-500 ${isActive ? "bg-background-light text-accent-600" : "text-text-secondary hover:bg-background-light hover:text-accent-600"}`}
              onClick={onClose}
            >
              <Icon className="h-5 w-5 shrink-0 text-current" aria-hidden="true" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
        {!user && <div className="mt-1 border-t border-border-light pt-2"><LoginButton mobile /></div>}
      </div>
    </nav>
  );
}
