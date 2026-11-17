import Link from "next/link";

export default function Logo({ variant = "default" }) {
  const stacked = variant === "stacked";

  return (
    <Link href="/" className={`flex shrink-0 ${stacked ? "flex-col items-center gap-1.5" : "items-center gap-3"}`} aria-label="خط و کاغذ">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-sm"><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21V5.5ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21V5.5Z" /></svg></span>
      <span className={stacked ? "text-center" : "text-right"}><strong className={`block font-black leading-tight text-text-primary ${stacked ? "text-xs" : "text-sm sm:text-base"}`}>خط و کاغذ</strong>{!stacked && <span className="block text-[10px] font-medium leading-5 text-text-light sm:text-xs">فصلنامه اندیشه و ادبیات</span>}</span>
    </Link>
  );
}
