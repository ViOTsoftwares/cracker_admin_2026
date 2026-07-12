"use client";

import React, { useEffect, useState } from "react";
import { FileField, InputField } from "@/components/UI/Inputs";
import { validation } from "./validation";
import { isEmpty } from "@/lib/isEmpty";
import { toastMessage } from "@/lib/toast.message";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CreateTestimoalApi } from "@/Api/testimonial";
import CardContainer from "@/components/CardContainer";

const AddPage = () => {
  const [formValues, setFormValues] = useState({
    name: "",
    title: "",
    description: "",
    image: null as File | null,
    id: "",
  });
  const naviagte = useRouter();
  const { description, image, name, id, title } = formValues;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (value) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setFormValues((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
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
      fs.append("name", name);
      fs.append("description", description);

      if (image instanceof File) {
        fs.append("logo", image);
      }

      const response = await CreateTestimoalApi(fs);

      if (response.success) {
        toastMessage(response.message, "success");
        naviagte.back();
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
      {/* Back Button */}
      <button
        type="button"
        onClick={() => naviagte.back()}
        className="
        inline-flex items-center gap-2
        text-sm font-medium
        text-gray-600
        hover:text-gray-900
        transition-colors
        focus:outline-none
        focus:ring-2 focus:ring-gray-300
        rounded-lg
      "
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="border-b px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Testimonial Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage testimonial information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <InputField
            label="Title"
            name="title"
            value={title}
            onChange={handleChange}
            error={errors.title}
          />

          <InputField
            label="Client name"
            name="name"
            value={name}
            onChange={handleChange}
            error={errors.name}
          />
          <InputField
            label="Description"
            name="description"
            value={description}
            onChange={handleChange}
            error={errors.description}
          />
          <FileField
            label="Logo"
            preview={imagePreview}
            folder="logos"
            error={errors.image}
            onChange={handleImageChange}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Save Testimonial
            </button>
          </div>
        </form>
      </div>
    </CardContainer>
  );
};

export default AddPage;
