"use server";

import { bookmarkPostApi, likePostApi } from "@/services/postservices";

async function runPostAction(action, postId) {
  try {
    const result = await action(postId);
    return { success: true, message: result.message };
  } catch (error) {
    return {
      success: false,
      status: error.status || 500,
      message: error.message || "انجام عملیات ناموفق بود.",
    };
  }
}

export async function likePostAction(postId) {
  return runPostAction(likePostApi, postId);
}

export async function bookmarkPostAction(postId) {
  return runPostAction(bookmarkPostApi, postId);
}
