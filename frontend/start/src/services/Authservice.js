import http from "@/services/httpservice";

function getServerMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "خطایی رخ داد. دوباره تلاش کنید."
  );
}

function toSafeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

async function sendAuthRequest(endpoint, credentials) {
  try {
    const response = await http.post(`/user/${endpoint}`, credentials);
    const { message, user } = response.data?.data || {};
    return { message, user: toSafeUser(user) };
  } catch (error) {
    throw new Error(getServerMessage(error), { cause: error });
  }
}

const Authservice = {
  signup: (values) => sendAuthRequest("signup", values),
  signin: (values) => sendAuthRequest("signin", values),
  async getProfile() {
    try {
      const response = await http.get("/user/profile");
      return toSafeUser(response.data?.data?.user);
    } catch (error) {
      throw new Error(getServerMessage(error), { cause: error });
    }
  },
  async updateProfile(values) {
    try {
      const response = await http.patch("/user/update", values);
      const { message, user } = response.data?.data || {};
      return { message, user: toSafeUser(user) };
    } catch (error) {
      throw new Error(getServerMessage(error), { cause: error });
    }
  },
  async updateAvatar(file) {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await http.post("/user/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { message, user } = response.data?.data || {};
      return { message, user: toSafeUser(user) };
    } catch (error) {
      throw new Error(getServerMessage(error), { cause: error });
    }
  },
  async deleteAvatar() {
    try {
      const response = await http.delete("/user/avatar");
      const { message, user } = response.data?.data || {};
      return { message, user: toSafeUser(user) };
    } catch (error) {
      throw new Error(getServerMessage(error), { cause: error });
    }
  },
  async recordPostRead(postId) {
    try {
      const response = await http.post(`/post/read/${encodeURIComponent(postId)}`);
      return response.data?.data || null;
    } catch (error) {
      throw new Error(getServerMessage(error), { cause: error });
    }
  },
  async recordReadingTime(postId, seconds, day) {
    try {
      const response = await http.post(`/post/read/${encodeURIComponent(postId)}/time`, { seconds, day });
      return response.data?.data || null;
    } catch (error) {
      throw new Error(getServerMessage(error), { cause: error });
    }
  },
  async getDashboard() {
    try {
      const response = await http.get("/user/dashboard");
      return response.data?.data || null;
    } catch (error) {
      throw new Error(getServerMessage(error), { cause: error });
    }
  },
  async getUsers() {
    try {
      const response = await http.get("/user/list");
      return response.data?.data?.users || [];
    } catch (error) {
      throw new Error(getServerMessage(error), { cause: error });
    }
  },
  async updateUserRole(userId, role) {
    try {
      const response = await http.patch(`/user/${encodeURIComponent(userId)}/role`, { role });
      return response.data?.data?.user || null;
    } catch (error) {
      throw new Error(getServerMessage(error), { cause: error });
    }
  },
  async logout() {
    try {
      const response = await http.post("/user/logout");
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(getServerMessage(error), { cause: error });
    }
  },
};

export default Authservice;
