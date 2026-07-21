import baseApi from "../config/axios";

export const GetUserListApi = async (params: any) => {
  try {
    const { data } = await baseApi.get(`/users`, {
      params,
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch users",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const GetOneUserApi = async (id: string) => {
  try {
    const { data } = await baseApi.get(`/users/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch user",
      errors: error?.response?.data?.errors || {},
    };
  }
};
