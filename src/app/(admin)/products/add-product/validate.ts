export const validation = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.name?.trim()) {
    errors.name = "Product name is required";
  }

  if (!values.slug?.trim()) {
    errors.slug = "Slug is required";
  }

  if (!values.category?.trim()) {
    errors.category = "Category is required";
  }

  if (values.originalPrice === undefined || values.originalPrice === "") {
    errors.originalPrice = "Original price is required";
  } else if (isNaN(Number(values.originalPrice)) || Number(values.originalPrice) < 0) {
    errors.originalPrice = "Original price must be a non-negative number";
  }

  if (values.offerPrice === undefined || values.offerPrice === "") {
    errors.offerPrice = "Offer price is required";
  } else if (isNaN(Number(values.offerPrice)) || Number(values.offerPrice) < 0) {
    errors.offerPrice = "Offer price must be a non-negative number";
  } else if (Number(values.offerPrice) > Number(values.originalPrice)) {
    errors.offerPrice = "Offer price cannot exceed original price";
  }

  if (!values.image && (!values.images || values.images.length === 0) && !values.id) {
    errors.image = "At least one product image is required";
  }

  return errors;
};
