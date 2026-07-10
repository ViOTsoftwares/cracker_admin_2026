export const validation = (values: any, isSub: boolean) => {
  const errors: Record<string, string> = {};

  if (!values.module?.trim()) {
    errors.moduleName = "Module name is required";
  }

  if (!values.submodule?.trim() && isSub) {
    errors.submoduleName = "Submodule name is required";
  }

  if (!values.status?.trim()) {
    errors.status = "Status is required";
  }

  return errors;
};
