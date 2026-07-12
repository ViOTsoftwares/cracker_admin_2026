"use client";

import React, { useEffect, useState } from "react";
import { FileField, InputField, TextareaField } from "@/components/UI/Inputs";
import { validation } from "./validate";
import { isEmpty } from "@/lib/isEmpty";
import { toastMessage } from "@/lib/toast.message";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CreateCategoryApi } from "@/Api/category";
import CardContainer from "@/components/CardContainer";

const AddCategoryPage = () => {
  const [formValues, setFormValues] = useState({
    name: "",
    slug: "",
    description: "",
    image: null as File | null,
  });
  const navigate = useRouter();
  const { name, slug, description, image } = formValues;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameVal = e.target.value;
    // Auto-generate a clean slug from the category name
    const slugVal = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormValues((prev) => ({ ...prev, name: nameVal, slug: slugVal }));
    if (nameVal) {
      setErrors((prev) => ({ ...prev, name: "", slug: "" }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      fs.append("name", name);
      fs.append("slug", slug);
      fs.append("description", description);

      if (image instanceof File) {
        fs.append("image", image);
      }

      const response = await CreateCategoryApi(fs);

      if (response.success) {
        toastMessage(response.message, "success");
        navigate.back();
      } else {
        setErrors((prev) => ({ ...prev, ...response.errors }));
        toastMessage(response.message || "Failed to create category", "error");
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

      <div className="bg-white rounded-2xl shadow-sm border mt-4">
        <div className="border-b px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Create Category
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Add a new dynamic category for product classification
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <InputField
            label="Category Name"
            name="name"
            value={name}
            onChange={handleNameChange}
            error={errors.name}
          />

          <InputField
            label="SEO Friendly Slug"
            name="slug"
            value={slug}
            onChange={handleChange}
            error={errors.slug}
          />

          <TextareaField
            label="Description (Optional)"
            name="description"
            value={description}
            onChange={handleChange}
            error={errors.description}
            rows={3}
          />

          <FileField
            label="Category Image"
            preview={imagePreview}
            folder="categories"
            error={errors.image}
            onChange={handleImageChange}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {loading ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </CardContainer>
  );
};

export default AddCategoryPage;
