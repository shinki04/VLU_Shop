import React from 'react'
import { Outlet } from "react-router-dom";
import {
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem
} from "@heroui/navbar";
export default function AdminLayout() {
  return (


    
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white p-4">
        {/* Sidebar */}
        <ul>
          <li><a href="/admin/dashboard">Dashboard</a></li>
          <li><a href="/admin/category">Category</a> </li>
          <li><a href="/admin/users">Users</a></li>
          <li><a href='/admin/products'>Product</a></li>
          <li><a href='/admin/reviews'>Reviews</a></li>
        </ul>
      </aside>
      <main className="flex-1 p-6">
        {/* Nội dung route con sẽ được hiển thị ở đây */}
        <Outlet />
      </main>
    </div>
  )
}
