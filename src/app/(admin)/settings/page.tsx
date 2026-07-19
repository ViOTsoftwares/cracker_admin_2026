"use client";

import React, { useEffect, useState } from "react";
import {
  FileField,
  InputField,
  TextareaField,
  SelectField,
} from "@/components/UI/Inputs";
import { validation } from "./validate";
import { isEmpty } from "@/lib/isEmpty";
import { GetSettingApi, UpdateSettingApi } from "@/Api/setting";
import { GetCategoryApi } from "@/Api/category";
import { toastMessage } from "@/lib/toast.message";
import CardContainer from "@/components/CardContainer";
import { usePermission } from "@/hooks/usePermission";
import { Plus, Trash2 } from "lucide-react";
const SettingsPage = () => {
  const [formValues, setFormValues] = useState({
    title: "",
    address: "",
    phone: "",
    email: "",
    project: "",
    client: "",
    id: "",
    linkedinlink: "",
    xlink: "",
    instagramlink: "",
    facebooklink: "",
    deliveryFee: 0,
    deliveryFeeType: "free",
    logo: null as File | null,
    footerShopLinks: [] as { label: string; link: string }[],
  });
  const {
    address,
    client,
    email,
    logo,
    phone,
    project,
    title,
    id,
    linkedinlink,
    xlink,
    instagramlink,
    facebooklink,
    deliveryFee,
    deliveryFeeType,
    footerShopLinks,
  } = formValues;
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{label: string, slug: string}[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const permission = usePermission("Site Content");

  const revokeIfBlobUrl = (url: string | null) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  React.useEffect(() => {
    return () => {
      revokeIfBlobUrl(logoPreview);
    };
  }, [logoPreview]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((pre) => ({ ...pre, [name]: value }));
    if (value) {
      setErrors((pre) => ({ ...pre, [name]: "" }));
    }
  };
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    revokeIfBlobUrl(logoPreview);

    setFormValues((pre) => ({ ...pre, logo: file }));
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permission.edit) {
      toastMessage("You don't have permission to save settings", "error");
      return;
    }

    const err = validation(formValues, Boolean(logoPreview));
    if (!isEmpty(err)) {
      setErrors(err);
      return;
    }

    setLoading(true);

    try {
      const fs = new FormData();
      fs.append("address", address);
      fs.append("client", client);
      fs.append("email", email);
      fs.append("phone", phone);
      fs.append("project", project);
      fs.append("title", title);
      fs.append("id", id);
      fs.append("linkedinlink", linkedinlink);
      fs.append("xlink", xlink);
      fs.append("instagramlink", instagramlink);
      fs.append("facebooklink", facebooklink);
      fs.append("deliveryFee", String(deliveryFee || 0));
      fs.append("deliveryFeeType", deliveryFeeType);
      fs.append("footerShopLinks", JSON.stringify(footerShopLinks));
      if (logo instanceof File) {
        fs.append("logo", logo);
      }
      const response = await UpdateSettingApi(fs);
      if (response.success) {
        toastMessage(response.message, "success");
      } else {
        setErrors((prev) => ({ ...prev, ...response.errors }));
      }
    } catch (err) {
      toastMessage("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getsetting();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await GetCategoryApi({ all: "true", limit: 100 });
      if (res.success && res.result?.list) {
        setCategories(res.result.list.map((c: any) => ({ label: c.name, slug: c.slug })));
      } else if (res.result && Array.isArray(res.result)) {
        setCategories(res.result.map((c: any) => ({ label: c.name, slug: c.slug })));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getsetting = async () => {
    try {
      setLoading(true);
      const response = await GetSettingApi();
      setLogoPreview(response?.result?.logo);
      setFormValues({
        ...response?.result,
        id: response?.result._id,
        logo: null,
        footerShopLinks: response?.result.footerShopLinks || [],
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <CardContainer>
      <div className="border-b px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Application Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage company and project configuration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Title"
            name="title"
            value={title}
            onChange={handleChange}
            error={errors.title}
          />
          <InputField
            label="Project"
            name="project"
            value={project}
            onChange={handleChange}
            error={errors.project}
          />
          <InputField
            label="Client"
            name="client"
            value={client}
            onChange={handleChange}
            error={errors.client}
          />
          <InputField
            label="Phone"
            name="phone"
            value={phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={handleChange}
            error={errors.email}
          />
          <SelectField
            label="Delivery Fee Type"
            name="deliveryFeeType"
            value={deliveryFeeType}
            onChange={handleChange}
            options={[
              { label: "Free Delivery", value: "free" },
              { label: "Fixed Amount", value: "fixed" },
              { label: "Percentage", value: "percentage" },
            ]}
          />
          {deliveryFeeType !== "free" && (
            <InputField
              label={deliveryFeeType === "percentage" ? "Delivery Fee (%)" : "Delivery Fee (₹)"}
              name="deliveryFee"
              type="number"
              value={deliveryFee !== undefined ? String(deliveryFee) : ""}
              onChange={handleChange}
              error={errors.deliveryFee}
            />
          )}
        </div>
        <TextareaField
          label="Address"
          name="address"
          rows={3}
          value={address}
          onChange={handleChange}
          error={errors.address}
        />
        <FileField
          label="Company Logo"
          preview={logoPreview}
          folder="logos"
          error={errors.logo}
          onChange={handleLogoChange}
        />
        <InputField
          label="X link"
          name="xlink"
          value={xlink}
          onChange={handleChange}
          error={errors.xlink}
        />{" "}
        <InputField
          label="linkedinlink"
          name="linkedinlink"
          value={linkedinlink}
          onChange={handleChange}
          error={errors.linkedinlink}
        />{" "}
        <InputField
          label="facebooklink"
          name="facebooklink"
          value={facebooklink}
          onChange={handleChange}
          error={errors.facebooklink}
        />{" "}
        <InputField
          label="Instagramlink"
          name="instagramlink"
          value={instagramlink}
          onChange={handleChange}
          error={errors.instagramlink}
        />
        
        {/* Footer Shop Links Section */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Footer Shop Links</h3>
              <p className="text-sm text-gray-500">Manage the quick links shown under the 'Shop' section in the footer.</p>
            </div>
            <button
              type="button"
              onClick={() => setFormValues(prev => ({
                ...prev,
                footerShopLinks: [...prev.footerShopLinks, { label: "", link: "" }]
              }))}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Plus size={16} /> Add Link
            </button>
          </div>
          
          <div className="space-y-3">
            {footerShopLinks.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-1 space-y-3">
                  <InputField
                    label="Label"
                    name={`footerShopLinks.${index}.label`}
                    value={item.label}
                    onChange={(e) => {
                      const newLinks = [...footerShopLinks];
                      newLinks[index].label = e.target.value;
                      setFormValues(prev => ({ ...prev, footerShopLinks: newLinks }));
                    }}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <InputField
                        label="Link URL (e.g. /products?category=slug)"
                        name={`footerShopLinks.${index}.link`}
                        value={item.link}
                        onChange={(e) => {
                          const newLinks = [...footerShopLinks];
                          newLinks[index].link = e.target.value;
                          setFormValues(prev => ({ ...prev, footerShopLinks: newLinks }));
                        }}
                      />
                    </div>
                    <div className="w-48">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pick Category</label>
                      <select
                        className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            const newLinks = [...footerShopLinks];
                            const selectedCat = categories.find(c => c.slug === e.target.value);
                            newLinks[index].link = `/products?category=${e.target.value}`;
                            if (!newLinks[index].label && selectedCat) {
                              newLinks[index].label = selectedCat.label;
                            }
                            setFormValues(prev => ({ ...prev, footerShopLinks: newLinks }));
                          }
                        }}
                      >
                        <option value="">-- Select --</option>
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newLinks = [...footerShopLinks];
                    newLinks.splice(index, 1);
                    setFormValues(prev => ({ ...prev, footerShopLinks: newLinks }));
                  }}
                  className="mt-7 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove Link"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {footerShopLinks.length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                <p className="text-sm text-gray-500">No shop links added yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          {permission.edit && (
            <button
              type="submit"
              // disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save Settings
            </button>
          )}
        </div>
      </form>
    </CardContainer>
  );
};

export default SettingsPage;
