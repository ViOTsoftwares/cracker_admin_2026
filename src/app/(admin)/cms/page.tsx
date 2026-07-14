"use client";

import React, { useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { usePathname, useRouter } from "next/navigation";

import { Edit, Trash2 } from "lucide-react";
import { toastMessage } from "@/lib/toast.message";
import ServerSIdeTable from "@/components/GlobalTable/ServerSIdeTable";
import Swal from "sweetalert2";
import Breadcrumbs from "@/components/Breadcrumbs";
import { usePermission } from "@/hooks/usePermission";
import { DeleteCMSApi, GetCMSApi } from "@/Api/cms";

export default function List() {
  const tableRef = useRef<{ reload: () => void }>(null);
  const navigate = useRouter();
  const permission = usePermission("CMS");
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        accessorKey: "title",
        header: "Title",
        meta: { filterType: "text" },
      },
      {
        accessorKey: "identifier",
        header: "Identifier",
        meta: { filterType: "text" },
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
                navigate.push("/cms/update-cms/" + row?.original?._id);
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

    const res = await GetCMSApi(body);
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
          const reponse: any = await DeleteCMSApi({ id });
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
      <Breadcrumbs path="CMS" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">CMS</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all your cms in one place
          </p>
        </div>

        {permission.add && (
<button
          onClick={() => {
            navigate.push("/cms/add-cms");
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
          Add CMS
        </button>
)}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Table */}
      <ServerSIdeTable ref={tableRef} columns={columns} fetchApi={fetchData} />
    </div>
  );
}
