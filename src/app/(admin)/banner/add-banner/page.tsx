"use client";

import React, { useEffect, useState } from "react";
import { FileField, InputField, SelectField } from "@/components/UI/Inputs";
import { validation } from "./validation";
import { isEmpty } from "@/lib/isEmpty";
import { toastMessage } from "@/lib/toast.message";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CreateBannerApi } from "@/Api/banner";
import CardContainer from "@/components/CardContainer";
import ImageCropModal from "@/components/ImageCropModal";

const DESKTOP_ASPECTS = [
  { label: "Desktop Widescreen (16:5)", value: 16 / 5 },
  { label: "Ultra Wide (3:1)", value: 3 / 1 },
  { label: "16:9 Standard", value: 16 / 9 },
  { label: "Free Crop", value: 0 },
];

const MOBILE_ASPECTS = [
  { label: "Mobile Banner (4:3)", value: 4 / 3 },
  { label: "Square (1:1)", value: 1 / 1 },
  { label: "Portrait (4:5)", value: 4 / 5 },
  { label: "Free Crop", value: 0 },
];

const AddBannerPage = () => {
  const [formValues, setFormValues] = useState({
    title: "",
    link: "",
    status: "active",
    sortOrder: "0",
    desktopImage: null as File | null,
    mobileImage: null as File | null,
  });

  const navigate = useRouter();
  const { title, link, status, sortOrder, desktopImage, mobileImage } = formValues;

  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  // Cropper states
  const [rawDesktopSrc, setRawDesktopSrc] = useState<string | null>(null);
  const [isDesktopCropOpen, setIsDesktopCropOpen] = useState(false);

  const [rawMobileSrc, setRawMobileSrc] = useState<string | null>(null);
  const [isMobileCropOpen, setIsMobileCropOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (desktopPreview && desktopPreview.startsWith("blob:")) URL.revokeObjectURL(desktopPreview);
      if (rawDesktopSrc && rawDesktopSrc.startsWith("blob:")) URL.revokeObjectURL(rawDesktopSrc);
    };
  }, [desktopPreview, rawDesktopSrc]);

  useEffect(() => {
    return () => {
      if (mobilePreview && mobilePreview.startsWith("blob:")) URL.revokeObjectURL(mobilePreview);
      if (rawMobileSrc && rawMobileSrc.startsWith("blob:")) URL.revokeObjectURL(rawMobileSrc);
    };
  }, [mobilePreview, rawMobileSrc]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (value) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDesktopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setRawDesktopSrc(objectUrl);
    setIsDesktopCropOpen(true);
    setErrors((prev) => ({ ...prev, desktopImage: "" }));
  };

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setRawMobileSrc(objectUrl);
    setIsMobileCropOpen(true);
    setErrors((prev) => ({ ...prev, mobileImage: "" }));
  };

  const handleDesktopCropSave = (file: File, previewUrl: string) => {
    setFormValues((prev) => ({ ...prev, desktopImage: file }));
    setDesktopPreview(previewUrl);
    setIsDesktopCropOpen(false);
  };

  const handleMobileCropSave = (file: File, previewUrl: string) => {
    setFormValues((prev) => ({ ...prev, mobileImage: file }));
    setMobilePreview(previewUrl);
    setIsMobileCropOpen(false);
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

      const response = await CreateBannerApi(fs);

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
          <h1 className="text-2xl font-semibold text-gray-800">Add Banner</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a new mobile and desktop banner slide with interactive image cropper
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
              onCropClick={rawDesktopSrc ? () => setIsDesktopCropOpen(true) : undefined}
            />

            <FileField
              label="Mobile Banner Image (Recommended: 600x600 or 750x1000)"
              preview={mobilePreview}
              folder="banners"
              error={errors.mobileImage}
              onChange={handleMobileImageChange}
              onCropClick={rawMobileSrc ? () => setIsMobileCropOpen(true) : undefined}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#9e0d0d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7c0a0a] disabled:opacity-60 transition shadow-sm"
            >
              {loading ? "Saving..." : "Save Banner"}
            </button>
          </div>
        </form>
      </div>

      {/* Desktop Cropper Modal */}
      <ImageCropModal
        isOpen={isDesktopCropOpen}
        imageSrc={rawDesktopSrc}
        title="Crop Desktop Banner"
        defaultAspect={16 / 5}
        aspectOptions={DESKTOP_ASPECTS}
        onCropSave={handleDesktopCropSave}
        onCancel={() => setIsDesktopCropOpen(false)}
      />

      {/* Mobile Cropper Modal */}
      <ImageCropModal
        isOpen={isMobileCropOpen}
        imageSrc={rawMobileSrc}
        title="Crop Mobile Banner"
        defaultAspect={4 / 3}
        aspectOptions={MOBILE_ASPECTS}
        onCropSave={handleMobileCropSave}
        onCancel={() => setIsMobileCropOpen(false)}
      />
    </CardContainer>
  );
};

export default AddBannerPage;
