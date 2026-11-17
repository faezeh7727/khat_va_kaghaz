"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Authservice from "@/services/Authservice";

export default function PostReadTracker({ postId }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !postId) return;
    Authservice.recordPostRead(postId).catch(() => {});
  }, [user, postId]);

  return null;
}
