import React, { useMemo, useEffect } from "react";
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

// Custom Edit Icon (Pencil)
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

// Custom Delete Icon (Trash)
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

// Sort Icon
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
    {sortOrder === "ascending" ? (
      <path d="M12 5v14M5 12l7-7 7 7" />
    ) : (
      <path d="M12 5v14M5 12l7 7 7-7" />
    )}
  </svg>
);

export const TableComponent = ({
  items = [], // Data array (e.g., products from store for current page)
  columns, // Column definitions (name, uid, sortable, etc.)
  page, // Current page
  setPage, // Function to update page
  limit, // Items per page
  totalPages, // Total pages
  visibleColumns, // Set of visible column UIDs
  renderCell, // Custom render function for cells (optional)
  onEdit, // Callback for edit action
  onDelete, // Callback for delete action
  isLoading = false, // Loading state
  isSorting = false, // Enable/disable sorting
}) => {
  // State for sort configuration
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: null,
    direction: "ascending",
  });

  // Validate page
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      console.log("Invalid page, resetting to last page:", totalPages);
      setPage(totalPages);
    }
  }, [page, totalPages, setPage]);

  // Sort items client-side
  const sortedItems = useMemo(() => {
    if (!isSorting || !sortDescriptor.column) {
      console.log(
        "No sorting applied, returning original items:",
        items.length
      );
      return items;
    }
    console.log(
      "Sorting items:",
      sortDescriptor.column,
      sortDescriptor.direction
    );
    return [...items].sort((a, b) => {
      let first = a[sortDescriptor.column];
      let second = b[sortDescriptor.column];

      // Handle special cases
      if (sortDescriptor.column === "category") {
        first = a.category?.name || a.category || "";
        second = b.category?.name || b.category || "";
      } else if (sortDescriptor.column === "price") {
        first = parseFloat(first) || 0;
        second = parseFloat(second) || 0;
      } else if (sortDescriptor.column === "countInStock") {
        first = parseInt(first) || 0;
        second = parseInt(second) || 0;
      } else {
        first = first?.toString().toLowerCase() || "";
        second = second?.toString().toLowerCase() || "";
      }

      let cmp = 0;
      if (first < second) cmp = -1;
      else if (first > second) cmp = 1;

      if (sortDescriptor.direction === "descending") {
        cmp *= -1;
      }
      return cmp;
    });
  }, [items, sortDescriptor, isSorting]);

  // Handle sort change
  const handleSortChange = (newSortDescriptor) => {
    console.log("Sort change:", newSortDescriptor);
    setSortDescriptor({
      column: newSortDescriptor.column,
      direction:
        newSortDescriptor.column === sortDescriptor.column &&
        sortDescriptor.direction === "ascending"
          ? "descending"
          : "ascending",
    });
  };

  // Filter columns based on visibleColumns
  const headerColumns = columns.filter(
    (column) => column.uid === "actions" || visibleColumns.has(column.uid)
  );

  // Default renderCell function
  const defaultRenderCell = (item, columnKey, index) => {
    if (columnKey === "index") {
      return (page - 1) * limit + index + 1; // Row number
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
      case "image":
      case "images": {
        const imageUrl = Array.isArray(item[columnKey])
          ? item[columnKey][0]
          : item[columnKey];
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
      case "isVerified":
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
      case "category":
        return item.category?.name || item.category || "";
      case "price":
        return item.price?.toLocaleString("it-IT", {
          style: "currency",
          currency: "VND",
        });
      case "countInStock":
        return (
          <Chip
            className="text-center font-extralight"
            variant="light"
            color={item.countInStock < 10 ? "danger" : item.countInStock < 20 ? "warning" : "success"}
          >
            {item.countInStock}
          </Chip>
        );
      default:
        return item[columnKey] || "";
    }
  };

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
          sortDescriptor={isSorting ? sortDescriptor : undefined}
          onSortChange={isSorting ? handleSortChange : undefined}
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
                allowsSorting={
                  isSorting &&
                  column.uid !== "actions" &&
                  column.uid !== "index"
                }
              >
                {column.name}
                {/* <div style={{ display: "flex", alignItems: "center" }}>
                  {column.name}
                  {isSorting && column.uid !== "actions" && column.uid !== "index" && (
                    <SortIcon
                      sortOrder={
                        sortDescriptor.column === column.uid
                          ? sortDescriptor.direction
                          : "ascending"
                      }
                      isActive={sortDescriptor.column === column.uid}
                    />
                  )}
                </div> */}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={"Không tìm thấy dữ liệu"}>
            {sortedItems.map((item, index) => (
              <TableRow key={item._id || index}>
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
