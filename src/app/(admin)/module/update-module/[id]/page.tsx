"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import CardContainer from "@/components/CardContainer";
import { InputField, SelectField } from "@/components/UI/Inputs";
import { OneModuleApi, UpdateModuleApi } from "@/Api/module";
import { toastMessage } from "@/lib/toast.message";

const UpdateModulePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  const [loading, setLoading] = useState(false);
  const [moduleName, setModuleName] = useState("");
  const [submoduleName, setSubmoduleName] = useState("");
  const [rowType, setRowType] = useState<"module" | "submodule">("module");
  const [status, setStatus] = useState("");

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "InActive", value: "inactive" },
  ];

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await OneModuleApi(id);
        if (res?.success) {
          setRowType(res?.result?.type || "module");
          setModuleName(
            res?.result?.module || res?.result?.name || "",
          );
          setSubmoduleName(
            res?.result?.submodule || "",
          );
          setStatus(res?.result?.status || "");
        } else {
          toastMessage(res?.message || "Failed to load module", "error");
        }
      } catch (error) {
        toastMessage("Something went wrong", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      toastMessage("Status is required", "error");
      return;
    }
    try {
      setLoading(true);
      const response = await UpdateModuleApi({ id, status });
      if (response.success) {
        toastMessage(response.message, "success");
        navigate.back();
      } else {
        toastMessage(response.message || "Update failed", "error");
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
            Update Module Status
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Change status only for this module
          </p>
        </div>

        {loading ? (
          <div className="px-8 py-10 text-sm text-gray-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            <InputField
              label="Module"
              value={moduleName}
              name="module"
              disabled
            />

            {rowType === "submodule" && (
              <InputField
                label="Submodule"
                value={submoduleName}
                name="submodule"
                disabled
              />
            )}

            <SelectField
              label="Status"
              name="status"
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                Update Status
              </button>
            </div>
          </form>
        )}
      </div>
    </CardContainer>
  );
};

export default UpdateModulePage;
