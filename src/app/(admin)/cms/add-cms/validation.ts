export const validation = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.title?.trim()) {
    errors.title = "Title is required";
  }

  if (!values.identifier?.trim()) {
    errors.identifier = "Identifier is required";
  }

  if (!values.content) {
    errors.content = "Content is required";
  }

  return errors;
};
