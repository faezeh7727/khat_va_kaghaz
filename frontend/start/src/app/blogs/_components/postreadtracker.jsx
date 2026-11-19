"use client";

import { useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Authservice from "@/services/Authservice";
import useActiveTimeTracking from "@/hooks/useActiveTimeTracking";

export default function PostReadTracker({ postId }) {
  const { user } = useAuth();
  const recordTime = useCallback(
    (seconds, day) => Authservice.recordReadingTime(postId, seconds, day),
    [postId],
  );
  useActiveTimeTracking(Boolean(user && postId), recordTime);

  useEffect(() => {
    if (user && postId) Authservice.recordPostRead(postId).catch(() => {});
  }, [user, postId]);

  return null;
}
