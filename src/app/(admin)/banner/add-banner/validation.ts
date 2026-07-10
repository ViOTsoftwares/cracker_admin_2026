export const validation = (values: any) => {
  const errors: Record<string, string> = {};
  if (!values.title || !values.title.trim()) {
    errors.title = "Title is required";
  }
  if (!values.desktopImage) {
    errors.desktopImage = "Desktop image is required";
  }
  if (!values.mobileImage) {
    errors.mobileImage = "Mobile image is required";
  }
  return errors;
};
