export const validation = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.title?.trim()) {
    errors.title = "Title is required";
  }

  if (!values.content?.trim()) {
    errors.content = "Content is required";
  }

  if (!values.slug?.trim()) {
    errors.slug = "Slug is required";
  }
  if (!values.status?.trim()) {
    errors.status = "Status is required";
  }

  return errors;
};
