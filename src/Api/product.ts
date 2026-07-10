import baseApi from "../config/axios";

export const GetProductApi = async (params: any) => {
  try {
    const { data } = await baseApi.get("/product", {
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
export const CreateProductApi = async (payload: any) => {
  try {
    const { data } = await baseApi.post("/product", payload, {
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
export const UpdateProductApi = async (payload: any) => {
  try {
    const { data } = await baseApi.put("/product", payload, {
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

export const DeleteProductApi = async (id: any) => {
  try {
    const { data } = await baseApi.delete("/product", {
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

export const OneProductApi = async (id: any) => {
  try {
    const { data } = await baseApi.get("/product/" + id, {
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
