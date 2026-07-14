"use client";

import React, { useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { usePathname, useRouter } from "next/navigation";

import { Edit, Trash2, Download, Upload, FileDown } from "lucide-react";
import { toastMessage } from "@/lib/toast.message";
import ServerSIdeTable from "@/components/GlobalTable/ServerSIdeTable";
import Swal from "sweetalert2";
import Breadcrumbs from "@/components/Breadcrumbs";
import { usePermission } from "@/hooks/usePermission";
import { DeleteProductApi, GetProductApi, ExportProductsApi, ImportProductsApi } from "@/Api/product";
import { getImageUrl } from "@/lib/imageHelper";

export default function List() {
  const tableRef = useRef<{ reload: () => void }>(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const navigate = useRouter();
  const permission = usePermission("All Products");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadSample = () => {
    const headers = ["Name", "Slug", "Category Name", "Brand", "Original Price", "Offer Price", "Stock", "Safety Info", "Notes", "Is Featured"];
    const sampleRows = [
      ["Sparkling Flower Pots", "sparkling-flower-pots", "Flower Pots", "Siva Brand", "250", "180", "100", "Keep away from face while lighting", "Store in dry place", "Yes"],
      ["Laxmi Crackers 28ch", "laxmi-crackers-28ch", "Sound Crackers", "Standard Brand", "150", "90", "200", "Light from distance and run away", "Use outdoors only", "No"]
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return "";
      let str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        str = str.replace(/"/g, '""');
        return `"${str}"`;
      }
      return str;
    };

    const csvContent = [
      headers.join(","),
      ...sampleRows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "products_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastMessage("Sample CSV template downloaded", "success");
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await ExportProductsApi();
      if (!res.success) {
        toastMessage(res.message || "Failed to export products", "error");
        return;
      }

      const products = res.result || [];
      if (products.length === 0) {
        toastMessage("No products found to export", "info");
        return;
      }

      const headers = ["Name", "Slug", "Category Name", "Brand", "Original Price", "Offer Price", "Stock", "Safety Info", "Notes", "Is Featured"];
      const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return "";
        let str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
          str = str.replace(/"/g, '""');
          return `"${str}"`;
        }
        return str;
      };

      const csvRows = [headers.join(",")];
      for (const p of products) {
        const row = [
          escapeCSV(p.name),
          escapeCSV(p.slug),
          escapeCSV(p.category?.name || ""),
          escapeCSV(p.brand || ""),
          p.originalPrice,
          p.offerPrice,
          p.stock || 0,
          escapeCSV(p.safetyInfo || ""),
          escapeCSV(p.notes || ""),
          p.isFeatured ? "Yes" : "No",
        ];
        csvRows.push(row.join(","));
      }

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `products_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toastMessage("Products exported successfully", "success");
    } catch (err) {
      console.error(err);
      toastMessage("Something went wrong during export", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const splitCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let currentVal = "";
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(currentVal);
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
    result.push(currentVal);
    return result;
  };

  const parseCSV = (text: string): any[] => {
    const lines: string[] = [];
    let currentLine = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === '\r' || char === '\n') {
        if (insideQuotes) {
          currentLine += char;
        } else {
          if (char === '\r' && nextChar === '\n') {
            i++; // skip next \n
          }
          lines.push(currentLine);
          currentLine = "";
        }
      } else {
        currentLine += char;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    if (lines.length === 0) return [];

    const rawHeaders = splitCSVLine(lines[0]);
    const headers = rawHeaders.map(h => h.trim().toLowerCase().replace(/[\s_]+/g, ''));

    const result: any[] = [];
    const headerMap: Record<string, string> = {
      name: "name",
      slug: "slug",
      categoryname: "categoryName",
      category: "categoryName",
      brand: "brand",
      originalprice: "originalPrice",
      original_price: "originalPrice",
      offerprice: "offerPrice",
      offer_price: "offerPrice",
      stock: "stock",
      safetyinfo: "safetyInfo",
      safety_info: "safetyInfo",
      notes: "notes",
      isfeatured: "isFeatured",
      is_featured: "isFeatured",
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = splitCSVLine(line);
      const obj: any = {};
      headers.forEach((h, index) => {
        const field = headerMap[h] || h;
        obj[field] = values[index] !== undefined ? values[index].trim() : "";
      });
      result.push(obj);
    }
    return result;
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) {
          toastMessage("Empty CSV file", "error");
          return;
        }

        const parsedProducts = parseCSV(text);
        if (parsedProducts.length === 0) {
          toastMessage("No products found in the CSV file", "error");
          return;
        }

        const res = await ImportProductsApi({ products: parsedProducts });
        if (res.success) {
          toastMessage(res.message || "Products imported successfully", "success");
          tableRef.current?.reload();
        } else {
          if (res.errors && Array.isArray(res.errors)) {
            Swal.fire({
              title: "Import Errors",
              icon: "error",
              html: `<div style="text-align: left; max-height: 300px; overflow-y: auto;">
                <ul style="list-style-type: disc; padding-left: 20px;">
                  ${res.errors.map((err: string) => `<li style="margin-bottom: 4px;">${err}</li>`).join("")}
                </ul>
              </div>`,
              confirmButtonText: "Close"
            });
          } else {
            toastMessage(res.message || "Failed to import products", "error");
          }
        }
      } catch (err) {
        console.error(err);
        toastMessage("Failed to parse CSV file", "error");
      } finally {
        setIsImporting(false);
      }
    };
    reader.onerror = () => {
      toastMessage("Failed to read file", "error");
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        accessorKey: "images",
        header: "Image",
        enableColumnFilter: false,
        cell: (info) => {
          const imgs = info.getValue<string[]>() || [];
          const primaryImg = imgs[0] || "";
          return primaryImg ? (
            <img
              src={getImageUrl(primaryImg, "products")}
              alt="Product"
              className="h-10 w-10 rounded-lg object-cover border bg-gray-50"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg border bg-gray-100 flex items-center justify-center text-xs text-gray-400">
              No Img
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Product Name",
        meta: { filterType: "text" },
      },
      {
        accessorKey: "category.name",
        header: "Category",
        enableColumnFilter: false,
        cell: (info) => info.getValue<string>() || "-",
      },
      {
        accessorKey: "originalPrice",
        header: "Original Price",
        enableColumnFilter: false,
        cell: (info) => `₹${info.getValue<number>() || 0}`,
      },
      {
        accessorKey: "offerPrice",
        header: "Offer Price",
        enableColumnFilter: false,
        cell: (info) => `₹${info.getValue<number>() || 0}`,
      },
      {
        accessorKey: "discountPercentage",
        header: "Offer Percentage",
        enableColumnFilter: false,
        cell: (info) => `${info.getValue<number>() || 0}%`,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        enableColumnFilter: false,
        cell: (info) => {
          const val = info.getValue<number>() || 0;
          return (
            <span className={`font-semibold ${val > 0 ? "text-green-600" : "text-red-600"}`}>
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: "isFeatured",
        header: "Featured",
        enableColumnFilter: false,
        cell: (info) => (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${info.getValue<boolean>()
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
          >
            {info.getValue<boolean>() ? "Featured" : "Standard"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Action",
        enableColumnFilter: false,

        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {/* EDIT BUTTON */}
            {permission.edit && (
              <button
                type="button"
                onClick={() => {
                  navigate.push("/products/update-product/" + row?.original?._id);
                }}
                className="
      inline-flex items-center justify-center
      h-9 w-9
      rounded-lg
      border border-gray-300
      bg-white
      text-gray-700
      transition
      hover:bg-gray-100
      hover:text-gray-900
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
    "
                title="Edit"
              >
                <Edit size={16} />
              </button>
            )}

            {/* DELETE BUTTON */}
            {permission.delete && (
              <button
                type="button"
                onClick={() => {
                  handleDelete(row?.original?._id);
                }}
                className="
      inline-flex items-center justify-center
      h-9 w-9
      rounded-lg
      bg-red-600
      text-white
      transition
      hover:bg-red-700
      focus:outline-none
      focus:ring-2
      focus:ring-red-500
    "
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ),
      },
    ];

    return baseColumns;
  }, [navigate, permission.edit, permission.delete]);

  const fetchData = async ({
    pageIndex,
    pageSize,
    filter,
  }: {
    pageIndex: number;
    pageSize: number;
    filter: any;
  }) => {
    // Build request body
    const body = {
      page: pageIndex + 1, // your API expects 1-based page
      limit: pageSize,
      filter,
    };
    console.log("...bodyyyyy", body);

    const res = await GetProductApi(body);
    console.log("resresres", res?.result?.list);
    return {
      data: res?.result?.list || [],
      total: res?.result?.count || 0,
    };
  };
  const handleDelete = async (id: any) => {
    try {
      console.log(id);
      Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const reponse: any = await DeleteProductApi({ id });
          if (reponse.success) {
            toastMessage(reponse.message, "success");
            tableRef.current?.reload();
          } else {
            toastMessage(reponse.message, "error");
          }
        }
      });
    } catch (error) {
      console.log(error, "kkkkkkkkkkkk");
    }
  };
  return (
    <div className="space-y-5">
      {/* Breadcrumbs */}
      <Breadcrumbs path={"Products"} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all your products in one place
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Download Template Button */}
          {permission.add && (
            <button
              onClick={handleDownloadSample}
              className="
                inline-flex items-center gap-2
                rounded-xl
                border border-gray-300
                bg-white px-5 py-3
                text-sm font-semibold text-gray-700
                shadow-sm
                transition-all duration-200
                hover:bg-gray-50
                hover:text-gray-900
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-2
              "
              title="Download Sample CSV Template"
            >
              <FileDown size={16} className="text-gray-500" />
              <span>Download Template</span>
            </button>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="
              inline-flex items-center gap-2
              rounded-xl
              border border-gray-300
              bg-white px-5 py-3
              text-sm font-semibold text-gray-700
              shadow-sm
              transition-all duration-200
              hover:bg-gray-50
              hover:text-gray-900
              active:scale-95
              disabled:opacity-50
              focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-2
            "
          >
            <Download size={16} className="text-gray-500" />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>

          {/* Import Button */}
          {permission.add && (
            <>
              <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="
                  inline-flex items-center gap-2
                  rounded-xl
                  border border-gray-300
                  bg-white px-5 py-3
                  text-sm font-semibold text-gray-700
                  shadow-sm
                  transition-all duration-200
                  hover:bg-gray-50
                  hover:text-gray-900
                  active:scale-95
                  disabled:opacity-50
                  focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-2
                "
              >
                <Upload size={16} className="text-gray-500" />
                <span>{isImporting ? "Importing..." : "Import CSV"}</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
            </>
          )}

          {/* Add Product Button */}
          {permission.add && (
            <button
              onClick={() => {
                navigate.push("/products/add-product");
              }}
              className="
                inline-flex items-center gap-2
                rounded-xl
                bg-[#0f172a] px-6 py-3
                text-sm font-semibold text-white
                shadow-md
                transition-all duration-200
                hover:bg-[#020617]
                hover:shadow-lg
                active:scale-95
                focus:outline-none
                focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-2
              "
            >
              <span className="text-lg leading-none">+</span>
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Table */}
      <ServerSIdeTable ref={tableRef} columns={columns} fetchApi={fetchData} />
    </div>
  );
}
