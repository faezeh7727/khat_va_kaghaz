import http from "@/services/httpservice";

function getErrorMessage(error) {
  return error.response?.data?.message || error.response?.data?.error || error.message || "درخواست انجام نشد.";
}

async function request(action) {
  try {
    return await action();
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
}

const PostEditorService = {
  getMyPosts: () => request(async () => {
    const response = await http.get("/post/mine");
    return response.data?.data?.posts || [];
  }),
  getMyPost: (id) => request(async () => {
    const response = await http.get(`/post/mine/${encodeURIComponent(id)}`);
    return response.data?.data?.post || null;
  }),
  getCategories: () => request(async () => {
    const response = await http.get("/category/list");
    return response.data?.data?.categories || [];
  }),
  save: (formData, id) => request(async () => {
    const url = id ? `/post/update/${encodeURIComponent(id)}` : "/post/create";
    const response = id
      ? await http.patch(url, formData, { headers: { "Content-Type": "multipart/form-data" } })
      : await http.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response.data?.data || null;
  }),
  recordWritingTime: (seconds, day) => request(async () => {
    const response = await http.post("/user/writing-time", { seconds, day });
    return response.data?.data || null;
  }),
};

export default PostEditorService;
