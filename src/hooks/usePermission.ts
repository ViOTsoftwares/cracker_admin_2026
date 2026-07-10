"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";

export interface PermissionState {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export const usePermission = (moduleName: string): PermissionState => {
  const user = useAppSelector((state) => state.auth.user);

  return useMemo(() => {
    if (!user) return { view: true, add: true, edit: true, delete: true };
    if (user.role === "superadmin") {
      return { view: true, add: true, edit: true, delete: true };
    }
    const list = Array.isArray(user.restriction) ? user.restriction : [];
    const match = list.find((p) => p?.module === moduleName);
    return {
      view: Boolean(match?.view),
      add: Boolean(match?.add),
      edit: Boolean(match?.edit),
      delete: Boolean(match?.delete),
    };
  }, [user, moduleName]);
};
