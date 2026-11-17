/** @format */

"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";

export default function SiteHeader() {
  const pathname = usePathname();

  if (pathname === "/signin" || pathname === "/signup") return null;

  return <Header />;
}
