import baseApi from "../config/axios";

export const GetCategoryApi = async (params: any) => {
  try {
    const { data } = await baseApi.get("/category", {
      params,
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Operation failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const CreateCategoryApi = async (payload: any) => {
  try {
    const { data } = await baseApi.post("/category", payload, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Operation failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const UpdateCategoryApi = async (payload: any) => {
  try {
    const { data } = await baseApi.put("/category", payload, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Operation failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const DeleteCategoryApi = async (id: any) => {
  try {
    const { data } = await baseApi.delete("/category", {
      data: id,
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Operation failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const OneCategoryApi = async (id: any) => {
  try {
    const { data } = await baseApi.get("/category/" + id, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error?.response?.data?.message || "Operation failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};
