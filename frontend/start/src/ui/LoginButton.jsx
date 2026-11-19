"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ArrowLeftStartOnRectangleIcon, BookmarkIcon, Squares2X2Icon, UserCircleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/ui/ThemeToggle";

export default function LoginButton({ mobile = false }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState(null);
  const menuRef = useRef(null);
  const panelRef = useRef(null);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const updatePanelPosition = useCallback(() => {
    const trigger = menuRef.current?.querySelector("button");
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const padding = 24;
    const width = Math.min(288, Math.max(0, window.innerWidth - padding * 2));
    const right = Math.max(padding, Math.min(window.innerWidth - rect.right, window.innerWidth - width - padding));
    setPanelPosition({ top: rect.bottom + 12, right, width });
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    updatePanelPosition();
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) closeMenu();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isOpen, updatePanelPosition]);

  function toggleMenu() {
    if (!isOpen) updatePanelPosition();
    setIsOpen((open) => !open);
  }

  if (!user) {
    return (
      <Link
        href="/signin"
        className={mobile ? "btn btn-secondary login-button w-full" : "login-button inline-flex h-10 items-center justify-center gap-2 rounded-full border-2 border-accent-500 px-4 text-sm font-bold text-accent-600 transition hover:bg-accent-500/10"}
      >
        <ArrowLeftStartOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
        <span>ورود</span>
      </Link>
    );
  }

  const displayName = user.name || user.fullName || user.username || "کاربر";
  const email = user.email || "";

  async function handleLogout() {
    setIsOpen(false);
    try {
      await logout();
      toast.success("با موفقیت خارج شدید");
      router.push("/");
    } catch (error) {
      toast.error(error.message || "خروج انجام نشد");
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="login-button inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-accent-500 bg-accent-500 text-white shadow-sm transition hover:bg-accent-600 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 active:scale-[0.97]"
        aria-label="نمایش منوی حساب کاربری"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
      >
        <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
      </button>

      {isOpen && panelPosition && typeof document !== "undefined" && createPortal(
        <section
          ref={panelRef}
          role="menu"
          aria-label="حساب کاربری"
          dir="rtl"
          style={{ position: "fixed", top: panelPosition.top, right: panelPosition.right, width: panelPosition.width, zIndex: 1000 }}
          className="max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-border-light bg-background-card p-2 text-text-primary shadow-xl"
        >
          <div className="account-panel-header flex items-center gap-3 border-b border-border-light px-3 py-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent-500/12 text-xl font-bold text-accent-600" aria-hidden="true">
              {displayName.trim().charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{displayName}</p>
              {email && <p className="mt-1 truncate text-xs text-text-secondary">{email}</p>}
            </div>
            <span className="account-panel-theme-toggle">
              <ThemeToggle />
            </span>
          </div>

          <Link
            href="/dashboard"
            role="menuitem"
            onClick={closeMenu}
            className="mt-2 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-text-secondary transition hover:bg-background-light hover:text-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-500"
          >
            <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
            داشبورد
          </Link>
          <Link
            href="/profile"
            role="menuitem"
            onClick={closeMenu}
            className="mt-2 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-text-secondary transition hover:bg-background-light hover:text-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-500"
          >
            <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
            حساب کاربری
          </Link>
          <Link
            href="/bookmarks"
            role="menuitem"
            onClick={closeMenu}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-text-secondary transition hover:bg-background-light hover:text-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-500"
          >
            <BookmarkIcon className="h-5 w-5" aria-hidden="true" />
            نوشته‌های ذخیره‌شده
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-text-secondary transition hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          >
            <ArrowLeftStartOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
            خروج
          </button>
        </section>,
        document.body,
      )}
    </div>
  );
}
