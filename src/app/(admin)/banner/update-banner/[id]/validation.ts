export const validation = (values: any) => {
  const errors: Record<string, string> = {};
  if (!values.title || !values.title.trim()) {
    errors.title = "Title is required";
  }
  return errors;
};
