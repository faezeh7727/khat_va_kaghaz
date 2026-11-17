import setCookieOnReq from "@/utils/setcookieonreq";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "");

async function request(path, cache = "no-store") {
  if (!baseUrl) return null;

  try {
    const requestOptions = await setCookieOnReq({ cache });
    const response = await fetch(`${baseUrl}${path}`, requestOptions);

    if (!response.ok) {
      console.error(`Blog API returned ${response.status} for ${path}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${path} from the blog API:`, error);
    return null;
  }
}

async function postAction(path, postId) {
  if (!baseUrl) throw new Error("سرویس نوشته‌ها در دسترس نیست.");

  const requestOptions = await setCookieOnReq({
    method: "POST",
    cache: "no-store",
  });
  const response = await fetch(
    `${baseUrl}/post/${path}/${encodeURIComponent(postId)}`,
    requestOptions,
  );
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(result?.message || result?.data?.message || "انجام عملیات ناموفق بود.");
    error.status = response.status;
    throw error;
  }

  return {
    message: result?.data?.message || "عملیات با موفقیت انجام شد.",
  };
}

export const likePostApi = (postId) => postAction("like", postId);
export const bookmarkPostApi = (postId) => postAction("bookmark", postId);

export async function getPostBySlug(slug) {
  const result = await request(
    `/post/slug/${encodeURIComponent(slug)}`,
    "no-store",
  );
  return result?.data?.post || null;
}

export async function getPostList({ sort, limit, categorySlug, search } = {}) {
  const query = new URLSearchParams();
  if (sort) query.set("sort", sort);
  if (limit) query.set("limit", String(limit));
  if (categorySlug) query.set("categorySlug", categorySlug);
  if (typeof search === "string" && search.trim()) {
    query.set("search", search.trim());
  }

  const queryString = query.toString();
  const result = await request(`/post/list/${queryString ? `?${queryString}` : ""}`);
  const posts = Array.isArray(result?.data?.posts) ? result.data.posts : null;
  return {
    posts,
    totalCount: posts ? result.data.totalCount ?? posts.length : null,
  };
}

export async function getPosts(options = {}) {
  const { posts } = await getPostList(options);
  return posts;
}

export async function getBookmarkedPosts() {
  const result = await request("/post/bookmarks");
  return Array.isArray(result?.data?.posts) ? result.data.posts : null;
}
