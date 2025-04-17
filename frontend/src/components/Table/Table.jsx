import React, { useState, useMemo, useEffect } from "react";
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
import { color } from "framer-motion";

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
// const SortIcon = ({ sortOrder, isActive }) => (
//   <svg
//     width="16"
//     height="16"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     style={{  paddingLeft: "4px", opacity: isActive ? 1 : 0.5 }}
//   >
//     {sortOrder === "asc" ? (
//       <path d="M12 5v14M5 12l7-7 7 7" />
//     ) : (
//       <path d="M12 5v14M5 12l7 7 7-7" />
//     )}
//   </svg>
// );

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
  isSorting = false, // Trạng thái sắp xếp (mới)
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
    if (
      columnUid === "actions" ||
      columnUid === "index" ||
      columnUid === "image" ||
      columnUid === "images"
    )
      return;

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

  // Sử dụng useEffect để gọi onSort khi chuyển trang
  useEffect(() => {
    if (sortState.sortKey && onSort) {
      onSort(sortState.sortKey, sortState.sortOrder);
    }
  }, [page, sortState.sortKey, sortState.sortOrder, onSort]);

  // Sắp xếp dữ liệu phía client (nếu không dùng API)
  const sortedItems = useMemo(() => {
    if (!sortState.sortKey) return items;
    return [...items].sort((a, b) => {
      const aValue = a[sortState.sortKey];
      const bValue = b[sortState.sortKey];
      if (aValue < bValue) return sortState.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortState.sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [items, sortState.sortKey, sortState.sortOrder]);
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
      case "countInStock":
        return (
          <Chip
            className="text-center font-extralight md:w-full md:min-w-20"
            variant={
              item.countInStock < 10
                ? "solid"
                : item.countInStock < 20
                ? "flat"
                : "bordered"
            }
            color={
              item.countInStock < 10
                ? "danger"
                : item.countInStock < 20
                ? "warning"
                : "success"
            }
          >
            {item.countInStock}
          </Chip>
        );
      case "rating":
        return (
          <Chip
            className="text-center font-extralight md:w-full md:min-w-20"
            variant={
              item.rating < 3 ? "solid" : item.rating < 4 ? "flat" : "bordered"
            }
            color={
              item.rating < 3
                ? "danger"
                : item.rating < 4
                ? "warning"
                : "success"
            }
          >
            {item.rating}
          </Chip>
        );

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
          aria-label="Management Table"
          // color="secondary"
          bottomContent={
            totalPages > 0 && (
              <PaginationControls
                page={page}
                setPage={(newPage) => {
                  if (newPage !== page) {
                    console.log(`TableComponent: Changing page to ${newPage}`);
                    setPage(newPage);
                  }
                }} 
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
                align="center"
                onClick={isSorting ? () => handleSort(column.uid) : undefined}
                style={{
                  cursor: column.sortable ? "pointer" : "default",
                }}
                allowsSorting={column.sortable && isSorting}
              >
                {column.name}
                {/* {column.uid !== "actions" &&
                    column.uid !== "index" &&
                    isSorting && (
                      <SortIcon
                      
                        sortOrder={
                          sortState.sortKey === column.uid
                            ? sortState.sortOrder
                            : "asc"
                        }
                        isActive={sortState.sortKey === column.uid}
                      />
                    )} */}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={"Không tìm thấy dữ liệu"}>
            {sortedItems.map((item, index) => (
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

// // Quá khứ huy hoàng - Đoạn mã này đã từng được sử dụng CRS, nhưng giờ đây nó đã trở thành một phần của lịch sử. Dưới đây là phiên bản cũ của mã nguồn mà bạn có thể tham khảo:
// // import React, { useMemo, useEffect } from "react";
// // import {
// //   Table,
// //   TableHeader,
// //   TableColumn,
// //   TableBody,
// //   TableRow,
// //   TableCell,
// //   Spinner,
// //   Button,
// //   Chip,
// // } from "@heroui/react";
// // import { PaginationControls } from "../../components/Pagination/PaginationControls";
// // import { UserRoundX, UserRoundCheck } from "lucide-react";

// // // Custom Edit Icon (Pencil)
// // const EditIcon = ({ size = 20 }) => (
// //   <svg
// //     xmlns="http://www.w3.org/2000/svg"
// //     width={size}
// //     height={size}
// //     viewBox="0 0 24 24"
// //     fill="none"
// //     stroke="currentColor"
// //     strokeWidth="2"
// //     strokeLinecap="round"
// //     strokeLinejoin="round"
// //     className="lucide lucide-pencil-icon lucide-pencil"
// //   >
// //     <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
// //     <path d="m15 5 4 4" />
// //   </svg>
// // );

// // // Custom Delete Icon (Trash)
// // const DeleteIcon = ({ size = 20 }) => (
// //   <svg
// //     width={size}
// //     height={size}
// //     viewBox="0 0 24 24"
// //     fill="none"
// //     stroke="currentColor"
// //     strokeWidth="2"
// //     strokeLinecap="round"
// //     strokeLinejoin="round"
// //   >
// //     <polyline points="3 6 5 6 21 6" />
// //     <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
// //   </svg>
// // );

// // // Sort Icon
// // const SortIcon = ({ sortOrder, isActive }) => (
// //   <svg
// //     width="16"
// //     height="16"
// //     viewBox="0 0 24 24"
// //     fill="none"
// //     stroke="currentColor"
// //     strokeWidth="2"
// //     strokeLinecap="round"
// //     strokeLinejoin="round"
// //     style={{ marginLeft: "4px", opacity: isActive ? 1 : 0.5 }}
// //   >
// //     {sortOrder === "ascending" ? (
// //       <path d="M12 5v14M5 12l7-7 7 7" />
// //     ) : (
// //       <path d="M12 5v14M5 12l7 7 7-7" />
// //     )}
// //   </svg>
// // );

// // export const TableComponent = ({
// //   items = [], // Data array (e.g., products from store for current page)
// //   columns, // Column definitions (name, uid, sortable, etc.)
// //   page, // Current page
// //   setPage, // Function to update page
// //   limit, // Items per page
// //   totalPages, // Total pages
// //   visibleColumns, // Set of visible column UIDs
// //   renderCell, // Custom render function for cells (optional)
// //   onEdit, // Callback for edit action
// //   onDelete, // Callback for delete action
// //   isLoading = false, // Loading state
// //   isSorting = false, // Enable/disable sorting
// // }) => {
// //   // State for sort configuration
// //   const [sortDescriptor, setSortDescriptor] = React.useState({
// //     column: null,
// //     direction: "ascending",
// //   });

// //   // Validate page
// //   useEffect(() => {
// //     if (totalPages > 0 && page > totalPages) {
// //       console.log("Invalid page, resetting to last page:", totalPages);
// //       setPage(totalPages);
// //     }
// //   }, [page, totalPages, setPage]);

// //   // Sort items client-side
// //   const sortedItems = useMemo(() => {
// //     if (!isSorting || !sortDescriptor.column) {
// //       console.log(
// //         "No sorting applied, returning original items:",
// //         items.length
// //       );
// //       return items;
// //     }
// //     console.log(
// //       "Sorting items:",
// //       sortDescriptor.column,
// //       sortDescriptor.direction
// //     );
// //     return [...items].sort((a, b) => {
// //       let first = a[sortDescriptor.column];
// //       let second = b[sortDescriptor.column];

// //       // Handle special cases
// //       if (sortDescriptor.column === "category") {
// //         first = a.category?.name || a.category || "";
// //         second = b.category?.name || b.category || "";
// //       } else if (
// //         sortDescriptor.column === "price" ||
// //         sortDescriptor.column === "countInStock"
// //       ) {
// //         first = parseFloat(first) || 0;
// //         second = parseFloat(second) || 0;
// //       }
// //       // else if (sortDescriptor.column === "countInStock") {
// //       //   first = parseInt(first) || 0;
// //       //   second = parseInt(second) || 0;
// //       // }
// //       else {
// //         first = first?.toString().toLowerCase() || "";
// //         second = second?.toString().toLowerCase() || "";
// //       }

// //       let cmp = 0;
// //       if (first < second) cmp = -1;
// //       else if (first > second) cmp = 1;

// //       if (sortDescriptor.direction === "descending") {
// //         cmp *= -1;
// //       }
// //       return cmp;
// //     });
// //   }, [items, sortDescriptor, isSorting]);

// //   // Handle sort change
// //   const handleSortChange = (newSortDescriptor) => {
// //     console.log("Sort change:", newSortDescriptor);
// //     setSortDescriptor({
// //       column: newSortDescriptor.column,
// //       direction:
// //         newSortDescriptor.column === sortDescriptor.column &&
// //         sortDescriptor.direction === "ascending"
// //           ? "descending"
// //           : "ascending",
// //     });
// //   };

// //   // Filter columns based on visibleColumns
// //   const headerColumns = columns.filter(
// //     (column) => column.uid === "actions" || visibleColumns.has(column.uid)
// //   );

// //   // Default renderCell function
// //   const defaultRenderCell = (item, columnKey, index) => {
// //     if (columnKey === "index") {
// //       return (page - 1) * limit + index + 1; // Row number
// //     }
// //     switch (columnKey) {
// //       case "actions":
// //         return (
// //           <div className="flex gap-2">
// //             <Button
// //               isIconOnly
// //               size="sm"
// //               variant="light"
// //               color="primary"
// //               onPress={() => onEdit && onEdit(item)}
// //               aria-label="Edit"
// //             >
// //               <EditIcon />
// //             </Button>
// //             <Button
// //               isIconOnly
// //               size="sm"
// //               variant="light"
// //               color="danger"
// //               onPress={() => onDelete && onDelete(item)}
// //               aria-label="Delete"
// //             >
// //               <DeleteIcon />
// //             </Button>
// //           </div>
// //         );
// //       case "image":
// //       case "images": {
// //         const imageUrl = Array.isArray(item[columnKey])
// //           ? item[columnKey][0]
// //           : item[columnKey];
// //         const baseUrl =
// //           import.meta.env.NODE_ENV === "production"
// //             ? ""
// //             : "http://localhost:3000";
// //         const fullImageUrl = `${baseUrl}${imageUrl}`;
// //         return (
// //           <img
// //             src={fullImageUrl}
// //             alt="image"
// //             loading="lazy"
// //             style={{ width: "50px", height: "50px", objectFit: "cover" }}
// //           />
// //         );
// //       }
// //       case "role":
// //         return (
// //           <Chip
// //             className="lg:min-w-20 text-center leading-3"
// //             color={item.role === "admin" ? "secondary" : "default"}
// //           >
// //             {item.role}
// //           </Chip>
// //         );
// //       case "isVerified":
// //         return (
// //           <Chip
// //             className="text-center font-extralight"
// //             color={item.isVerified ? "success" : "warning"}
// //           >
// //             {item.isVerified ? (
// //               <UserRoundCheck strokeWidth={1.25} color="#ffffff" />
// //             ) : (
// //               <UserRoundX strokeWidth={1.25} color="#ffffff" />
// //             )}
// //           </Chip>
// //         );
// //       case "category":
// //         return item.category?.name || item.category || "";
// //       case "price":
// //         return item.price?.toLocaleString("it-IT", {
// //           style: "currency",
// //           currency: "VND",
// //         });
// //       case "countInStock":
// //         return (
// //           <Chip
// //             className="text-center font-extralight md:w-full md:min-w-20"
// //             variant={
// //               item.countInStock < 10
// //                 ? "solid"
// //                 : item.countInStock < 20
// //                 ? "flat"
// //                 : "bordered"
// //             }
// //             color={
// //               item.countInStock < 10
// //                 ? "danger"
// //                 : item.countInStock < 20
// //                 ? "warning"
// //                 : "success"
// //             }
// //           >
// //             {item.countInStock}
// //           </Chip>
// //         );
// //       default:
// //         return item[columnKey] || "";
// //     }
// //   };

// //   const cellRenderer = renderCell || defaultRenderCell;

// //   return (
// //     <>
// //       {isLoading ? (
// //         <div className="flex justify-center py-8">
// //           <Spinner variant="gradient" color="secondary" size="lg" />
// //         </div>
// //       ) : (
// //         <Table
// //           isHeaderSticky
// //           aria-label="Generic Table"
// //           color="secondary"
// //           sortDescriptor={isSorting ? sortDescriptor : undefined}
// //           onSortChange={isSorting ? handleSortChange : undefined}
// //           bottomContent={
// //             totalPages > 0 && (
// //               <PaginationControls
// //                 page={page}
// //                 setPage={setPage}
// //                 totalPages={totalPages}
// //               />
// //             )
// //           }
// //           bottomContentPlacement="outside"
// //         >
// //           <TableHeader columns={headerColumns}>
// //             {(column) => (
// //               <TableColumn
// //                 key={column.uid}
// //                 align="start"
// //                 allowsSorting={
// //                   isSorting &&
// //                   column.uid !== "actions" &&
// //                   column.uid !== "index"
// //                 }
// //               >
// //                 {column.name}
// //                 {/* <div style={{ display: "flex", alignItems: "center" }}>
// //                   {column.name}
// //                   {isSorting && column.uid !== "actions" && column.uid !== "index" && (
// //                     <SortIcon
// //                       sortOrder={
// //                         sortDescriptor.column === column.uid
// //                           ? sortDescriptor.direction
// //                           : "ascending"
// //                       }
// //                       isActive={sortDescriptor.column === column.uid}
// //                     />
// //                   )}
// //                 </div> */}
// //               </TableColumn>
// //             )}
// //           </TableHeader>
// //           <TableBody emptyContent={"Không tìm thấy dữ liệu"}>
// //             {sortedItems.map((item, index) => (
// //               <TableRow key={item._id || index}>
// //                 {headerColumns.map((column) => (
// //                   <TableCell key={column.uid}>
// //                     {cellRenderer(item, column.uid, index)}
// //                   </TableCell>
// //                 ))}
// //               </TableRow>
// //             ))}
// //           </TableBody>
// //         </Table>
// //       )}
// //     </>
// //   );
// // };

// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   TableHeader,
//   TableColumn,
//   TableBody,
//   TableRow,
//   TableCell,
//   Spinner,
//   Button,
//   Chip,
// } from "@heroui/react";
// import { PaginationControls } from "../../components/Pagination/PaginationControls";
// import { UserRoundX, UserRoundCheck, Eye } from "lucide-react";

// // Edit Icon (Pencil)
// const EditIcon = ({ size = 20 }) => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width={size}
//     height={size}
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     className="lucide lucide-pencil-icon lucide-pencil"
//   >
//     <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
//     <path d="m15 5 4 4" />
//   </svg>
// );

// // Delete Icon (Trash)
// const DeleteIcon = ({ size = 20 }) => (
//   <svg
//     width={size}
//     height={size}
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <polyline points="3 6 5 6 21 6" />
//     <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
//   </svg>
// );

// // Sort Icon
// const SortIcon = ({ sortOrder, isActive }) => (
//   <svg
//     width="16"
//     height="16"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     style={{ marginLeft: "4px", opacity: isActive ? 1 : 0.5 }}
//   >
//     {sortOrder === "asc" ? (
//       <path d="M12 5v14M5 12l7-7 7 7" />
//     ) : (
//       <path d="M12 5v14M5 12l7 7 7-7" />
//     )}
//   </svg>
// );

// export const TableComponent = ({
//   items = [], // Data array
//   columns, // Column definitions
//   page, // Current page
//   setPage, // Function to update page
//   limit, // Items per page
//   totalPages, // Total pages
//   visibleColumns, // Set of visible column UIDs
//   renderCell, // Custom render function for cells (optional)
//   onView, // Callback for view action
//   onEdit, // Callback for edit action
//   onDelete, // Callback for delete action
//   isLoading = false, // Loading state
//   isSorting = false, // Enable/disable sorting
//   isFiltering = false, // Enable/disable filtering
//   onSort, // Callback for sorting
// }) => {
//   // State for sort configuration
//   const [sortState, setSortState] = useState({
//     sortKey: null,
//     sortOrder: "asc",
//   });

//   // Filter columns based on visibleColumns
//   const headerColumns = columns.filter(
//     (column) => column.uid === "actions" || visibleColumns.has(column.uid)
//   );

//   // Handle sort click
//   const handleSort = (columnUid) => {
//     // Don't sort actions or index columns
//     if (columnUid === "actions" || columnUid === "index") return;

//     // Only sort columns marked as sortable
//     const column = columns.find(col => col.uid === columnUid);
//     if (!column?.sortable) return;

//     const newSortOrder =
//       sortState.sortKey === columnUid && sortState.sortOrder === "asc"
//         ? "desc"
//         : "asc";

//     setSortState({
//       sortKey: columnUid,
//       sortOrder: newSortOrder,
//     });

//     // Call onSort callback if provided
//     if (onSort) {
//       onSort(columnUid, newSortOrder);
//     }
//   };

//   // Default cell renderer
//   const defaultRenderCell = (item, columnKey, index) => {
//     if (columnKey === "index") {
//       return (page - 1) * limit + index + 1; // Row number
//     }

//     switch (columnKey) {
//       case "actions":
//         return (
//           <div className="flex gap-2">
//             {onView && (
//               <Button
//                 isIconOnly
//                 size="sm"
//                 variant="light"
//                 color="secondary"
//                 onPress={() => onView(item)}
//                 aria-label="View"
//               >
//                 <Eye size={18} />
//               </Button>
//             )}
//             {onEdit && (
//               <Button
//                 isIconOnly
//                 size="sm"
//                 variant="light"
//                 color="primary"
//                 onPress={() => onEdit(item)}
//                 aria-label="Edit"
//               >
//                 <EditIcon />
//               </Button>
//             )}
//             {onDelete && (
//               <Button
//                 isIconOnly
//                 size="sm"
//                 variant="light"
//                 color="danger"
//                 onPress={() => onDelete(item)}
//                 aria-label="Delete"
//               >
//                 <DeleteIcon />
//               </Button>
//             )}
//           </div>
//         );

//       case "image":
//       case "images": {
//         const imageUrl = Array.isArray(item[columnKey])
//           ? item[columnKey][0]
//           : item[columnKey];

//         if (!imageUrl) return null;

//         const baseUrl =
//           import.meta.env.NODE_ENV === "production"
//             ? ""
//             : "http://localhost:3000";
//         const fullImageUrl = imageUrl.startsWith('http')
//           ? imageUrl
//           : `${baseUrl}${imageUrl}`;

//         return (
//           <img
//             src={fullImageUrl}
//             alt="image"
//             loading="lazy"
//             style={{ width: "50px", height: "50px", objectFit: "cover" }}
//           />
//         );
//       }

//       case "role":
//         return (
//           <Chip
//             className="lg:min-w-20 text-center leading-3"
//             color={item.role === "admin" ? "secondary" : "default"}
//           >
//             {item.role}
//           </Chip>
//         );

//       case "isVerified":
//         return (
//           <Chip
//             className="text-center font-extralight"
//             color={item.isVerified ? "success" : "warning"}
//           >
//             {item.isVerified ? (
//               <UserRoundCheck strokeWidth={1.25} color="#ffffff" />
//             ) : (
//               <UserRoundX strokeWidth={1.25} color="#ffffff" />
//             )}
//           </Chip>
//         );

//       case "countInStock":
//         return (
//           <Chip
//             className="text-center font-extralight md:w-full md:min-w-20"
//             variant={
//               item.countInStock < 10
//                 ? "solid"
//                 : item.countInStock < 20
//                 ? "flat"
//                 : "bordered"
//             }
//             color={
//               item.countInStock < 10
//                 ? "danger"
//                 : item.countInStock < 20
//                 ? "warning"
//                 : "success"
//             }
//           >
//             {item.countInStock}
//           </Chip>
//         );

//       case "rating":
//         return (
//           <Chip
//             className="text-center font-extralight md:w-full md:min-w-20"
//             variant={
//               item.rating < 3
//                 ? "solid"
//                 : item.rating < 4
//                 ? "flat"
//                 : "bordered"
//             }
//             color={
//               item.rating < 3
//                 ? "danger"
//                 : item.rating < 4
//                 ? "warning"
//                 : "success"
//             }
//           >
//             {item.rating}
//           </Chip>
//         );

//       default:
//         return item[columnKey] !== undefined ? item[columnKey] : "";
//     }
//   };

//   // Use custom renderer if provided, otherwise use default
//   const cellRenderer = renderCell || defaultRenderCell;

//   return (
//     <>
//       {isLoading ? (
//         <div className="flex justify-center py-8">
//           <Spinner variant="gradient" color="secondary" size="lg" />
//         </div>
//       ) : (
//         <Table
//           isHeaderSticky
//           aria-label="Generic Table"
//           color="secondary"
//           bottomContent={
//             totalPages > 0 && (
//               <PaginationControls
//                 page={page}
//                 setPage={setPage}
//                 totalPages={totalPages}
//               />
//             )
//           }
//           bottomContentPlacement="outside"
//         >
//           <TableHeader columns={headerColumns}>
//             {(column) => (
//               <TableColumn
//                 key={column.uid}
//                 onClick={isSorting ? () => handleSort(column.uid) : undefined}
//                 style={{
//                   cursor: column.sortable ? "pointer" : "default",
//                 }}
//                 allowsSorting={column.sortable}
//               >
//                 <div className="flex items-center">
//                   {column.name}
//                   {column.sortable && isSorting && (
//                     <SortIcon
//                       sortOrder={
//                         sortState.sortKey === column.uid
//                           ? sortState.sortOrder
//                           : "asc"
//                       }
//                       isActive={sortState.sortKey === column.uid}
//                     />
//                   )}
//                 </div>
//               </TableColumn>
//             )}
//           </TableHeader>
//           <TableBody emptyContent={"Không tìm thấy dữ liệu"}>
//             {items.map((item, index) => (
//               <TableRow key={item.id || item._id || index}>
//                 {headerColumns.map((column) => (
//                   <TableCell key={column.uid}>
//                     {cellRenderer(item, column.uid, index)}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       )}
//     </>
//   );
// };

// import React, { useState } from "react";
// import {
//   Table,
//   TableHeader,
//   TableColumn,
//   TableBody,
//   TableRow,
//   TableCell,
//   Spinner,
//   Button,
//   Chip,
// } from "@heroui/react";
// import { PaginationControls } from "../../components/Pagination/PaginationControls";
// import {
//   Eye,
//   Pencil,
//   Trash2,
//   ArrowUpWideNarrow,
//   ArrowDownWideNarrow,
//   UserCheck,
//   UserX,
// } from "lucide-react";
// import clsx from "clsx";

// const SortIcon = ({ sortOrder, isActive }) => {
//   if (!isActive) return <ArrowDownWideNarrow className="ml-1 w-4 h-4 opacity-50" />;
//   return sortOrder === "asc" ? (
//     <ArrowUpWideNarrow className="ml-1 w-4 h-4 text-secondary" />
//   ) : (
//     <ArrowDownWideNarrow className="ml-1 w-4 h-4 text-secondary" />
//   );
// };

// const ActionButtons = ({ item, onView, onEdit, onDelete }) => (
//   <div className="flex gap-2">
//     {onView && (
//       <Button isIconOnly size="sm" variant="light" color="secondary" onPress={() => onView(item)}>
//         <Eye size={18} />
//       </Button>
//     )}
//     {onEdit && (
//       <Button isIconOnly size="sm" variant="light" color="primary" onPress={() => onEdit(item)}>
//         <Pencil size={18} />
//       </Button>
//     )}
//     {onDelete && (
//       <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onDelete(item)}>
//         <Trash2 size={18} />
//       </Button>
//     )}
//   </div>
// );

// export const TableComponent = ({
//   items = [],
//   columns = [],
//   page = 1,
//   setPage,
//   limit = 10,
//   totalPages = 1,
//   visibleColumns,
//   renderCell,
//   onView,
//   onEdit,
//   onDelete,
//   isLoading = false,
//   isSorting = false,
//   onSort,
// }) => {
//   const [sortState, setSortState] = useState({ sortKey: null, sortOrder: "asc" });

//   const headerColumns = columns.filter((col) => col.uid === "actions" || visibleColumns.has(col.uid));

//   const handleSort = (columnUid) => {
//     if (columnUid === "actions" || columnUid === "index") return;

//     const column = columns.find((c) => c.uid === columnUid);
//     if (!column?.sortable) return;

//     const newOrder = sortState.sortKey === columnUid && sortState.sortOrder === "asc" ? "desc" : "asc";
//     const newState = { sortKey: columnUid, sortOrder: newOrder };
//     setSortState(newState);
//     onSort?.(columnUid, newOrder);
//   };

//   const defaultRenderCell = (item, columnKey, index) => {
//     if (columnKey === "index") return (page - 1) * limit + index + 1;

//     if (columnKey === "actions") {
//       return <ActionButtons item={item} onView={onView} onEdit={onEdit} onDelete={onDelete} />;
//     }

//     if (["image", "images"].includes(columnKey)) {
//       const url = Array.isArray(item[columnKey]) ? item[columnKey][0] : item[columnKey];
//       const baseUrl = import.meta.env.NODE_ENV === "production" ? "" : "http://localhost:3000";
//       const fullUrl = url?.startsWith("http") ? url : `${baseUrl}${url}`;
//       return url ? <img src={fullUrl} alt="" className="w-[50px] h-[50px] object-cover" /> : null;
//     }

//     if (columnKey === "role") {
//       return <Chip color={item.role === "admin" ? "secondary" : "default"}>{item.role}</Chip>;
//     }

//     if (columnKey === "isVerified") {
//       return (
//         <Chip color={item.isVerified ? "success" : "warning"}>
//           {item.isVerified ? <UserCheck size={16} /> : <UserX size={16} />}
//         </Chip>
//       );
//     }

//     if (columnKey === "countInStock" || columnKey === "rating") {
//       const value = item[columnKey];
//       const color =
//         value < 3 || value < 10 ? "danger" : value < 4 || value < 20 ? "warning" : "success";
//       const variant = value < 3 || value < 10 ? "solid" : value < 4 || value < 20 ? "flat" : "bordered";
//       return (
//         <Chip color={color} variant={variant} className="text-center min-w-16">
//           {value}
//         </Chip>
//       );
//     }

//     return item[columnKey] ?? "";
//   };

//   const cellRenderer = renderCell || defaultRenderCell;

//   return isLoading ? (
//     <div className="flex justify-center py-8">
//       <Spinner variant="gradient" color="secondary" size="lg" />
//     </div>
//   ) : (
//     <Table
//       isHeaderSticky
//       aria-label="Data Table"
//       color="secondary"
//       bottomContent={
//         totalPages > 0 && <PaginationControls page={page} setPage={setPage} totalPages={totalPages} />
//       }
//       bottomContentPlacement="outside"
//     >
//       <TableHeader columns={headerColumns}>
//         {(column) => (
//           <TableColumn
//             key={column.uid}
//             onClick={isSorting ? () => handleSort(column.uid) : undefined}
//             allowsSorting={column.sortable}
//             style={{ cursor: column.sortable ? "pointer" : "default" }}
//           >
//             <div className="flex items-center">
//               {column.name}
//               {column.sortable && isSorting && (
//                 <SortIcon
//                   sortOrder={sortState.sortKey === column.uid ? sortState.sortOrder : "asc"}
//                   isActive={sortState.sortKey === column.uid}
//                 />
//               )}
//             </div>
//           </TableColumn>
//         )}
//       </TableHeader>
//       <TableBody emptyContent="Không tìm thấy dữ liệu">
//         {items.map((item, index) => (
//           <TableRow key={item.id || item._id || index}>
//             {headerColumns.map((column) => (
//               <TableCell key={column.uid}>
//                 {cellRenderer(item, column.uid, index)}
//               </TableCell>
//             ))}
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   );
// };
