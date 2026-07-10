import baseApi from "../config/axios";

export const AdminListApi = async (payload: any) => {
  try {
    const { data } = await baseApi.get("/admin", {
      params: payload,
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

export const CreateAdminApi = async (payload: any) => {
  try {
    const { data } = await baseApi.post("/admin", payload, {
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

export const UpdateAdminApi = async (payload: any) => {
  try {
    const { data } = await baseApi.put("/admin", payload, {
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

export const DeleteAdminApi = async (id: any) => {
  try {
    const { data } = await baseApi.delete("/admin", {
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

export const OneAdminApi = async (id: any) => {
  try {
    const { data } = await baseApi.get("/admin/" + id, {
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

export const GetMeApi = async () => {
  try {
    const { data } = await baseApi.get("/me", {
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

export const UpdateProfileApi = async (payload: any) => {
  try {
    const { data } = await baseApi.put("/update-profile", payload, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Update failed",
      errors: error?.response?.data?.errors || {},
    };
  }
};
