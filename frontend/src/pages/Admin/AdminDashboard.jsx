import { Card } from "@heroui/react";
import React from "react";

export default function AdminDashboard() {
  return (
    <div>
      <Card
        className="w-full h-full"
        header={
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          </div>
        }
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold">
            Welcome to the Admin Dashboard
          </h3>
          <p className="text-sm text-gray-500">
            Here you can manage users, orders, and products.
          </p>
        </div>
      </Card>
    </div>
  );
}
