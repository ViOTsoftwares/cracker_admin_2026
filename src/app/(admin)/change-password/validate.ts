interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
export const validate = (payload: any): FormErrors => {
  const err: FormErrors = {};

  if (!payload.currentPassword)
    err.currentPassword = "Current password required";

  if (!payload.newPassword) err.newPassword = "New password required";
  else if (payload.newPassword.length < 6)
    err.newPassword = "Minimum 6 characters";

  if (!payload.confirmPassword)
    err.confirmPassword = "Confirm password required";
  if (payload.confirmPassword !== payload.newPassword)
    err.confirmPassword = "Passwords do not match";

  return err;
};
