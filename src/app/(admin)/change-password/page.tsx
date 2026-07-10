"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { validate } from "./validate";
import { isEmpty } from "@/lib/isEmpty";
import { toastMessage } from "@/lib/toast.message";
import { ChangePasswordApi } from "@/Api/auth";
import { useRouter } from "next/navigation";
import { handleLogout } from "@/lib/adminFun";
interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ChangePasswordPage() {
  const [formValues, setFormValues] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { confirmPassword, currentPassword, newPassword } = formValues;
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const navigate = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setFormValues((pre) => ({
      ...pre,
      [name]: value,
    }));
    if (value) {
      setErrors((pre) => ({ ...pre, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);

      const err = validate(formValues);
      if (!isEmpty(err)) {
        setErrors(err);
        setLoading(false);
        return;
      }
      const response = await ChangePasswordApi(formValues);
      if (response.success) {
        toastMessage(response.message, "success");
        setFormValues({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          handleLogout(navigate);
        }, 1000);
      } else {
        setLoading(false);
        setErrors((prev) => ({ ...prev, ...response.errors }));
      }
    } catch (error) {
      toastMessage("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-wrapper">
      <div className="signin-card">
        <div className="signin-header">
          <h1>Change Password</h1>
          <p>Keep your account secure</p>
        </div>

        <form className="signin-form" onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="field">
            <label>Current Password</label>
            <div className="password-wrapper">
              <input
                type={show.current ? "text" : "password"}
                name="currentPassword"
                value={currentPassword}
                onChange={handleChange}
              />
              <div
                className="eye-btn"
                onClick={() => setShow({ ...show, current: !show.current })}
              >
                {show.current ? "🙈" : "👁️"}
              </div>
            </div>
            {errors.currentPassword && (
              <small className="error">{errors.currentPassword}</small>
            )}
          </div>

          {/* New Password */}
          <div className="field">
            <label>New Password</label>
            <div className="password-wrapper">
              <input
                type={show.new ? "text" : "password"}
                name="newPassword"
                value={newPassword}
                onChange={handleChange}
              />
              <div
                className="eye-btn"
                onClick={() => setShow({ ...show, new: !show.new })}
              >
                {show.new ? "🙈" : "👁️"}
              </div>
            </div>
            {errors.newPassword && (
              <small className="error">{errors.newPassword}</small>
            )}
          </div>

          {/* Confirm Password */}
          <div className="field">
            <label>Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={show.confirm ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
              />
              <div
                className="eye-btn"
                onClick={() => setShow({ ...show, confirm: !show.confirm })}
              >
                {show.confirm ? "🙈" : "👁️"}
              </div>
            </div>
            {errors.confirmPassword && (
              <small className="error">{errors.confirmPassword}</small>
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
