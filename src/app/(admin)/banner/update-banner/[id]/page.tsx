"use client";

import React, { useEffect, useState } from "react";
import { FileField, InputField, SelectField } from "@/components/UI/Inputs";
import { validation } from "./validation";
import { isEmpty } from "@/lib/isEmpty";
import { toastMessage } from "@/lib/toast.message";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OneBannerApi, UpdateBannerApi } from "@/Api/banner";
import CardContainer from "@/components/CardContainer";

const UpdateBannerPage = () => {
  const [formValues, setFormValues] = useState({
    title: "",
    link: "",
    status: "active",
    sortOrder: "0",
    desktopImage: null as File | null,
    mobileImage: null as File | null,
  });

  const params = useParams();
  const id = params.id as string;
  const navigate = useRouter();

  const { title, link, status, sortOrder, desktopImage, mobileImage } = formValues;

  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (desktopPreview && desktopPreview.startsWith("blob:")) {
        URL.revokeObjectURL(desktopPreview);
      }
    };
  }, [desktopPreview]);

  useEffect(() => {
    return () => {
      if (mobilePreview && mobilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(mobilePreview);
      }
    };
  }, [mobilePreview]);

  const GetOneBanner = async () => {
    try {
      const response = await OneBannerApi(id);
      if (response?.success) {
        setFormValues({
          title: response.result.title || "",
          link: response.result.link || "",
          status: response.result.status || "active",
          sortOrder: String(response.result.sortOrder || "0"),
          desktopImage: null,
          mobileImage: null,
        });
        setDesktopPreview(response.result.desktopImage || null);
        setMobilePreview(response.result.mobileImage || null);
      } else {
        toastMessage(response.message || "Failed to load banner details", "error");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    GetOneBanner();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (value) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDesktopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (desktopPreview && desktopPreview.startsWith("blob:")) {
      URL.revokeObjectURL(desktopPreview);
    }

    setFormValues((prev) => ({ ...prev, desktopImage: file }));
    setDesktopPreview(URL.createObjectURL(file));
  };

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mobilePreview && mobilePreview.startsWith("blob:")) {
      URL.revokeObjectURL(mobilePreview);
    }

    setFormValues((prev) => ({ ...prev, mobileImage: file }));
    setMobilePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validation(formValues);
    if (!isEmpty(err)) {
      setErrors(err);
      return;
    }

    try {
      setLoading(true);

      const fs = new FormData();
      fs.append("id", id);
      fs.append("title", title);
      fs.append("link", link);
      fs.append("status", status);
      fs.append("sortOrder", sortOrder);

      if (desktopImage instanceof File) {
        fs.append("desktopImage", desktopImage);
      }
      if (mobileImage instanceof File) {
        fs.append("mobileImage", mobileImage);
      }

      const response = await UpdateBannerApi(fs);

      if (response.success) {
        toastMessage(response.message, "success");
        navigate.back();
      } else {
        setErrors((prev) => ({ ...prev, ...response.errors }));
      }
    } catch (error) {
      toastMessage("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardContainer>
      <button
        type="button"
        onClick={() => navigate.back()}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border mt-4">
        <div className="border-b px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-800">Update Banner</h1>
          <p className="text-sm text-gray-500 mt-1">
            Modify mobile and desktop banner details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <InputField
            label="Banner Title"
            name="title"
            value={title}
            onChange={handleChange}
            error={errors.title}
          />

          <InputField
            label="Target Link (URL)"
            name="link"
            value={link}
            onChange={handleChange}
            error={errors.link}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Status"
              name="status"
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
              value={status}
              onChange={handleChange}
              error={errors.status}
            />

            <InputField
              label="Sort Order"
              name="sortOrder"
              type="number"
              value={sortOrder}
              onChange={handleChange}
              error={errors.sortOrder}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileField
              label="Desktop Banner Image (Recommended: 1920x600)"
              preview={desktopPreview}
              folder="banners"
              error={errors.desktopImage}
              onChange={handleDesktopImageChange}
            />

            <FileField
              label="Mobile Banner Image (Recommended: 600x600 or 750x1000)"
              preview={mobilePreview}
              folder="banners"
              error={errors.mobileImage}
              onChange={handleMobileImageChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#0f172a] px-6 py-2 text-sm font-semibold text-white hover:bg-[#020617] disabled:opacity-60 transition"
            >
              {loading ? "Updating..." : "Update Banner"}
            </button>
          </div>
        </form>
      </div>
    </CardContainer>
  );
};

export default UpdateBannerPage;
