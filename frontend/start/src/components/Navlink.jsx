"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";

const NavLink = forwardRef(function NavLink({ path, children, className = "", activeClassName = "", onClick, ...linkProps }, ref) {
  const pathname = usePathname();
  const isActive = path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <Link
      ref={ref}
      className={`${className} ${isActive ? activeClassName : ""}`.trim()}
      href={path}
      onClick={onClick}
      {...linkProps}
    >
      {children}
    </Link>
  );
});

export default NavLink;
