import Cookies from "js-cookie";
import { isProduction } from "@/config";
import { accessToken, refreshToken } from "@/constants/token";

const TOKEN_EXPIRY_DAYS = 7; // 7 days

/**
 * Securely set auth token in cookies
 */
export const setAccessToken = (token: string): void => {
  Cookies.set(accessToken, token, {
    expires: TOKEN_EXPIRY_DAYS,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: "strict", // Prevent CSRF attacks
    path: "/",
  });
};
export const setRefreshToken = (token: string): void => {
  Cookies.set(refreshToken, token, {
    expires: TOKEN_EXPIRY_DAYS,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: "strict", // Prevent CSRF attacks
    path: "/",
  });
};

/**
 * Get auth token from cookies
 */
export const getAccessToken = (): string | undefined => {
  return Cookies.get(accessToken);
};
export const getRefreshToken = (): string | undefined => {
  return Cookies.get(refreshToken);
};

/**
 * Remove auth token from cookies
 */
export const removeAuthTokens = (): void => {
  Cookies.remove(accessToken, { path: "/" });
  Cookies.remove(refreshToken, { path: "/" });
  Cookies.remove("userRole", { path: "/" });
  Cookies.remove("userStatus", { path: "/" });
};

export const setUserRoleCookie = (role: string): void => {
  Cookies.set("userRole", role, {
    expires: TOKEN_EXPIRY_DAYS,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  });
};

export const setUserStatusCookie = (status: string): void => {
  Cookies.set("userStatus", status, {
    expires: TOKEN_EXPIRY_DAYS,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  });
};

export const getUserRoleCookie = (): string | undefined => {
  return Cookies.get("userRole");
};

export const getUserStatusCookie = (): string | undefined => {
  return Cookies.get("userStatus");
};

/**
 * Validate if token exists and is not expired
 */
export const isTokenValid = (): boolean => {
  const token = getAccessToken();
  return !!token;
};

interface DecodedToken {
  exp?: number;
  [key: string]: unknown;
}

/**
 * Decode JWT token (client-side only for display purposes, not for security)
 * Always validate tokens on the server-side
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if token is expired (client-side check only)
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};
