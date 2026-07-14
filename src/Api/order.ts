import baseApi from "../config/axios";

export const GetOrdersApi = async (params: any) => {
  try {
    const { data } = await baseApi.get("/orders", {
      params,
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch orders",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const UpdateOrderStatusApi = async (id: string, payload: { orderStatus?: string; paymentStatus?: string }) => {
  try {
    const { data } = await baseApi.put(`/orders/${id}/status`, payload, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to update order status",
      errors: error?.response?.data?.errors || {},
    };
  }
};
