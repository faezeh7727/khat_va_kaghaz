"use server";

import { revalidatePath } from "next/cache";
import setCookieOnReq from "@/utils/setcookieonreq";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "");

export async function submitCommentAction(_previousState, formData) {
  const text = String(formData.get("text") || "").trim();
  const postId = String(formData.get("postId") || "").trim();
  const parentId = String(formData.get("parentId") || "").trim();
  const slug = String(formData.get("slug") || "").trim();

  if (text.length < 10 || text.length > 2000) {
    return { success: false, message: "متن دیدگاه باید بین ۱۰ تا ۲۰۰۰ نویسه باشد." };
  }
  if (!postId || !/^[a-f\d]{24}$/i.test(postId)) {
    return { success: false, message: "شناسهٔ نوشته معتبر نیست." };
  }
  if (parentId && !/^[a-f\d]{24}$/i.test(parentId)) {
    return { success: false, message: "شناسهٔ دیدگاه معتبر نیست." };
  }
  if (!baseUrl) {
    return { success: false, message: "ارتباط با سرویس دیدگاه‌ها برقرار نشد." };
  }

  try {
    const requestOptions = await setCookieOnReq({
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, postId, ...(parentId ? { parentId } : {}) }),
    });
    const response = await fetch(`${baseUrl}/comment/add`, requestOptions);
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const message = response.status === 401 || response.status === 403
        ? "برای ثبت دیدگاه ابتدا وارد حساب کاربری‌تان شوید."
        : result?.message || result?.data?.message || "ثبت دیدگاه انجام نشد. دوباره تلاش کنید.";
      return { success: false, message };
    }

    if (slug) revalidatePath(`/blogs/${encodeURIComponent(slug)}`);
    return {
      success: true,
      message: result?.data?.message || (parentId ? "پاسخ شما ثبت شد." : "دیدگاه شما ثبت شد."),
    };
  } catch {
    return { success: false, message: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید." };
  }
}
