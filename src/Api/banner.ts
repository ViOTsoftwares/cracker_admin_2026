import baseApi from "../config/axios";

export const GetBannerApi = async (params: any) => {
  try {
    const { data } = await baseApi.get("/banner", {
      params,
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch banners",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const CreateBannerApi = async (payload: any) => {
  try {
    const { data } = await baseApi.post("/banner", payload, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to create banner",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const UpdateBannerApi = async (payload: any) => {
  try {
    const { data } = await baseApi.put("/banner", payload, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to update banner",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const DeleteBannerApi = async (id: any) => {
  try {
    const { data } = await baseApi.delete("/banner", {
      data: id,
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to delete banner",
      errors: error?.response?.data?.errors || {},
    };
  }
};

export const OneBannerApi = async (id: any) => {
  try {
    const { data } = await baseApi.get("/banner/" + id, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch banner detail",
      errors: error?.response?.data?.errors || {},
    };
  }
};
