import baseApi from "../config/axios";

export const GetTestimoalApi = async (params: any) => {
  try {
    const { data } = await baseApi.get("/testimonial", {
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
export const CreateTestimoalApi = async (payload: any) => {
  try {
    const { data } = await baseApi.post("/testimonial", payload, {
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
export const UpdateTestimoalApi = async (payload: any) => {
  try {
    const { data } = await baseApi.put("/testimonial", payload, {
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

export const DeleteTestimoalApi = async (id: any) => {
  try {
    const { data } = await baseApi.delete("/testimonial", {
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

export const OneTestimoalApi = async (id: any) => {
  try {
    const { data } = await baseApi.get("/testimonial/" + id, {
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
