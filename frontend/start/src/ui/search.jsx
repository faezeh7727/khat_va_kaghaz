"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

export default function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamString = searchParams.toString();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const isTyping = useRef(false);
  const debounceTimer = useRef(null);
  const clearAfterSubmit = useRef(false);
  const suppressDebounceUntilInput = useRef(false);

  useEffect(() => {
    if (clearAfterSubmit.current) {
      clearAfterSubmit.current = false;
      return;
    }
    if (isTyping.current) {
      return;
    }
    setSearchValue(new URLSearchParams(searchParamString).get("search") || "");
  }, [searchParamString]);

  useEffect(() => {
    if (suppressDebounceUntilInput.current) {
      return;
    }

    const value = searchValue.trim();
    const currentValue = new URLSearchParams(searchParamString).get("search") || "";

    if (value === currentValue) {
      isTyping.current = false;
      return;
    }

    debounceTimer.current = setTimeout(() => {
      const newParams = new URLSearchParams(searchParamString);
      if (value) newParams.set("search", value);
      else newParams.delete("search");

      const queryString = newParams.toString();
      isTyping.current = false;
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    }, 350);

    return () => clearTimeout(debounceTimer.current);
  }, [pathname, router, searchParamString, searchValue]);

  function handleSubmit(event) {
    event.preventDefault();
    clearTimeout(debounceTimer.current);
    const newParams = new URLSearchParams(searchParamString);
    const value = searchValue.trim();

    if (value) newParams.set("search", value);
    else newParams.delete("search");

    const queryString = newParams.toString();
    isTyping.current = false;
    clearAfterSubmit.current = queryString !== searchParamString;
    suppressDebounceUntilInput.current = true;
    setSearchValue("");
    if (queryString !== searchParamString) {
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    }
  }

  return (
    <form className="post-search" onSubmit={handleSubmit} role="search">
      <label className="sr-only" htmlFor="post-search-input">
        جست‌وجوی نوشته‌ها
      </label>
      <input
        className="post-search-input"
        id="post-search-input"
        type="search"
        name="search"
        placeholder="جست‌وجو..."
        autoComplete="off"
        value={searchValue}
        onChange={(event) => {
          suppressDebounceUntilInput.current = false;
          isTyping.current = true;
          setSearchValue(event.target.value);
        }}
      />
      <button className="post-search-submit" type="submit" aria-label="جست‌وجو">
        <MagnifyingGlassIcon aria-hidden="true" />
      </button>
    </form>
  );
}
