

interface SettingsPayload {
  title: string;
  address: string;
  project: string;
  client: string;
  phone: string;
  email: string;
  logo: File | null;
  favicon?: File | null;
  linkedinlink?: string;
  xlink?: string;
  instagramlink?: string;
  facebooklink?: string;
  deliveryFee?: number | string;
}

 type ValidationErrors = Partial<
  Record<keyof SettingsPayload, string>
>;

export const validation = (
  payload: SettingsPayload,
  hasExistingLogo: boolean = false
): ValidationErrors => {
  const err: ValidationErrors = {};

  const {
    title,
    address,
    project,
    client,
    phone,
    email,
    logo,
    favicon,
    linkedinlink,
    xlink,
    instagramlink,
    facebooklink,
  } = payload;

  if (!title.trim()) err.title = "Title is required";
  if (!address.trim()) err.address = "Address is required";
  if (!project.trim()) err.project = "Project name is required";
  if (!client.trim()) err.client = "Client name is required";

  if (!phone.trim()) {
    err.phone = "Phone is required";
  } else if (!/^[0-9+\-\s()]{7,15}$/.test(phone)) {
    err.phone = "Invalid phone number";
  }

  if (!email.trim()) {
    err.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    err.email = "Invalid email address";
  }

  if (!logo && !hasExistingLogo) {
    err.logo = "Logo is required";
  } else if (logo instanceof File) {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(logo.type)) {
      err.logo = "Only PNG, JPG, or WEBP images allowed";
    } else if (logo.size > maxSize) {
      err.logo = "Logo must be smaller than 2MB";
    }
  }

  if (favicon instanceof File) {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(favicon.type)) {
      err.favicon = "Only PNG, JPG, WEBP or ICO images allowed";
    } else if (favicon.size > maxSize) {
      err.favicon = "Favicon must be smaller than 2MB";
    }
  }

  const isValidUrl = (value?: string) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  if (linkedinlink && !isValidUrl(linkedinlink)) {
    err.linkedinlink = "Invalid URL";
  }
  if (xlink && !isValidUrl(xlink)) {
    err.xlink = "Invalid URL";
  }
  if (instagramlink && !isValidUrl(instagramlink)) {
    err.instagramlink = "Invalid URL";
  }
  if (facebooklink && !isValidUrl(facebooklink)) {
    err.facebooklink = "Invalid URL";
  }

  return err;
};

