"use client";

import { useState } from "react";
import Link from "next/link";
import { Validation } from "./validation";
import { LoginApi } from "@/Api/auth";
import { GetMeApi } from "@/Api/admin";
import { menuList } from "@/Router";
import { toastMessage } from "@/lib/toast.message";
import { useRouter } from "next/navigation";
import { isEmpty } from "@/lib/isEmpty";
interface LoginFormValues {
  email: string;
  password: string;
}
export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const { email, password } = formValues;
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
      const err = Validation(formValues);
      console.log("----", err);
      if (!isEmpty(err)) {
        setErrors(err);
        return;
      }
      console.log(formValues);
      const response = await LoginApi(formValues);
      if (response.success) {
        toastMessage(response.message, "success");
        localStorage.setItem("adminToken", response.token);
        document.cookie = `adminToken=${response.token}; path=/; max-age=${60 * 60 * 24};`;
        try {
          const me = await GetMeApi();
          if (me?.success) {
            const restrictions = encodeURIComponent(
              JSON.stringify(me.result?.restriction || []),
            );
            const role = encodeURIComponent(me.result?.role || "");
            document.cookie = `adminRestriction=${restrictions}; path=/; max-age=${60 * 60 * 24}`;
            document.cookie = `adminRole=${role}; path=/; max-age=${60 * 60 * 24}`;

            const restrictionList = Array.isArray(me.result?.restriction)
              ? me.result.restriction
              : [];
            const getPerm = (label: string) =>
              restrictionList.find((r: any) => r?.module === label) || {};

            const permPaths = menuList.flatMap((menu) => {
              if (menu.subMenu && menu.subMenu.length > 0) {
                return menu.subMenu
                  .filter((sub) => Boolean(sub.path))
                  .map((sub) => {
                    const perm = getPerm(sub.label);
                    return {
                      path: sub.path,
                      view: Boolean(perm.view),
                      add: Boolean(perm.add),
                      edit: Boolean(perm.edit),
                    };
                  });
              }
              if (menu.path) {
                const perm = getPerm(menu.label);
                return [
                  {
                    path: menu.path,
                    view: Boolean(perm.view),
                    add: Boolean(perm.add),
                    edit: Boolean(perm.edit),
                  },
                ];
              }
              return [];
            });

            const permPathsCookie = encodeURIComponent(
              JSON.stringify(permPaths),
            );
            document.cookie = `adminPermPaths=${permPathsCookie}; path=/; max-age=${60 * 60 * 24}`;
          }
        } catch (err) {
          console.log(err);
        }
        // navigate.push("/");
        window.location.href = "/";
      } else {
        toastMessage(response.message, "error");
        setLoading(false);
        setErrors((prev) => ({ ...prev, ...response.errors }));
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="signin-wrapper">
      <div className="signin-card">
        {/* Header */}
        <div className="signin-header">
          <h1>Admin Sign In</h1>
          <p>Welcome back, please login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="field">
            <label>Email</label>
            <input
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter email"
            />
            {errors && <p>{errors.email}</p>}
          </div>

          {/* Password with Eye */}
          <div className="field password-field">
            <label>Password</label>

            <div className="password-wrapper input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Enter password"
              />

              <div
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </div>
            </div>
          </div>
          {errors && <p>{errors.password}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="signin-footer">
          <Link href="/">← Back to Admin</Link>
        </div>
      </div>
    </div>
  );
}
