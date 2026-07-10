"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/authSlice";
import { UpdateProfileApi } from "@/Api/admin";
import { toastMessage } from "@/lib/toast.message";
import CardContainer from "@/components/CardContainer";
import { User, Mail, Phone, Shield, Camera } from "lucide-react";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    phone: "",
    role: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormValues({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
      });
      setPreviewUrl(user.profileImage || "/default-avatar.svg");
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!formValues.username.trim()) {
      tempErrors.username = "Username is required";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", formValues.username);
      formData.append("phone", formValues.phone);
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      const response = await UpdateProfileApi(formData);

      if (response.success) {
        toastMessage(
          response.message || "Profile updated successfully",
          "success",
        );
        dispatch(setUser(response.result));
        setSelectedFile(null);
      } else {
        if (response.errors) {
          setErrors(response.errors);
        } else {
          toastMessage(response.message || "Failed to update profile", "error");
        }
      }
    } catch (error) {
      toastMessage("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account information and preferences.
        </p>
      </div>

      <CardContainer>
        <form
          onSubmit={handleSubmit}
          className="divide-y divide-slate-150 dark:divide-slate-800"
        >
          {/* User Meta Header Section with Image Upload */}
          <div className="p-6 flex flex-col md:flex-row items-center gap-6">
            {/* Avatar picker container */}
            <div className="relative group shrink-0 select-none">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg shadow-indigo-500/20">
                <img
                  src={previewUrl || "/default-avatar.svg"}
                  alt={formValues.username}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Upload Overlay */}
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-[10px] font-semibold text-center p-2">
                <Camera className="w-5 h-5 mb-1 text-slate-200" />
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-center md:text-left space-y-1 flex-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {formValues.username || "Admin"}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 capitalize border border-indigo-100 dark:border-indigo-900/50 select-none">
                  <Shield className="w-3.5 h-3.5" />
                  {formValues.role || "subadmin"}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Account ID: {user?._id || "unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username Input */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-350">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={formValues.username}
                    onChange={handleChange}
                    className={`w-full rounded-lg border pl-10 pr-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white
                      focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                      ${
                        errors.username
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    placeholder="Enter username"
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email Input (Disabled / Read-only) */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-350">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formValues.email}
                    disabled
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-450 dark:text-slate-500 cursor-not-allowed select-all"
                  />
                </div>
                <p className="text-[11px] text-slate-405 mt-1 select-none">
                  Email address cannot be changed. Contact system administrators
                  for support.
                </p>
              </div>

              {/* Phone Input */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-350">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleChange}
                    className={`w-full rounded-lg border pl-10 pr-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white
                      focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                      ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Role Display (Disabled) */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-350">
                  Role
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Shield className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={formValues.role}
                    disabled
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-450 dark:text-slate-500 cursor-not-allowed capitalize"
                  />
                </div>
                <p className="text-[11px] text-slate-405 mt-1 select-none">
                  For security, roles can only be updated by a Super Admin.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3 rounded-b-xl">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 text-sm font-semibold shadow-md shadow-indigo-500/10 disabled:opacity-60 transition-all duration-200 cursor-pointer"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </CardContainer>
    </div>
  );
}
