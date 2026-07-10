import baseApi from "../config/axios";

export const DashboardCountApi = async () => {
  try {
    const { data } = await baseApi.get("/dashboard", {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error?.response?.data?.message || "Login failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};
