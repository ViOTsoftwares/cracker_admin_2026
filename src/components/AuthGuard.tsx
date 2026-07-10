"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearUser, setUser } from "@/store/authSlice";
import { GetMeApi } from "@/Api/admin";
import { menuList } from "@/Router";
import { toastMessage } from "@/lib/toast.message";

type ActionType = "view" | "add" | "edit" | "delete";

const getModuleFromPath = (pathname: string) => {
  let matchedLabel = "";
  let matchedLength = -1;

  menuList.forEach((menu) => {
    if (menu.path && pathname.startsWith(menu.path)) {
      if (menu.path.length > matchedLength) {
        matchedLabel = menu.label;
        matchedLength = menu.path.length;
      }
    }
    if (menu.subMenu) {
      menu.subMenu.forEach((sub) => {
        if (sub.path && pathname.startsWith(sub.path)) {
          if (sub.path.length > matchedLength) {
            matchedLabel = sub.label;
            matchedLength = sub.path.length;
          }
        }
      });
    }
  });

  return matchedLabel || null;
};

const getActionFromPath = (pathname: string): ActionType => {
  if (pathname.includes("/add-")) return "add";
  if (pathname.includes("/update-")) return "edit";
  return "view";
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);

  const requiredModule = useMemo(
    () => getModuleFromPath(pathname || ""),
    [pathname],
  );
  const requiredAction = useMemo(
    () => getActionFromPath(pathname || ""),
    [pathname],
  );

  useEffect(() => {
    const run = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("adminToken")
            : null;

        if (!token) {
          dispatch(clearUser());
          router.push("/signin");
          return;
        }

        if (!user) {
          const response = await GetMeApi();
          if (response?.success) {
            dispatch(setUser(response.result));
          } else {
            dispatch(clearUser());
            router.push("/signin");
            return;
          }
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [dispatch, router, user]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (user.role === "superadmin") return;
    if (!requiredModule) return;
    // if()

    const permissions = Array.isArray(user.restriction)
      ? user.restriction
      : [];
    const match = permissions.find(
      (p) => String(p?.module || "") === String(requiredModule),
    );

    if (!match || !match[requiredAction]) {
      toastMessage("You don't have permission to access this page", "error");
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
        setTimeout(() => {
          router.push("/");
        }, 300);
      } else {
        router.push("/");
      }
    }
  }, [loading, user, requiredModule, requiredAction, router]);

  if (loading) return null;

  return <>{children}</>;
}
