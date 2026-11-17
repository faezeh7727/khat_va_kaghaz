import Image from "next/image";

export default function Avatar({ avatarUrl, name = "کاربر", className = "" }) {
  return (
    <Image
      src={avatarUrl || "/image/avatar.png"}
      alt={`تصویر آواتار ${name}`}
      width={48}
      height={48}
      unoptimized
      className={className}
    />
  );
}
