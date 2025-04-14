import React from "react";
import { Select, SelectItem } from "@heroui/react";

export const PageSizeSelector = ({
  limit,
  setLimit,
  pageSizeOptions = [5, 10, 20, 50],
  setPage,
  
}) => {
  const handleLimitChange = (value) => {
    if (!value) return;
    const newLimit = parseInt(value, 10);
    if (isNaN(newLimit)) return;
    setLimit(newLimit);
    setPage(1); // Reset về trang 1 khi thay đổi limit
  };

  return (
    <div className="flex items-center gap-2">
      <span>Hiển thị:</span>
      <Select
        label="Số dòng mỗi trang"
        selectedKeys={[limit.toString()]}
        onSelectionChange={(keys) => {
          const selected = keys.size > 0 ? Array.from(keys)[0] : null;
          handleLimitChange(selected);
        }}
        className="max-w-xs"
      >
        {pageSizeOptions.map((val) => (
          <SelectItem
            key={val.toString()}
            value={val.toString()}
            textValue={`${val} / trang`}
          >
            {val} / trang
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};
