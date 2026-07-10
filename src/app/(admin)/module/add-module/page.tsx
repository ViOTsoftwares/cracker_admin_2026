"use client";

import React, { useMemo, useState } from "react";
import { InputField, SelectField } from "@/components/UI/Inputs";
import { validation } from "./validation";
import { isEmpty } from "@/lib/isEmpty";
import { toastMessage } from "@/lib/toast.message";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CardContainer from "@/components/CardContainer";
import { menuList } from "@/Router";
import { CreateModuleApi } from "@/Api/module";

const AddPage = () => {
  const [formValues, setFormValues] = useState({
    module: "",
    submodule: "",
    path: "",
    status: "",
  });
  const navigate = useRouter();
  const { module, status, submodule } = formValues;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const moduleOptions = useMemo(() => {
    return menuList.map((item) => ({
      label: item.label,
      value: item.label,
      path: item.path || "",
    }));
  }, []);
  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "InActive", value: "inactive" },
  ];
  const submoduleOptions = useMemo(() => {
    const moduleItem = menuList.find((item) => item.label === module);
    return (
      moduleItem?.subMenu?.map((item) => ({
        label: item.label,
        value: item.label,
        path: item.path || "",
      })) || []
    );
  }, [module]);
  console.log("----------", submoduleOptions);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "moduleName") {
      const selectedModule: any = moduleOptions.find((m) => m.value === value);
      console.log("selectedModule", selectedModule);
      setFormValues((prev) => ({
        ...prev,
        module: value,
        path: selectedModule?.path,
      }));
    } else if (name === "submoduleName") {
      const selectedSubmodule = submoduleOptions.find((s) => s.value === value);
      setFormValues((prev) => ({
        ...prev,
        submodule: value,
        path: selectedSubmodule?.path || "",
      }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }

    if (value) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isSub = submoduleOptions.length > 0 ? true : false;
    const err = validation(formValues, isSub);
    if (!isEmpty(err)) {
      setErrors(err);
      return;
    }
    console.log("--------submit", formValues);
    try {
      setLoading(true);

      const payload = {
        module: formValues.module,
        path: formValues.path,
        status: formValues.status,
        ...(formValues.submodule ? { submodule: formValues.submodule } : {}),
      };

      const response = await CreateModuleApi(payload);

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
      {/* Back Button */}
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

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="border-b px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Module Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create module and submodule details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <SelectField
            label="Module"
            name="moduleName"
            options={moduleOptions}
            value={module}
            onChange={handleChange}
            error={errors.moduleName}
          />
          {submoduleOptions.length > 0 && (
            <SelectField
              label="Sub Module"
              name="submoduleName"
              options={submoduleOptions}
              value={submodule}
              onChange={handleChange}
              error={errors.submoduleName}
            />
          )}
          <SelectField
            label="Status"
            name="status"
            options={statusOptions}
            value={status}
            onChange={handleChange}
            error={errors.status}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Save Module
            </button>
          </div>
        </form>
      </div>
    </CardContainer>
  );
};

export default AddPage;
