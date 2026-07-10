"use client";

import React, { useMemo, useRef } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Edit, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

import Breadcrumbs from "@/components/Breadcrumbs";
import ServerSIdeTable from "@/components/GlobalTable/ServerSIdeTable";
import { usePermission } from "@/hooks/usePermission";
import { toastMessage } from "@/lib/toast.message";
import {
  DeleteEmailTemplateApi,
  GetEmailTemplateApi,
} from "@/Api/emailTemplate";

export default function EmailTemplateList() {
  const tableRef = useRef<{ reload: () => void }>(null);
  const navigate = useRouter();
  const permission = usePermission("Email Templates");

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
          const response: any = await DeleteEmailTemplateApi({ id });
          if (response.success) {
            toastMessage(response.message, "success");
            tableRef.current?.reload();
          } else {
            toastMessage(response.message, "error");
          }
        }
      });
    } catch (error) {
      toastMessage("Something went wrong", "error");
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "subject",
        header: "Subject",
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
            {permission.edit && (
              <button
                type="button"
                onClick={() =>
                  navigate.push(
                    "/email-template/update-email-template/" +
                      row?.original?._id,
                  )
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Edit"
              >
                <Edit size={16} />
              </button>
            )}

            {permission.delete && (
              <button
                type="button"
                onClick={() => handleDelete(row?.original?._id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [navigate, permission.edit, permission.delete],
  );

  const fetchData = async ({
    pageIndex,
    pageSize,
    filter,
  }: {
    pageIndex: number;
    pageSize: number;
    filter: any;
  }) => {
    const response = await GetEmailTemplateApi({
      page: pageIndex + 1,
      limit: pageSize,
      filter,
    });

    return {
      data: response?.result?.list || [],
      total: response?.result?.count || 0,
    };
  };

  return (
    <div className="space-y-5">
      <Breadcrumbs path="Email Templates" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Email Templates
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage reusable email subjects and content
          </p>
        </div>

        {permission.add && (
          <button
            onClick={() => navigate.push("/email-template/add-email-template")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#020617] hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-2"
          >
            <Plus size={18} />
            Add Template
          </button>
        )}
      </div>

      <div className="h-px bg-gray-200" />

      <ServerSIdeTable ref={tableRef} columns={columns} fetchApi={fetchData} />
    </div>
  );
}
