import { toast } from "react-toastify";

type ToastType = "success" | "error" | "info" | "warning";

export const toastMessage = (
  message: string,
  type: ToastType = "info"
) => {
  toast[type](message);
};
