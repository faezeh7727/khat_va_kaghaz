"use client";

import { useEffect, useState } from "react";

const persianDateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: "Asia/Tehran",
  year: "numeric",
  month: "numeric",
});

function toLatinDigits(value) {
  return Array.from(value).map((digit) => {
    const code = digit.codePointAt(0);
    return code >= 0x06f0 && code <= 0x06f9 ? String(code - 0x06f0) : digit;
  }).join("");
}

function getCurrentSeason() {
  const parts = persianDateFormatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const monthValue = parts.find((part) => part.type === "month")?.value || "";
  const month = Number(toLatinDigits(monthValue));
  const seasons = {
    1: "\u0628\u0647\u0627\u0631",
    2: "\u0628\u0647\u0627\u0631",
    3: "\u0628\u0647\u0627\u0631",
    4: "\u062a\u0627\u0628\u0633\u062a\u0627\u0646",
    5: "\u062a\u0627\u0628\u0633\u062a\u0627\u0646",
    6: "\u062a\u0627\u0628\u0633\u062a\u0627\u0646",
    7: "\u067e\u0627\u06cc\u06cc\u0632",
    8: "\u067e\u0627\u06cc\u06cc\u0632",
    9: "\u067e\u0627\u06cc\u06cc\u0632",
    10: "\u0632\u0645\u0633\u062a\u0627\u0646",
    11: "\u0632\u0645\u0633\u062a\u0627\u0646",
    12: "\u0632\u0645\u0633\u062a\u0627\u0646",
  };

  return year && seasons[month] ? seasons[month] + " " + year : "";
}

export default function CurrentSeason() {
  const [season, setSeason] = useState("");

  useEffect(() => {
    const updateSeason = () => setSeason(getCurrentSeason());
    updateSeason();
    const interval = window.setInterval(updateSeason, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return <span aria-live="polite">{season || "\u062a\u0642\u0648\u06cc\u0645 \u062c\u0627\u0631\u06cc"}</span>;
}
