import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Button,
  Chip,
} from "@heroui/react";
import { PaginationControls } from "../../components/Pagination/PaginationControls";
import { UserRoundX, UserRoundCheck } from "lucide-react";

// Icon tùy chỉnh cho "Sửa" (bút chì)
const EditIcon = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-pencil-icon lucide-pencil"
  >
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    <path d="m15 5 4 4" />
  </svg>
);

// Icon tùy chỉnh cho "Xóa" (thùng rác)
const DeleteIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// Icon cho trạng thái sắp xếp
const SortIcon = ({ sortOrder, isActive }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginLeft: "4px", opacity: isActive ? 1 : 0.5 }}
  >
    {sortOrder === "asc" ? (
      <path d="M12 5v14M5 12l7-7 7 7" />
    ) : (
      <path d="M12 5v14M5 12l7 7 7-7" />
    )}
  </svg>
);

export const TableComponent = ({
  items, // Dữ liệu để hiển thị (mảng bất kỳ)
  columns, // Danh sách cột (name, uid, và các thuộc tính khác nếu cần)
  page, // Trang hiện tại
  setPage, // Hàm cập nhật trang
  limit, // Số mục mỗi trang
  totalPages, // Tổng số trang
  visibleColumns, // Tập hợp các cột hiển thị (Set)
  renderCell, // Hàm tùy chỉnh để render ô (tùy chọn)
  onEdit, // Callback khi nhấn "Sửa"
  onDelete, // Callback khi nhấn "Xóa"
  isLoading, // Trạng thái loading
  onSort, // Callback khi sắp xếp (mới)
}) => {
  // State để quản lý cột sắp xếp và hướng sắp xếp
  const [sortState, setSortState] = useState({
    sortKey: null,
    sortOrder: "asc",
  });

  // Lọc cột hiển thị dựa trên visibleColumns
  const headerColumns = columns.filter(
    (column) => column.uid === "actions" || visibleColumns.has(column.uid)
  );

  // Hàm xử lý click vào header để sắp xếp
  const handleSort = (columnUid) => {
    // Không cho phép sắp xếp cột actions hoặc index
    if (columnUid === "actions" || columnUid === "index") return;

    const newSortOrder =
      sortState.sortKey === columnUid && sortState.sortOrder === "asc"
        ? "desc"
        : "asc";

    setSortState({
      sortKey: columnUid,
      sortOrder: newSortOrder,
    });

    // Gọi hàm onSort từ props (nếu có)
    if (onSort) {
      onSort(columnUid, newSortOrder);
    }
  };

  // const handleSort = (columnUid) => {
  //   if (columnUid === "actions" || columnUid === "index") return;
  
  //   const newSortOrder =
  //     sortState.sortKey === columnUid && sortState.sortOrder === "asc"
  //       ? "desc"
  //       : "asc";
  
  //   setSortState({
  //     sortKey: columnUid,
  //     sortOrder: newSortOrder,
  //   });
  
  //   const newSortedItems = [...sortedItems].sort((a, b) => {
  //     let aValue = a[columnUid];
  //     let bValue = b[columnUid];
  
  //     // Xử lý trường hợp đặc biệt
  //     if (columnUid === "role") {
  //       aValue = aValue || "";
  //       bValue = bValue || "";
  //     }
  
  //     if (aValue < bValue) return newSortOrder === "asc" ? -1 : 1;
  //     if (aValue > bValue) return newSortOrder === "asc" ? 1 : -1;
  //     return 0;
  //   });
  //   setSortedItems(newSortedItems);
  // };
  
  // Hàm render mặc định nếu không truyền renderCell
  const defaultRenderCell = (item, columnKey, index) => {
    if (columnKey === "index") {
      return (page - 1) * limit + index + 1; // STT
    }
    switch (columnKey) {
      case "actions":
        return (
          <div className="flex gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="primary"
              onPress={() => onEdit && onEdit(item)}
              aria-label="Edit"
            >
              <EditIcon />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() => onDelete && onDelete(item)}
              aria-label="Delete"
            >
              <DeleteIcon />
            </Button>
          </div>
        );

      case "image": {
        const imageUrl = Array.isArray(item.image) ? item.image[0] : item.image;
        const baseUrl =
          import.meta.env.NODE_ENV === "production"
            ? ""
            : "http://localhost:3000";
        const fullImageUrl = `${baseUrl}${imageUrl}`;

        return (
          <img
            src={fullImageUrl}
            alt="image"
            loading="lazy"
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
        );
      }
      case "images": {
        const imageUrl = Array.isArray(item.images)
          ? item.images[0]
          : item.images;
        const baseUrl =
          import.meta.env.NODE_ENV === "production"
            ? ""
            : "http://localhost:3000";
        const fullImageUrl = `${baseUrl}${imageUrl}`;

        return (
          <img
            src={fullImageUrl}
            alt="image"
            loading="lazy"
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
        );
      }
      case "role":
        return (
          <Chip
            className="lg:min-w-20 text-center leading-3"
            color={item.role === "admin" ? "secondary" : "default"}
          >
            {item.role}
          </Chip>
        );
      case "isVerified": {
        return (
          <Chip
            className="text-center font-extralight"
            color={item.isVerified ? "success" : "warning"}
          >
            {item.isVerified ? (
              <UserRoundCheck strokeWidth={1.25} color="#ffffff" />
            ) : (
              <UserRoundX strokeWidth={1.25} color="#ffffff" />
            )}
          </Chip>
        );
      }
      default:
        return item[columnKey] || ""; // Giá trị mặc định
    }
  };

  // Sử dụng renderCell từ props nếu có, nếu không dùng mặc định
  const cellRenderer = renderCell || defaultRenderCell;

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner variant="gradient" color="secondary" size="lg" />
        </div>
      ) : (
        <Table
          isHeaderSticky
          aria-label="Generic Table"
          color="secondary"
          bottomContent={
            totalPages > 0 && (
              <PaginationControls
                page={page}
                setPage={setPage}
                totalPages={totalPages}
              />
            )
          }
          bottomContentPlacement="outside"
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align="start"
                onClick={() => handleSort(column.uid)}
                style={{ cursor: column.uid !== "actions" ? "pointer" : "default" }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {column.name}
                  {column.uid !== "actions" && (
                    <SortIcon
                      sortOrder={
                        sortState.sortKey === column.uid
                          ? sortState.sortOrder
                          : "asc"
                      }
                      isActive={sortState.sortKey === column.uid}
                    />
                  )}
                </div>
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={"Không tìm thấy dữ liệu"}>
            {items.map((item, index) => (
              <TableRow key={item.id || index}>
                {headerColumns.map((column) => (
                  <TableCell key={column.uid}>
                    {cellRenderer(item, column.uid, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
};