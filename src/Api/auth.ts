import baseApi from "../config/axios";

export const LoginApi = async (payload: any) => {
  try {
    const { data } = await baseApi.post("/login", payload, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      message: error?.response?.data?.message || "Login failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};
export const ChangePasswordApi = async (payload: any) => {
  try {
    const { data } = await baseApi.patch("/change-password", payload, {
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
export const logoutApi = async () => {
  try {
    const { data } = await baseApi.post(
      "/logout",
      {},
      { withCredentials: true },
    );
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Login failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};
