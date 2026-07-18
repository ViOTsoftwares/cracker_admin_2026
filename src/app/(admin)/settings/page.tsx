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
import { toastMessage } from "@/lib/toast.message";
import CardContainer from "@/components/CardContainer";
import { usePermission } from "@/hooks/usePermission";
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
  } = formValues;
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
  }, []);
  const getsetting = async () => {
    try {
      setLoading(true);
      const response = await GetSettingApi();
      setLogoPreview(response?.result?.logo);
      setFormValues({
        ...response?.result,
        id: response?.result._id,
        logo: null,
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
