import baseApi from "../config/axios";

export const GetModuleApi = async (params: any) => {
  try {
    const { data } = await baseApi.get("/module", {
      params,
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Request failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const CreateModuleApi = async (payload: any) => {
  try {
    const { data } = await baseApi.post("/module", payload, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Request failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const UpdateModuleApi = async (payload: any) => {
  try {
    const { data } = await baseApi.put("/module", payload, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Request failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const DeleteModuleApi = async (id: any) => {
  try {
    const { data } = await baseApi.delete("/module", {
      data: id,
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Request failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const OneModuleApi = async (id: any) => {
  try {
    const { data } = await baseApi.get("/module/" + id, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Request failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};
