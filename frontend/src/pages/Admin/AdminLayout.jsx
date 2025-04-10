import React from 'react'
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white p-4">
        {/* Sidebar */}
        <ul>
          <li><a href="/admin/dashboard">Dashboard</a></li>
          <li><a href="/admin/users">Users</a></li>
        </ul>
      </aside>
      <main className="flex-1 p-6">
        {/* Nội dung route con sẽ được hiển thị ở đây */}
        <Outlet />
      </main>
    </div>
  )
}
