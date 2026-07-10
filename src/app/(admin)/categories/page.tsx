"use client";

import React, { useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { toastMessage } from "@/lib/toast.message";
import ServerSIdeTable from "@/components/GlobalTable/ServerSIdeTable";
import Swal from "sweetalert2";
import Breadcrumbs from "@/components/Breadcrumbs";
import { usePermission } from "@/hooks/usePermission";
import { DeleteCategoryApi, GetCategoryApi } from "@/Api/category";

export default function CategoryList() {
  const tableRef = useRef<{ reload: () => void }>(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const navigate = useRouter();
  const permission = usePermission("All Categories");

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        accessorKey: "image",
        header: "Image",
        enableColumnFilter: false,
        cell: (info) => {
          const val = info.getValue<string>();
          return val ? (
            <img
              src={val}
              alt="Category"
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
        header: "Category Name",
        meta: { filterType: "text" },
      },
      {
        accessorKey: "slug",
        header: "Slug",
        meta: { filterType: "text" },
      },
      {
        accessorKey: "description",
        header: "Description",
        enableColumnFilter: false,
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
                  navigate.push("/categories/update-category/" + row?.original?._id);
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
                ✏️
              </button>
            )}

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
                🗑️
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

    const res = await GetCategoryApi(body);
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
          const response: any = await DeleteCategoryApi({ id });
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
      <Breadcrumbs path={"Categories"} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your dynamic product categories
          </p>
        </div>

        {permission.add && (
          <button
            onClick={() => {
              navigate.push("/categories/add-category");
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
            Add Category
          </button>
        )}
      </div>

      <div className="h-px bg-gray-200" />

      <ServerSIdeTable ref={tableRef} columns={columns} fetchApi={fetchData} />
    </div>
  );
}
