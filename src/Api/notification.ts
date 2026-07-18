import baseApi from "../config/axios";

export const GetNotificationsApi = async (limit: number = 50) => {
  try {
    const { data } = await baseApi.get("/notifications", {
      params: { limit },
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch notifications",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const MarkAsReadApi = async (id: string) => {
  try {
    const { data } = await baseApi.put(`/notifications/${id}/read`, {}, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to mark as read",
      errors: error?.response?.data?.errors || {},
    };
  }
};
