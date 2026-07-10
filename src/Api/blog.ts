import baseApi from "../config/axios";

export const GetBlogApi = async (params: any) => {
  try {
    const { data } = await baseApi.get("/blog", {
      params,
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
export const CreateBlogApi = async (payload: any) => {
  try {
    const { data } = await baseApi.post("/blog", payload, {
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
export const UpdateBlogApi = async (payload: any) => {
  try {
    const { data } = await baseApi.put("/blog", payload, {
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

export const DeleteBlogApi = async (id: any) => {
  try {
    const { data } = await baseApi.delete("/blog", {
      data: id,
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

export const OneBlogApi = async (id: any) => {
  try {
    const { data } = await baseApi.get("/blog/" + id, {
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
