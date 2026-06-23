import { TRole } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getAccessToken,
  removeAuthTokens,
  setAccessToken,
  setRefreshToken,
  setUserRoleCookie,
  setUserStatusCookie,
} from "@/lib/auth/tokenUtils";

export type TCategory = {
  _id: string;
  name: string;
  icon?: string;
};

export type TUser = {
  _id: string;
  username: string;
  avatar?: string;
  email: string;
  phoneNumber?: string;
  role: TRole;
  gender?: string;
  country?: string;
  languagePreference?: string;
  isVerified: boolean;
  isDeleted: boolean;
  status?: string;
  categories?: TCategory[];
  needsVerification?: boolean;
};

interface AuthState {
  user: TUser | null;
  token: string | null;
  isLoading: boolean;
  categories: TCategory[];
}

// Remove hardcoded user for security
const initialState: AuthState = {
  user: null,
  token: getAccessToken() || null,
  isLoading: false, // Start as false, will be set by StoreProvider
  categories: [],
};

// Create the slice with typed state and actions
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setUser(state, action: PayloadAction<{ user: TUser }>) {
      state.user = action.payload.user;
      state.isLoading = false;
    },
    setLogin(
      state,
      action: PayloadAction<{
        user?: TUser;
        accessToken: string;
        refreshToken: string;
      }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isLoading = false;
      setAccessToken(action.payload.accessToken);
      setRefreshToken(action.payload.refreshToken);
      if (action.payload.user?.role) {
        setUserRoleCookie(action.payload.user.role);
      }
      if (action.payload.user?.status) {
        setUserStatusCookie(action.payload.user.status || "ACTIVE");
      }
    },
    setAccessTokenAction(state, action: PayloadAction<string>) {
      state.token = action.payload;
      setAccessToken(action.payload);
    },
    setCategories(
      state,
      action: PayloadAction<{ response: { categories: TCategory[] } }>
    ) {
      state.categories = action.payload.response.categories;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.categories = [];
      removeAuthTokens();
    },
  },
});

export const {
  setLoading,
  setUser,
  setLogin,
  setCategories,
  logout,
  setAccessTokenAction,
} = authSlice.actions;
export default authSlice.reducer;
