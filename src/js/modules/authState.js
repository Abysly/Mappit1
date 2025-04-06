import { API_BASE_URL } from "../../config.js";

export async function checkAuthState(debug = false) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      credentials: "include",
    });

    if (debug) {
      console.log("Response headers:", [...response.headers.entries()]);
    }

    if (!response.ok) {
      if (debug)
        console.warn("Auth check failed with status:", response.status);
      return {
        isAuthenticated: false,
        isAdmin: false,
        isSubscribed: false,
        user: null,
        profilePicUrl: null,
      };
    }

    const data = await response.json();

    if (debug) {
      console.log("Auth status response:", data);
    }

    const profilePic = data?.user?.profile_pic;
    const profilePicUrl = profilePic
      ? `${API_BASE_URL}/uploads/${profilePic}`
      : "/assets/default-profile.png";

    return {
      isAuthenticated: data?.isAuthenticated || false,
      isAdmin: data?.isAdmin || false,
      isSubscribed: data?.isSubscribed || false,
      user: data?.user || null,
      profilePicUrl,
    };
  } catch (error) {
    console.error("Auth check error:", error);
    return {
      isAuthenticated: false,
      isAdmin: false,
      isSubscribed: false,
      user: null,
      profilePicUrl: "/assets/default-profile.png",
    };
  }
}
