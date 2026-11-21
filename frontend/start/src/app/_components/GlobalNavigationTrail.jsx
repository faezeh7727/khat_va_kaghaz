"use client";

import { usePathname } from "next/navigation";
import NavigationTrail from "./NavigationTrail";

export default function GlobalNavigationTrail() {
  const pathname = usePathname() || "/";
  if (["/signin", "/signup"].includes(pathname)) return null;

  return (
    <div className="global-navigation-trail-shell">
      <NavigationTrail />
    </div>
  );
}
