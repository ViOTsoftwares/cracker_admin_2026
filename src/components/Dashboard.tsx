"use client";

import React, { useEffect, useState } from "react";
import { DashboardCountApi } from "../Api/dashboard";

const Dashboard = () => {
  const [formData, setFormData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const GetData = async () => {
    try {
      setLoading(true);
      const response = await DashboardCountApi();
      setFormData(response.result);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    GetData();
  }, []);
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium">Users</h3>
          <p className="text-3xl font-bold mt-2">120</p>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium">Blogs</h3>
          <p className="text-3xl font-bold mt-2">{formData?.blog}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
