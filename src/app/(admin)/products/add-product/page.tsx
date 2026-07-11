"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FileField, InputField, TextareaField, SelectField } from "@/components/UI/Inputs";
import { validation } from "./validate";
import { isEmpty } from "@/lib/isEmpty";
import { toastMessage } from "@/lib/toast.message";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash } from "lucide-react";
import { CreateProductApi } from "@/Api/product";
import { GetCategoryApi, CreateCategoryApi } from "@/Api/category";
import CardContainer from "@/components/CardContainer";
import { getImageUrl } from "@/lib/imageHelper";

const AddPage = () => {
  const [formValues, setFormValues] = useState({
    name: "",
    slug: "",
    category: "",
    originalPrice: "",
    offerPrice: "",
    stock: "0",
    safetyInfo: "",
    notes: "",
    isFeatured: false,
  });

  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Category Modal State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const navigate = useRouter();
  const { name, slug, category, originalPrice, offerPrice, stock, safetyInfo, notes, isFeatured } = formValues;

  const loadCategories = async () => {
    try {
      const res = await GetCategoryApi({ all: "true" });
      if (res.success && res.result?.list) {
        const formatted = res.result.list.map((cat: any) => ({
          label: cat.name,
          value: cat._id,
        }));
        setCategories(formatted);
      }
    } catch (error) {
      console.error(error);
      toastMessage("Failed to load categories", "error");
    }
  };

  // Load all categories for select dropdown
  useEffect(() => {
    loadCategories();
  }, []);

  // Revoke preview URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const slugVal = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormValues((prev) => ({ ...prev, name: val, slug: slugVal }));
    if (val) {
      setErrors((prev) => ({ ...prev, name: "", slug: "" }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (value) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFeaturedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({ ...prev, isFeatured: e.target.checked }));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (images.length + newFiles.length > 6) {
      toastMessage("Maximum 6 images are allowed.", "error");
      setErrors((prev) => ({ ...prev, image: "Maximum 6 images are allowed." }));
      return;
    }

    setImages((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCategorySubmit = async () => {
    if (!newCategoryName.trim() || !newCategorySlug.trim()) {
      toastMessage("Category name and slug are required", "error");
      return;
    }
    try {
      setModalLoading(true);
      const fs = new FormData();
      fs.append("name", newCategoryName);
      fs.append("slug", newCategorySlug);
      const res = await CreateCategoryApi(fs);
      if (res.success) {
        toastMessage(res.message || "Category created successfully", "success");
        // Refetch/reload categories list
        const catRes = await GetCategoryApi({ all: "true" });
        if (catRes.success && catRes.result?.list) {
          const formatted = catRes.result.list.map((cat: any) => ({
            label: cat.name,
            value: cat._id,
          }));
          setCategories(formatted);
        }
        // Auto select the new category
        setFormValues((prev) => ({ ...prev, category: res.result?._id }));
        setShowAddCategoryModal(false);
        setNewCategoryName("");
        setNewCategorySlug("");
      } else {
        toastMessage(res.message || "Failed to create category", "error");
      }
    } catch (err) {
      toastMessage("Something went wrong", "error");
    } finally {
      setModalLoading(false);
    }
  };

  // Real-time discount calculation
  const discountPercentage = useMemo(() => {
    const orig = Number(originalPrice || 0);
    const offer = Number(offerPrice || 0);
    if (orig && offer && orig >= offer) {
      return Math.round(((orig - offer) / orig) * 100);
    }
    return 0;
  }, [originalPrice, offerPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationPayload = {
      ...formValues,
      images,
    };
    const err = validation(validationPayload);
    if (!isEmpty(err)) {
      setErrors(err);
      return;
    }

    try {
      setLoading(true);
      const fs = new FormData();
      fs.append("name", name);
      fs.append("slug", slug);
      fs.append("category", category);
      fs.append("originalPrice", originalPrice);
      fs.append("offerPrice", offerPrice);
      fs.append("stock", stock);
      fs.append("safetyInfo", safetyInfo);
      fs.append("notes", notes);
      fs.append("isFeatured", String(isFeatured));

      images.forEach((imgFile) => {
        fs.append("images", imgFile);
      });

      const response = await CreateProductApi(fs);

      if (response.success) {
        toastMessage(response.message, "success");
        navigate.back();
      } else {
        setErrors((prev) => ({ ...prev, ...response.errors }));
        toastMessage(response.message || "Failed to add product", "error");
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
            Add New Product
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a cracker product with detailed attributes and dynamic classification
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Product Name"
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

            {/* Category selection with Add button */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <SelectField
                  label="Category"
                  name="category"
                  value={category}
                  onChange={handleChange}
                  options={categories}
                  error={errors.category}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(true)}
                className="h-[38px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition"
              >
                + Add
              </button>
            </div>

            <InputField
              label="Original Price (₹)"
              name="originalPrice"
              type="number"
              value={originalPrice}
              onChange={handleChange}
              error={errors.originalPrice}
            />

            <div className="space-y-1">
              <InputField
                label="Offer Price (₹)"
                name="offerPrice"
                type="number"
                value={offerPrice}
                onChange={handleChange}
                error={errors.offerPrice}
              />
              {discountPercentage > 0 && (
                <p className="text-xs text-green-600 font-semibold mt-1">
                  Offer Percentage: {discountPercentage}% Off
                </p>
              )}
            </div>

            <InputField
              label="Stock"
              name="stock"
              type="number"
              value={stock}
              onChange={handleChange}
              error={errors.stock}
            />

            <div className="flex items-center space-y-1 mt-6 col-span-1 md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={isFeatured}
                  onChange={handleFeaturedChange}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured Product (Display on Homepage)
                </span>
              </label>
            </div>
          </div>

          <TextareaField
            label="Safety Information / Instructions"
            name="safetyInfo"
            value={safetyInfo}
            onChange={handleChange}
            error={errors.safetyInfo}
            rows={3}
          />

          <TextareaField
            label="Notes"
            name="notes"
            value={notes}
            onChange={handleChange}
            error={errors.notes}
            rows={2}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Images <span className="text-xs text-gray-400 font-normal">(Maximum 6 images)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={images.length >= 6}
              onChange={handleImagesChange}
              className="block w-full text-sm
                file:mr-4 file:rounded-md file:border-0
                file:bg-blue-600 file:px-4 file:py-2
                file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 italic">
              Note: You can select and upload up to 6 product images.
            </p>
            {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}

            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {imagePreviews.map((url, idx) => (
                  <div key={idx} className="relative group border rounded-lg overflow-hidden bg-gray-50 h-24">
                    <img
                      src={getImageUrl(url)}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white opacity-90 hover:opacity-100 transition shadow"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {loading ? "Adding..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>

      {/* Add Category Modal Inline */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border shadow-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Add Category</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  setNewCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                value={newCategorySlug}
                onChange={(e) => setNewCategorySlug(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName("");
                  setNewCategorySlug("");
                }}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCategorySubmit}
                disabled={modalLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
              >
                {modalLoading ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CardContainer>
  );
};

export default AddPage;
