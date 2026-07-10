export const Validation = (payload: any) => {
  const err: any = {};
  const { email, password } = payload;
  if (!email) {
    err.email = "Email is required";
  }
  if (!password) {
    err.password = "Password is required";
  }
  return err;
};
