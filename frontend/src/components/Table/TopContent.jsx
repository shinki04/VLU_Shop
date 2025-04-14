import React from "react";
import {
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { PageSizeSelector } from "../../components/Pagination/PageSizeSelector";
import { TextSearch, Plus, ChevronDown } from "lucide-react";

export const TopContent = ({
  filterValue,
  setFilterValue,
  visibleColumns,
  setVisibleColumns,
  limit,
  setLimit,
  setPage,
  onAddNew,
  columns, // Thêm props columns
}) => {
  // Xử lý thay đổi tìm kiếm
  const onSearchChange = (value) => {
    setFilterValue(value);
    setPage(1); // Reset về trang 1 khi tìm kiếm
  };

  // Xóa tìm kiếm
  const onClear = () => {
    setFilterValue("");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Tìm kiếm theo tên..."
          value={filterValue}
          onClear={onClear}
          onValueChange={onSearchChange}
          startContent={<TextSearch />}
        />
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger>
              <Button endContent={<ChevronDown />} variant="flat">
                Cột
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={visibleColumns}
              selectionMode="multiple"
              onSelectionChange={setVisibleColumns}
            >
              {columns.map((column) => (
                <DropdownItem
                  key={column.uid}
                  className="capitalize"
                  isDisabled={column.uid === "actions" ? true : false}
                >
                  {column.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button color="primary" endContent={<Plus />} onPress={onAddNew}>
            Thêm mới
          </Button>
        </div>
      </div>
      <PageSizeSelector limit={limit} setLimit={setLimit} setPage={setPage} />
    </div>
  );
};
