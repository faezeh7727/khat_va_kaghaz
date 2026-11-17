
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookOpenIcon, HomeIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import NavLink from "@/components/Navlink";

const navItems = [
  { href: "/", title: "خانه" },
  { href: "/blogs", title: "بلاگ" },
  { href: "/about", title: "درباره ما" },
];

const navIcons = {
  "/": HomeIcon,
  "/blogs": BookOpenIcon,
  "/about": InformationCircleIcon,
};

export default function DesktopNav() {
  const pathname = usePathname();
  const navRef = useRef(null);
  const linkRefs = useRef({});
  const [indicator, setIndicator] = useState(null);

  const activeHref = navItems.find((item) => (
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
  ))?.href;

  useEffect(() => {
    const updateIndicator = () => {
      const nav = navRef.current;
      const activeLink = activeHref ? linkRefs.current[activeHref] : null;

      if (!nav || !activeLink) return;

      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setIndicator({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeHref]);

  return (
    <nav
      ref={navRef}
      className="desktop-nav hidden items-center gap-8 lg:flex"
      aria-label="ناوبری اصلی"
    >
      {indicator && (
        <span
          className="desktop-nav-indicator"
          aria-hidden="true"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
      {navItems.map((item) => {
        const Icon = navIcons[item.href];
        return (
          <NavLink
            key={item.href}
            path={item.href}
            ref={(element) => { linkRefs.current[item.href] = element; }}
            className="desktop-nav-link relative z-10"
            activeClassName="is-active"
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}
