import React, { useCallback } from "react";
import {
  Pagination,
  PaginationItem,
  Button,
  PaginationItemType,
} from "@heroui/react";

export const PaginationControls = ({ page, setPage, totalPages }) => {
  // Sử dụng useCallback để tránh tạo hàm mới mỗi khi component re-render
  const handlePageChange = useCallback((newPage) => {
    if (newPage !== page) {
      console.log(`PaginationControls: Changing page from ${page} to ${newPage}`);
      setPage(newPage);
    }
  }, [page, setPage]);

  return totalPages > 1 ? (
    <div className="flex justify-center">
      <Pagination
        showControls
        isCompact
        total={totalPages}
        page={page}
        onChange={handlePageChange} // Sử dụng hàm đã được memoized
        renderItem={({
          value,
          isActive,
          className,
          key,
          onPrevious,
          onNext,
          setPage: paginationSetPage,
        }) => {
          if (value === PaginationItemType.PREV) {
            return (
              <PaginationItem key={key}>
                <Button
                  variant="ghost"
                  onPress={() => {
                    if (page > 1) {
                      handlePageChange(page - 1);
                    }
                  }}
                  disabled={page === 1}
                >
                  Trước
                </Button>
              </PaginationItem>
            );
          }

          if (value === PaginationItemType.NEXT) {
            return (
              <PaginationItem key={key}>
                <Button
                  variant="ghost"
                  onPress={() => {
                    if (page < totalPages) {
                      handlePageChange(page + 1);
                    }
                  }}
                  disabled={page === totalPages}
                >
                  Sau
                </Button>
              </PaginationItem>
            );
          }

          if (value === PaginationItemType.DOTS) {
            return <button key={key} className={className}>...</button>;
          }

          return (
            <PaginationItem key={key} isActive={isActive}>
              <Button
                variant="ghost"
                onPress={() => handlePageChange(value)}
                className={isActive ? "font-bold text-blue-600" : ""}
              >
                {value}
              </Button>
            </PaginationItem>
          );
        }}
      />
    </div>
  ) : null;
};