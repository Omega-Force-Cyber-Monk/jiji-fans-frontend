import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

// Base selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectCategories = (state: RootState) => state.auth.categories;

// Memoized selectors
export const selectIsAuthenticated = createSelector(
  [selectUser, selectToken],
  (user, token) => !!user && !!token
);

export const selectUserRole = createSelector(
  [selectUser],
  (user) => user?.role
);

export const selectIsAdmin = createSelector(
  [selectUserRole],
  (role) => role === "Admin"
);

export const selectIsCreator = createSelector(
  [selectUserRole],
  (role) => role === "Creator"
);

export const selectIsUser = createSelector(
  [selectUserRole],
  (role) => role === "User"
);

export const selectUserCategories = createSelector(
  [selectUser],
  (user) => user?.categories || []
);

export const selectCategoryById = createSelector(
  [selectCategories, (_state: RootState, categoryId: string) => categoryId],
  (categories, categoryId) => categories.find((cat) => cat._id === categoryId)
);

export const selectCategoryNames = createSelector(
  [selectCategories],
  (categories) => categories.map((cat) => cat.name)
);
