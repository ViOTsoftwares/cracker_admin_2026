"use client";

import React, { useEffect, useState } from "react";
import { InputField, SelectField } from "@/components/UI/Inputs";
import { isEmpty } from "@/lib/isEmpty";
import { toastMessage } from "@/lib/toast.message";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CardContainer from "@/components/CardContainer";
import { menuList } from "@/Router";
import { OneAdminApi, UpdateAdminApi } from "@/Api/admin";

type PermissionRow = {
  module: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
};

const buildPermissionRows = (): PermissionRow[] => {
  return menuList.flatMap((menu) => {
    if (menu.subMenu && menu.subMenu.length > 0) {
      return menu.subMenu.map((sub) => ({
        module: sub.label,
        view: false,
        add: false,
        edit: false,
        delete: false,
      }));
    }
    return [
      {
        module: menu.label,
        view: false,
        add: false,
        edit: false,
        delete: false,
      },
    ];
  });
};

const mergePermissions = (
  incoming: PermissionRow[] | undefined,
): PermissionRow[] => {
  const base = buildPermissionRows();
  if (!incoming || incoming.length === 0) return base;

  return base.map((row) => {
    const found = incoming.find((r) => r.module === row.module);
    return found ? { ...row, ...found } : row;
  });
};

const UpdateAdminPage = () => {
  const params = useParams();
  const id = params.id as string;
  const navigate = useRouter();

  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
  });
  const { username, email, password } = formValues;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionRow[]>(
    buildPermissionRows(),
  );
  const [permissionPreset, setPermissionPreset] = useState("partial");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (value) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePermission = (
    index: number,
    field: keyof Omit<PermissionRow, "module">,
  ) => {
    setPermissions((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: !row[field] } : row,
      ),
    );
  };

  const applyPreset = (preset: string) => {
    setPermissionPreset(preset);
    if (preset === "view") {
      setPermissions((prev) =>
        prev.map((row) => ({
          ...row,
          view: true,
          add: false,
          edit: false,
          delete: false,
        })),
      );
    } else if (preset === "partial") {
      setPermissions((prev) =>
        prev.map((row) => ({
          ...row,
          view: true,
          add: true,
          edit: false,
          delete: false,
        })),
      );
    } else if (preset === "full") {
      setPermissions((prev) =>
        prev.map((row) => ({
          ...row,
          view: true,
          add: true,
          edit: true,
          delete: true,
        })),
      );
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!username.trim()) nextErrors.username = "Username is required";
    if (!email.trim()) nextErrors.email = "Email is required";
    if (email && !email.includes("@")) nextErrors.email = "Enter a valid email";
    if (password && password.length < 6)
      nextErrors.password = "Minimum 6 characters";
    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (!isEmpty(err)) {
      setErrors(err);
      return;
    }
    try {
      setLoading(true);
      const payload = {
        id,
        username,
        email,
        restriction: permissions,
        ...(password ? { password } : {}),
      };
      const response = await UpdateAdminApi(payload);
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

  const getAdmin = async () => {
    try {
      const response = await OneAdminApi(id);
      if (response?.success) {
        setFormValues({
          username: response?.result?.username || "",
          email: response?.result?.email || "",
          password: "",
        });
        setPermissions(mergePermissions(response?.result?.restriction));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAdmin();
  }, []);

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

      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="border-b px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-800">Update Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit admin account details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <InputField
            label="Username"
            name="username"
            value={username}
            onChange={handleChange}
            error={errors.username}
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputField
            label="Password (leave blank to keep current)"
            name="password"
            type="password"
            value={password}
            onChange={handleChange}
            error={errors.password}
          />

          <SelectField
            label="Permissions Preset"
            name="permissionPreset"
            options={[
              { label: "Partially Full", value: "partial" },
              { label: "View Only", value: "view" },
              { label: "Full Access", value: "full" },
            ]}
            value={permissionPreset}
            onChange={(e) => applyPreset(e.target.value)}
          />

          <div className="rounded-xl border border-gray-200">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">
                Module Permissions
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Choose what this admin can view, add, edit, or delete.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white">
                  <tr className="text-left text-gray-600">
                    <th className="px-4 py-3 font-medium">Module Name</th>
                    <th className="px-4 py-3 font-medium">View</th>
                    <th className="px-4 py-3 font-medium">Add</th>
                    <th className="px-4 py-3 font-medium">Edit</th>
                    <th className="px-4 py-3 font-medium">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {permissions.map((row, index) => (
                    <tr key={row.module} className="text-gray-700">
                      <td className="px-4 py-3">{row.module}</td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.view}
                          onChange={() => togglePermission(index, "view")}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.add}
                          onChange={() => togglePermission(index, "add")}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.edit}
                          onChange={() => togglePermission(index, "edit")}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.delete}
                          onChange={() => togglePermission(index, "delete")}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Update Admin
            </button>
          </div>
        </form>
      </div>
    </CardContainer>
  );
};

export default UpdateAdminPage;
