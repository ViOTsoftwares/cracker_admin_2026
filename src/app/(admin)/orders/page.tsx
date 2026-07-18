"use client";

import React, { useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toastMessage } from "@/lib/toast.message";
import ServerSIdeTable from "@/components/GlobalTable/ServerSIdeTable";
import Swal from "sweetalert2";
import Breadcrumbs from "@/components/Breadcrumbs";
import { usePermission } from "@/hooks/usePermission";
import { GetOrdersApi, UpdateOrderStatusApi, ExportOrdersApi } from "@/Api/order";
import { Edit, Download } from "lucide-react";

export default function OrderList() {
  const tableRef = useRef<{ reload: () => void; getFilters: () => Record<string, any> }>(null);
  const permission = usePermission("Orders");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const currentFilters = tableRef.current?.getFilters ? tableRef.current.getFilters() : {};
      const res = await ExportOrdersApi(currentFilters);
      if (!res.success) {
        toastMessage(res.message || "Failed to export orders", "error");
        return;
      }

      const orders = res.result || [];
      if (orders.length === 0) {
        toastMessage("No orders found to export", "info");
        return;
      }

      const headers = [
        "Order ID",
        "Date",
        "Customer Name",
        "Customer Email",
        "Customer Phone",
        "City",
        "Total Amount",
        "Payment Method",
        "Payment Status",
        "Order Status",
        "Items",
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

      const csvRows = [headers.join(",")];
      for (const o of orders) {
        const u = o.user || {};
        const itemsStr = (o.items || [])
          .map((i: any) => `${i.product?.name || "Unknown"} x${i.quantity}`)
          .join(" | ");

        const dateStr = o.createdAt
          ? new Date(o.createdAt).toLocaleString("en-IN")
          : "";

        const row = [
          escapeCSV(o.orderId),
          escapeCSV(dateStr),
          escapeCSV(u.name || "Guest"),
          escapeCSV(u.email || ""),
          escapeCSV(o.shippingAddress?.phone || u.phone || ""),
          escapeCSV(o.shippingAddress?.city || ""),
          o.total || 0,
          escapeCSV(o.paymentMethod || ""),
          escapeCSV(o.paymentStatus || ""),
          escapeCSV(o.orderStatus || ""),
          escapeCSV(itemsStr),
        ];
        csvRows.push(row.join(","));
      }

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `orders_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toastMessage("Orders exported successfully", "success");
    } catch (err) {
      console.error(err);
      toastMessage("Something went wrong during export", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleEditStatus = async (order: any) => {
    if (!permission.edit) {
      toastMessage("You don't have permission to edit orders", "error");
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: `<span class="text-lg font-bold text-slate-800">Update Order #${order.orderId}</span>`,
      html: `
        <div style="text-align: left; font-family: inherit;" class="space-y-4 px-2">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Order Status</label>
            <select id="swal-order-status" class="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="pending" ${order.orderStatus === "pending" ? "selected" : ""}>Pending</option>
              <option value="processing" ${order.orderStatus === "processing" ? "selected" : ""}>Processing</option>
              <option value="shipped" ${order.orderStatus === "shipped" ? "selected" : ""}>Shipped</option>
              <option value="delivered" ${order.orderStatus === "delivered" ? "selected" : ""}>Delivered</option>
              <option value="cancelled" ${order.orderStatus === "cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1 font-sans">Payment Status</label>
            <select id="swal-payment-status" class="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="pending" ${order.paymentStatus === "pending" ? "selected" : ""}>Pending</option>
              <option value="paid" ${order.paymentStatus === "paid" ? "selected" : ""}>Paid</option>
              <option value="failed" ${order.paymentStatus === "failed" ? "selected" : ""}>Failed</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save Status",
      confirmButtonColor: "#0f172a",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const orderStatus = (document.getElementById("swal-order-status") as HTMLSelectElement).value;
        const paymentStatus = (document.getElementById("swal-payment-status") as HTMLSelectElement).value;
        return { orderStatus, paymentStatus };
      },
    });

    if (formValues) {
      try {
        const res = await UpdateOrderStatusApi(order._id, formValues);
        if (res.success) {
          toastMessage(res.message || "Order status updated successfully", "success");
          tableRef.current?.reload();
        } else {
          toastMessage(res.message || "Failed to update order status", "error");
        }
      } catch (error) {
        console.error("Update status error:", error);
        toastMessage("Something went wrong", "error");
      }
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        accessorKey: "orderId",
        header: "Order ID",
        meta: { filterType: "text" },
        cell: (info) => <span className="font-mono font-semibold text-slate-700">{info.getValue<string>()}</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        meta: { filterType: "date" },
        cell: (info) => {
          const val = info.getValue<string>();
          return val ? new Date(val).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) : "-";
        },
      },
      {
        accessorKey: "customer",
        header: "Customer",
        meta: { filterType: "text" },
        cell: ({ row }) => {
          const u = row.original?.user;
          return u ? (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{u.name}</span>
              <span className="text-xs text-gray-500">{u.email}</span>
              <span className="text-xs text-gray-400">{u.phone}</span>
            </div>
          ) : (
            <span className="text-gray-400">Guest</span>
          );
        },
      },
      {
        accessorKey: "shippingAddress.city",
        header: "City",
        meta: { filterType: "text" },
        cell: (info) => <span className="text-gray-700 font-medium">{info.getValue<string>() || "-"}</span>,
      },
      {
        accessorKey: "shippingAddress.phone",
        header: "Phone",
        meta: { filterType: "text" },
        cell: (info) => <span className="text-gray-700 font-medium">{info.getValue<string>() || "-"}</span>,
      },
      {
        id: "items",
        header: "Items Ordered",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const items = row.original?.items || [];
          return (
            <div className="flex flex-col gap-1 max-w-xs">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="text-xs text-gray-700 flex justify-between gap-4">
                  <span className="truncate">{item.product?.name || "Product"}</span>
                  <span className="font-semibold shrink-0">x{item.quantity}</span>
                </div>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "total",
        header: "Total (₹)",
        enableColumnFilter: false,
        cell: (info) => <span className="font-bold text-gray-900">₹{info.getValue<number>().toLocaleString("en-IN")}</span>,
      },
      {
        id: "payment",
        header: "Payment Method",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const method = row.original?.paymentMethod || "cod";
          const status = row.original?.paymentStatus || "pending";
          let statusColor = "bg-yellow-100 text-yellow-800";
          if (status === "paid") statusColor = "bg-green-100 text-green-800";
          if (status === "failed") statusColor = "bg-red-100 text-red-800";

          return (
            <div className="flex flex-col gap-1 items-start">
              <span className="text-xs uppercase font-semibold text-slate-600">{method}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${statusColor}`}>{status}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "orderStatus",
        header: "Status",
        meta: {
          filterType: "select",
          filterOptions: [
            { label: "Pending", value: "pending" },
            { label: "Processing", value: "processing" },
            { label: "Shipped", value: "shipped" },
            { label: "Delivered", value: "delivered" },
            { label: "Cancelled", value: "cancelled" },
          ],
        },
        cell: (info) => {
          const status = info.getValue<string>();
          let statusColor = "bg-amber-50 text-amber-700 border-amber-200";
          if (status === "processing") statusColor = "bg-blue-50 text-blue-700 border-blue-200";
          if (status === "shipped") statusColor = "bg-cyan-50 text-cyan-700 border-cyan-200";
          if (status === "delivered") statusColor = "bg-green-50 text-green-700 border-green-200";
          if (status === "cancelled") statusColor = "bg-red-50 text-red-700 border-red-200";

          return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor} capitalize`}>
              {status}
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
            {permission.edit && (
              <button
                type="button"
                onClick={() => handleEditStatus(row.original)}
                className="
                  inline-flex items-center justify-center
                  h-9 px-3 gap-1.5
                  rounded-lg
                  border border-gray-300
                  bg-white
                  text-gray-700
                  text-xs font-semibold
                  transition
                  hover:bg-gray-100
                  hover:text-gray-900
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#0f172a]
                "
                title="Update Status"
              >
                <Edit size={14} />
                <span>Update Status</span>
              </button>
            )}
          </div>
        ),
      },
    ];
    return baseColumns;
  }, [permission]);

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

    const res = await GetOrdersApi(body);
    return {
      data: res?.result?.list || [],
      total: res?.result?.count || 0,
    };
  };

  return (
    <div className="space-y-5">
      <Breadcrumbs path={"Orders"} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track customer orders and manage payment/delivery statuses
          </p>
        </div>

        <div className="flex items-center gap-3">
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
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      <ServerSIdeTable ref={tableRef} columns={columns} fetchApi={fetchData} />
    </div>
  );
}
