"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { GetOneUserApi } from "@/Api/user";
import { GetOrdersApi } from "@/Api/order";
import { ArrowLeft, MapPin, CheckCircle, XCircle } from "lucide-react";
import Spinner from "@/components/Spinner";
import { ColumnDef } from "@tanstack/react-table";
import ServerSIdeTable, { ServerSideTableRef } from "@/components/GlobalTable/ServerSIdeTable";

export default function ViewUser() {
  const { id } = useParams();
  const navigate = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const orderTableRef = useRef<ServerSideTableRef>(null);

  const orderColumns = useMemo<ColumnDef<any>[]>(() => {
    return [
      {
        accessorKey: "orderId",
        header: "Order ID",
        meta: { filterType: "text" },
        cell: (info) => <span className="font-mono font-medium text-gray-900">{info.getValue<string>()}</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        meta: { filterType: "date" },
        cell: (info) => {
          const val = info.getValue<string>();
          return val ? new Date(val).toLocaleDateString("en-IN") : "-";
        },
      },
      {
        accessorKey: "total",
        header: "Total",
        enableColumnFilter: false,
        cell: (info) => <span className="font-semibold text-gray-900">₹{info.getValue<number>().toLocaleString("en-IN")}</span>,
      },
      {
        id: "payment",
        header: "Payment",
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
      }
    ];
  }, []);

  const fetchOrders = async ({ pageIndex, pageSize, filter }: any) => {
    const finalFilter = { ...filter, fo_user: id };
    const body = {
      page: pageIndex + 1,
      limit: pageSize,
      filter: finalFilter,
    };
    const res = await GetOrdersApi(body);
    return {
      data: res?.result?.list || [],
      total: res?.result?.count || 0,
    };
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (id) {
          const response = await GetOneUserApi(id as string);
          setUser(response?.result);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold text-gray-700">User not found</h2>
        <button
          onClick={() => navigate.push("/users")}
          className="mt-4 text-blue-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li>
            <a href="/" className="hover:text-blue-600 transition-colors">
              Dashboard
            </a>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <a href="/users" className="hover:text-blue-600 transition-colors">
              Users
            </a>
          </li>
          <li className="text-gray-400">/</li>
          <li className="font-medium text-gray-800">View Detail</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate.back()}
            className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">User Details</h1>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      {/* Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">
            Profile Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Name:</span>
              <span className="text-gray-900">{user.name || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Email:</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Phone:</span>
              <span className="text-gray-900">{user.phone || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {(user.status || "active").toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Verified:</span>
              <span className="flex items-center gap-1 text-gray-900">
                {user.isVerified ? (
                  <><CheckCircle className="text-green-500" size={18} /> Yes</>
                ) : (
                  <><XCircle className="text-red-500" size={18} /> No</>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Joined On:</span>
              <span className="text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4 flex justify-between items-center">
            <span>Saved Addresses</span>
            <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {user.addresses?.length || 0}
            </span>
          </h2>
          {user.addresses && user.addresses.length > 0 ? (
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {user.addresses.map((address: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-gray-50 relative"
                >
                  {address.isDefault && (
                    <span className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">
                      Default
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-gray-500" />
                    {address.title}
                  </h3>
                  <p className="text-sm text-gray-600">{address.addressLine1}</p>
                  {address.addressLine2 && (
                    <p className="text-sm text-gray-600">{address.addressLine2}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.pincode}
                  </p>
                  <p className="text-sm text-gray-600 font-medium mt-1">
                    Phone: {address.phone}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No addresses saved yet.
            </div>
          )}
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">
          Order History
        </h2>
        <div className="w-full">
          <ServerSIdeTable
            ref={orderTableRef}
            columns={orderColumns}
            fetchApi={fetchOrders}
          />
        </div>
      </div>
    </div>
  );
}
