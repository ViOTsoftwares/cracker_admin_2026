"use client";

import React, { useEffect, useState } from "react";
import { DashboardCountApi } from "../Api/dashboard";
import { GetOrdersApi } from "../Api/order";
import Link from "next/link";

const Dashboard = () => {
  const [formData, setFormData] = useState<any>();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const GetData = async () => {
    try {
      setLoading(true);
      const response = await DashboardCountApi();
      setFormData(response.result);

      // Fetch recent 5 orders
      const orderRes = await GetOrdersApi({ page: 1, limit: 5 });
      if (orderRes?.success) {
        setRecentOrders(orderRes.result?.list || []);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-100 rounded-lg p-6 text-center shadow-sm">
          <h3 className="text-lg font-medium text-gray-600">Users</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{formData?.user || 0}</p>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 text-center shadow-sm">
          <h3 className="text-lg font-medium text-gray-600">Products</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{formData?.product || 0}</p>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 text-center shadow-sm">
          <h3 className="text-lg font-medium text-gray-600">Orders</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{formData?.order || 0}</p>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
          <Link href="/orders" className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">
            View More &rarr;
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-sm text-gray-700">Order ID</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Customer</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Date</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Status</th>
                <th className="p-4 font-semibold text-sm text-gray-700 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-gray-500">Loading orders...</td>
                </tr>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order, idx) => {
                  let statusColor = "bg-amber-50 text-amber-700 border-amber-200";
                  if (order.orderStatus === "processing") statusColor = "bg-blue-50 text-blue-700 border-blue-200";
                  if (order.orderStatus === "shipped") statusColor = "bg-cyan-50 text-cyan-700 border-cyan-200";
                  if (order.orderStatus === "delivered") statusColor = "bg-green-50 text-green-700 border-green-200";
                  if (order.orderStatus === "cancelled") statusColor = "bg-red-50 text-red-700 border-red-200";
                  
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0">
                      <td className="p-4 text-sm font-medium text-gray-900">{order.orderId}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {order.user?.name || "Guest"}
                        <div className="text-xs text-gray-400">{order.user?.email}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor} capitalize`}>
                          {order.orderStatus || "pending"}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900 text-right">
                        ₹{(order.total || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-gray-500">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
