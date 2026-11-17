export const initialAuthState = {
  user: null,
  status: "idle",
  isLoading: false,
  error: null,
};

export default function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_PENDING":
      return { ...state, status: "pending", isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return { user: action.payload, status: "success", isLoading: false, error: null };
    case "AUTH_PROFILE_UPDATED":
      return { ...state, user: action.payload };
    case "AUTH_REJECTED":
      return { ...state, status: "rejected", isLoading: false, error: action.payload };
    case "AUTH_HYDRATE_PENDING":
      return state.status === "idle" ? { ...state, isLoading: true } : state;
    case "AUTH_HYDRATE_SUCCESS":
      return state.status === "idle"
        ? { user: action.payload, status: "success", isLoading: false, error: null }
        : state;
    case "AUTH_HYDRATE_REJECTED":
      return state.status === "idle"
        ? { user: null, status: "rejected", isLoading: false, error: null }
        : state;
    case "AUTH_REFRESH_PENDING":
      return { ...state, isLoading: true };
    case "AUTH_REFRESH_COMPLETE":
      return { ...state, isLoading: state.status === "pending" };
    case "AUTH_RESET":
      return initialAuthState;
    case "AUTH_SESSION_EXPIRED":
      return { user: null, status: "rejected", isLoading: false, error: null };
    default:
      return state;
  }
}
