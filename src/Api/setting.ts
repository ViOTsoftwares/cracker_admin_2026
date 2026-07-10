import baseApi from "../config/axios";

export const GetSettingApi = async () => {
  try {
    const { data } = await baseApi.get("/settings", {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Login failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};
export const UpdateSettingApi = async (payload: any) => {
  try {
    const { data } = await baseApi.post("/settings", payload, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Login failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};
