import React from "react";
import {
  Pagination,
  PaginationItem,
  Button,
  PaginationItemType,
} from "@heroui/react";

export const PaginationControls = ({ page, setPage, totalPages }) => {
  return totalPages > 1 ? (
    <div className="flex justify-center">
      <Pagination
        showControls
        isCompact
        total={totalPages}
        page={page}
        onChange={setPage}
        renderItem={({
          value,
          isActive,
          className,
          key,
          onPrevious,
          onNext,
          setPage,
        }) => {
          if (value === PaginationItemType.PREV) {
            return (
              <PaginationItem>
                <Button
                  variant="ghost"
                  onPress={onPrevious}
                  disabled={page === 1}
                >
                  Trước
                </Button>
              </PaginationItem>
            );
          }

          if (value === PaginationItemType.NEXT) {
            return (
              <PaginationItem>
                <Button
                  variant="ghost"
                  onPress={onNext}
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
            <PaginationItem isActive={isActive}>
              <Button
                variant="ghost"
                onPress={() => setPage(value)}
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