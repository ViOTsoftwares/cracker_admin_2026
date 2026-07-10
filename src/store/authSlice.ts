import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PermissionRow {
  module: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface AdminUser {
  _id?: string;
  username?: string;
  email?: string;
  role?: string;
  phone?: string;
  profileImage?: string;
  restriction?: PermissionRow[];
}

interface AuthState {
  user: AdminUser | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AdminUser | null>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
