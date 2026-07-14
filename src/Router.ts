export interface SubMenu {
  label: string;
  path: string;
}

export interface Menu {
  label: string;
  path?: string;
  icon?: string;
  subMenu?: SubMenu[];
}

export const menuList: Menu[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: "LayoutDashboard",
  },
  {
    label: "Products",
    path: "/products",
    icon: "ShoppingBag",
  },
  {
    label: "Orders",
    path: "/orders",
    icon: "ClipboardList",
  },
  {
    label: "Projects",
    icon: "Briefcase",
    subMenu: [
      { label: "Banner", path: "/banner" },
      { label: "Testimonial", path: "/testimonial" },
      { label: "Categories", path: "/categories" },
      { label: "Blogs", path: "/blogs" },
    ],
  },
  {
    label: "Settings",
    icon: "Settings",
    subMenu: [
      { label: "CMS", path: "/cms" },
      { label: "Site Content", path: "/settings" },
    ],
  },
  {
    label: "Email Templates",
    path: "/email-template",
    icon: "Mail",
  },
  {
    label: "Admin Controller",
    icon: "ShieldCheck",
    subMenu: [
      { label: "Admin", path: "/admin" },
      { label: "Modules", path: "/module" },
    ],
  },
];
