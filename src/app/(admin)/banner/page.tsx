"use client";

import React, { useMemo, useRef } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { Edit, Trash2 } from "lucide-react";
import { toastMessage } from "@/lib/toast.message";
import ServerSIdeTable, { ServerSideTableRef } from "@/components/GlobalTable/ServerSIdeTable";
import Swal from "sweetalert2";
import Breadcrumbs from "@/components/Breadcrumbs";
import { usePermission } from "@/hooks/usePermission";
import { DeleteBannerApi, GetBannerApi } from "@/Api/banner";
import { getImageUrl } from "@/lib/imageHelper";

export default function BannerList() {
  const tableRef = useRef<ServerSideTableRef>(null);
  const navigate = useRouter();
  const permission = usePermission("Banner");

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        accessorKey: "title",
        header: "Title",
        meta: { filterType: "text" },
      },
      {
        accessorKey: "desktopImage",
        header: "Desktop Image",
        enableColumnFilter: false,
        cell: (info) => {
          const val = info.getValue<string>();
          return val ? (
            <img
              src={getImageUrl(val, "banners")}
              alt="Desktop Banner"
              className="h-10 w-20 rounded border bg-gray-50 object-cover animate-fade-in"
            />
          ) : (
            <span className="text-xs text-gray-400">No Image</span>
          );
        },
      },
      {
        accessorKey: "mobileImage",
        header: "Mobile Image",
        enableColumnFilter: false,
        cell: (info) => {
          const val = info.getValue<string>();
          return val ? (
            <img
              src={getImageUrl(val, "banners")}
              alt="Mobile Banner"
              className="h-10 w-10 rounded border bg-gray-50 object-cover animate-fade-in"
            />
          ) : (
            <span className="text-xs text-gray-400">No Image</span>
          );
        },
      },
      {
        accessorKey: "link",
        header: "Link",
        meta: { filterType: "text" },
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: {
          filterType: "select",
          filterOptions: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ],
        },
        cell: (info) => {
          const val = info.getValue<string>();
          return (
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium capitalize transition-all
                ${val === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: "sortOrder",
        header: "Sort Order",
        meta: { filterType: "number" },
      },
      {
        id: "actions",
        header: "Action",
        enableColumnFilter: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {permission.edit && (
              <button
                type="button"
                onClick={() => {
                  navigate.push("/banner/update-banner/" + row?.original?._id);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Edit"
              >
                <Edit size={16} />
              </button>
            )}

            {permission.delete && (
              <button
                type="button"
                onClick={() => {
                  handleDelete(row?.original?._id);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
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
    const body = {
      page: pageIndex + 1,
      limit: pageSize,
      filter,
    };
    const res = await GetBannerApi(body);
    return {
      data: res?.result?.list || [],
      total: res?.result?.count || 0,
    };
  };

  const handleDelete = async (id: any) => {
    try {
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
          const response: any = await DeleteBannerApi({ id });
          if (response.success) {
            toastMessage(response.message, "success");
            tableRef.current?.reload();
          } else {
            toastMessage(response.message, "error");
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="space-y-5">
      <Breadcrumbs path="Banner" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your mobile and desktop banners
          </p>
        </div>

        {permission.add && (
          <button
            onClick={() => {
              navigate.push("/banner/add-banner");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#020617] hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-2"
          >
            <span className="text-lg leading-none">+</span>
            Add Banner
          </button>
        )}
      </div>

      <div className="h-px bg-gray-200" />
      <ServerSIdeTable ref={tableRef} columns={columns} fetchApi={fetchData} />
    </div>
  );
}
