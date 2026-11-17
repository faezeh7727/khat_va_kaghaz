"use client";

import { useRouter } from "next/navigation";

export default function useMoveBack(fallback = "/") {
  const router = useRouter();

  function moveBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallback);
  }

  return moveBack;
}
