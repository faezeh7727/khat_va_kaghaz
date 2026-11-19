/** @format */

"use client";

import { useCallback, useRef, useState } from "react";
import DesktopNav from "@/components/DesktopNav";
import MobileMenu from "@/components/MobileMenu";
import Logo from "@/ui/Logo";
import LoginButton from "@/ui/LoginButton";
import ThemeToggle from "@/ui/ThemeToggle";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import ButtonIcon from "@/ui/buttonicon";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { isLoading, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <>
      <header
        dir="rtl"
        className={`site-header sticky top-0 z-20 text-text-primary transition-all duration-200 ${isLoading ? "blur-sm opacity-70" : "blur-0 opacity-100"}`}
      >
        <div className="mx-auto my-2 flex h-[60px] w-full max-w-[1440px] items-center gap-4 px-3 sm:gap-5 sm:px-5 lg:px-8">
          <Logo />
          <DesktopNav />
          <div className="ms-auto flex items-center gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              <LoginButton />
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-3 lg:hidden">
              <span className={`header-theme-control${user ? " header-theme-control--account" : ""}`}>
                <ThemeToggle />
              </span>
              {user && <LoginButton mobile />}
              <ButtonIcon
                ref={menuButtonRef}
                type="button"
                aria-label={isMenuOpen ? "بستن منو" : "باز کردن منو"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="mobile-menu-toggle"
                variant="outline"
              >
                {isMenuOpen ? <XMarkIcon aria-hidden="true" /> : <Bars3Icon aria-hidden="true" />}
              </ButtonIcon>
            </div>
          </div>
        </div>
        <div id="mobile-navigation">
          <MobileMenu
            isOpen={isMenuOpen}
            onClose={closeMenu}
            ignoredRefs={[menuButtonRef]}
          />
        </div>
      </header>
    </>
  );
}
