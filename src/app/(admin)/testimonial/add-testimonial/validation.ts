export const validation = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.title?.trim()) {
    errors.title = "Title is required";
  }

  if (!values.description?.trim()) {
    errors.description = "Description is required";
  }
  if (!values.name?.trim()) {
    errors.name = "Client name is required";
  }

  if (!values.image && !values.id) {
    errors.image = "Image is required";
  }

  return errors;
};
