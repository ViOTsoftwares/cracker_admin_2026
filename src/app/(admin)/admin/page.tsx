"use client";

import React, { useMemo, useRef } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { Edit, Trash2 } from "lucide-react";
import { toastMessage } from "@/lib/toast.message";
import ServerSIdeTable from "@/components/GlobalTable/ServerSIdeTable";
import Swal from "sweetalert2";
import Breadcrumbs from "@/components/Breadcrumbs";
import { AdminListApi, DeleteAdminApi } from "@/Api/admin";
import { usePermission } from "@/hooks/usePermission";

export default function List() {
  const tableRef = useRef<{ reload: () => void }>(null);
  const navigate = useRouter();
  const adminPermission = usePermission("Admin");
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        accessorKey: "username",
        header: "Username",
        meta: { filterType: "text" },
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: { filterType: "text" },
      },
      {
        accessorKey: "role",
        header: "Role",
        meta: { filterType: "text" },
      },
      {
        id: "restriction",
        header: "Permissions",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const count = Array.isArray(row?.original?.restriction)
            ? row.original.restriction.length
            : 0;
          return (
            <button
              type="button"
              onClick={() => {
                const list = Array.isArray(row?.original?.restriction)
                  ? row.original.restriction
                  : [];
                if (list.length === 0) {
                  Swal.fire({
                    title: "Permissions",
                    text: "No modules assigned",
                    icon: "info",
                  });
                  return;
                }
                const rowsHtml = list
                  .map(
                    (item: any) =>
                      `<tr>
                        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${item.module}</td>
                        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.view ? "Yes" : "No"}</td>
                        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.add ? "Yes" : "No"}</td>
                        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.edit ? "Yes" : "No"}</td>
                        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.delete ? "Yes" : "No"}</td>
                      </tr>`,
                  )
                  .join("");
                Swal.fire({
                  title: "Module Permissions",
                  width: 700,
                  html: `
                    <div style="overflow:auto;max-height:60vh;">
                      <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <thead>
                          <tr>
                            <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #e5e7eb;">Module Name</th>
                            <th style="text-align:center;padding:6px 8px;border-bottom:1px solid #e5e7eb;">View</th>
                            <th style="text-align:center;padding:6px 8px;border-bottom:1px solid #e5e7eb;">Add</th>
                            <th style="text-align:center;padding:6px 8px;border-bottom:1px solid #e5e7eb;">Edit</th>
                            <th style="text-align:center;padding:6px 8px;border-bottom:1px solid #e5e7eb;">Delete</th>
                          </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                      </table>
                    </div>
                  `,
                });
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {count} modules
            </button>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        enableColumnFilter: false,

        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {/* EDIT BUTTON */}
            {adminPermission.edit && (
            <button
              type="button"
              onClick={() => {
                if (!adminPermission.edit) {
                  toastMessage("You don't have permission to edit", "error");
                  return;
                }
                navigate.push("/admin/update-admin/" + row?.original?._id);
              }}
              disabled={!adminPermission.edit}
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
            {adminPermission.delete && (
            <button
              type="button"
              onClick={() => {
                if (!adminPermission.delete) {
                  toastMessage("You don't have permission to delete", "error");
                  return;
                }
                handleDelete(row?.original?._id);
              }}
              disabled={!adminPermission.delete}
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
  }, [navigate, adminPermission.edit, adminPermission.delete]);

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

    const res = await AdminListApi(body);
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
          const reponse: any = await DeleteAdminApi({ id });
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
      <Breadcrumbs path="Admin" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all your admin in one place
          </p>
        </div>

        {adminPermission.add && (
<button
          onClick={() => {
            if (!adminPermission.add) {
              toastMessage("You don't have permission to add", "error");
              return;
            }
            navigate.push("/admin/add-admin");
          }}
          disabled={!adminPermission.add}
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
          Add Admin
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
