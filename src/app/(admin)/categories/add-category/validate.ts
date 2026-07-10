export const validation = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.name?.trim()) {
    errors.name = "Name is required";
  }

  if (!values.slug?.trim()) {
    errors.slug = "Slug is required";
  }

  if (!values.image && !values.id) {
    errors.image = "Image is required";
  }

  return errors;
};
