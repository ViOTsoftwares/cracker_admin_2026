import baseApi from "../config/axios";

export const GetEmailTemplateApi = async (params: any) => {
  try {
    const { data } = await baseApi.get("/email-template", {
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

export const CreateEmailTemplateApi = async (payload: any) => {
  try {
    const { data } = await baseApi.post("/email-template", payload, {
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

export const UpdateEmailTemplateApi = async (payload: any) => {
  try {
    const { data } = await baseApi.put("/email-template", payload, {
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

export const DeleteEmailTemplateApi = async (id: any) => {
  try {
    const { data } = await baseApi.delete("/email-template", {
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

export const OneEmailTemplateApi = async (id: any) => {
  try {
    const { data } = await baseApi.get("/email-template/" + id, {
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
