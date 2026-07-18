"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Pagination from "rc-pagination";
import "../../../node_modules/rc-pagination/assets/index.css";

import { useDebounce } from "./useDebounce";
import SpinnerLoader from "../Spinner";

/* ===================== TYPES ===================== */
export type FilterType = "text" | "number" | "date" | "select";

export interface ColumnMeta {
  filterType?: FilterType;
  options?: string[];
  filterOptions?: { label: string; value: string }[];
}

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface ServerSideTableProps<T extends object> {
  columns: ColumnDef<T, any>[];
  fetchApi: (params: {
    pageIndex: number;
    pageSize: number;
    filter: Record<string, any>;
  }) => Promise<{ data: T[]; total: number }>;
  rowClassName?: (row: T) => string;
}

export interface ServerSideTableRef {
  reload: () => void;
  getFilters: () => Record<string, any>;
}

/* ===================== COMPONENT ===================== */
function ServerSideTableInner<T extends object>(
  { columns, fetchApi, rowClassName }: ServerSideTableProps<T>,
  ref: React.Ref<ServerSideTableRef>,
) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filterInputs, setFilterInputs] = useState<Record<string, any>>({});
  
  const [pageIndex, setPageIndex] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const page = params.get("page");
      return page ? parseInt(page, 10) : 0;
    }
    return 0;
  });

  const [pageSize, setPageSize] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const limit = params.get("limit");
      return limit ? parseInt(limit, 10) : 5;
    }
    return 5;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("page", pageIndex.toString());
      url.searchParams.set("limit", pageSize.toString());
      window.history.replaceState(null, "", url.toString());
    }
  }, [pageIndex, pageSize]);

  const debouncedFilters = useDebounce(filterInputs, 500);

  /* ===================== FILTER FORMAT ===================== */
  const formattedFilters = useMemo(() => {
    const out: Record<string, any> = {};

    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (!value) return;

      const col = columns.find((c: any) => c.accessorKey === key) as any;

      const type = col?.meta?.filterType as FilterType | undefined;

      if (type === "date") out[`fd_${key}`] = value;
      else if (type === "number") out[`fn_${key}`] = value;
      else out[`fs_${key}`] = value;
    });

    return out;
  }, [debouncedFilters, columns]);

  /* ===================== DATA FETCH ===================== */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi({
        pageIndex,
        pageSize,
        filter: formattedFilters,
      });
      setData(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchApi, pageIndex, pageSize, formattedFilters]);

  useImperativeHandle(ref, () => ({ 
    reload: loadData,
    getFilters: () => formattedFilters
  }), [loadData, formattedFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ===================== TABLE ===================== */
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(total / pageSize),
    state: { pagination: { pageIndex, pageSize } },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  /* ===================== UI ===================== */
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="border-b bg-gray-50">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-3 text-left text-sm font-medium text-gray-600"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}

            {/* FILTER ROW */}
            <tr className="border-t">
              {table.getAllLeafColumns().map((column) => {
                const meta = column.columnDef.meta as ColumnMeta | undefined;

                if (!meta?.filterType) {
                  return <th key={column.id} />;
                }

                const key =
                  "accessorKey" in column.columnDef &&
                  column.columnDef.accessorKey
                    ? String(column.columnDef.accessorKey)
                    : column.id;

                return (
                  <th key={column.id} className="px-4 py-2">
                    {/* TEXT / NUMBER */}
                    {(meta.filterType === "text" ||
                      meta.filterType === "number") && (
                      <input
                        type={meta.filterType === "number" ? "number" : "text"}
                        value={filterInputs[key] ?? ""}
                        onChange={(e) =>
                          setFilterInputs((p) => ({
                            ...p,
                            [key]: e.target.value,
                          }))
                        }
                        className="h-10 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    )}

                    {/* DATE */}
                    {meta.filterType === "date" && (
                      <input
                        type="date"
                        value={filterInputs[key] ?? ""}
                        onChange={(e) =>
                          setFilterInputs((p) => ({
                            ...p,
                            [key]: e.target.value,
                          }))
                        }
                        className="h-10 w-full rounded-lg border px-3 text-sm border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      />
                    )}

                    {/* SELECT */}
                    {meta.filterType === "select" && meta.filterOptions && (
                      <select
                        value={filterInputs[key] ?? ""}
                        onChange={(e) =>
                          setFilterInputs((p) => ({
                            ...p,
                            [key]: e.target.value,
                          }))
                        }
                        className="h-10 w-full rounded-lg border px-3 text-sm
               border-gray-300 bg-white
               focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All</option>

                        {meta.filterOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center">
                  {/* Loading... */}
                  <SpinnerLoader />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center">
                  No data found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={rowClassName ? rowClassName(row.original) : ""}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-4 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="flex justify-between items-center px-5 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(0);
              }}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
            <span>entries</span>
          </div>
          
          {total > pageSize && (
            <Pagination
              current={pageIndex + 1}
              pageSize={pageSize}
              total={total}
              onChange={(page) => setPageIndex(page - 1)}
              showLessItems
              showTitle={false}
            />
          )}
        </div>
      )}
    </div>
  );
}

const ServerSideTable = forwardRef(ServerSideTableInner) as <T extends object>(
  props: ServerSideTableProps<T> & { ref?: React.Ref<ServerSideTableRef> },
) => JSX.Element;

export default ServerSideTable;
