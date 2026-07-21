"use client";

import React, { useMemo, useRef } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { Eye } from "lucide-react";
import ServerSIdeTable, {
  FilterType,
  ServerSideTableRef,
} from "@/components/GlobalTable/ServerSIdeTable";
import { capitalize } from "@/lib/adminFun";
import { usePermission } from "@/hooks/usePermission";
import { GetUserListApi } from "@/Api/user";

export default function UserList() {
  const tableRef = useRef<ServerSideTableRef>(null);

  const navigate = useRouter();
  const permission = usePermission("Users");
  
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        accessorKey: "name",
        header: "Name",
        meta: { filterType: "text" },
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: { filterType: "text" },
      },
      {
        accessorKey: "phone",
        header: "Phone",
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
          const value = info.getValue<string>();
          return (
            <span
              className={`px-2 py-1 rounded text-sm font-medium ${
                value == "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {capitalize(value || "active")}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        enableColumnFilter: false,

        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {/* VIEW BUTTON */}
            {permission.view && (
              <button
                type="button"
                onClick={() => {
                  navigate.push("/users/view/" + row?.original?._id);
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
                title="View"
              >
                <Eye size={16} />
              </button>
            )}
          </div>
        ),
      },
    ];

    return baseColumns;
  }, [navigate, permission.view]);

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

    const res = await GetUserListApi(body);
    return {
      data: res?.result?.list || [],
      total: res?.result?.count || 0,
    };
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li>
            <a href="/" className="hover:text-blue-600 transition-colors">
              Dashboard
            </a>
          </li>
          <li className="text-gray-400">/</li>
          <li className="font-medium text-gray-800">Users</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all your users in one place
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Table */}
      <ServerSIdeTable ref={tableRef} columns={columns} fetchApi={fetchData} />
    </div>
  );
}
