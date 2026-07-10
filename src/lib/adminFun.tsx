import { toastMessage } from "@/lib/toast.message";
import { useRouter } from "next/navigation";
import { logoutApi } from "@/Api/auth";

export const handleLogout = async (navigate: any) => {
  try {
    const response = await logoutApi();
    if (response.success) {
      toastMessage(response.message, "success");
      localStorage.removeItem("adminToken");
      document.cookie = "adminRestriction=; path=/; max-age=0";
      document.cookie = "adminRole=; path=/; max-age=0";
      document.cookie = "adminToken=; path=/; max-age=0";
      setTimeout(() => {
        navigate.push("/signin");
      }, 500);
    } else {
      toastMessage(response.message, "error");
    }
  } catch (error) {
    toastMessage("Logout failed", "error");
  }
};

export const capitalize = (str?: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
