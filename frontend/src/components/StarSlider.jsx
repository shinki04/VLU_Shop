import React, { useState } from "react";
import { Slider } from "@heroui/react";

export default function StarSlider({ onChangeRange, resetPage, ...props }) {
  const [ratingRange, setRatingRange] = useState([0]);

  const handleChange = (value) => {
    setRatingRange(value);
    resetPage?.(); // gọi setPage(1) từ props nếu có
    onChangeRange?.(value); // gửi giá trị mới ra ngoài
  };

  return (
    <div>
      <Slider
        // getValue={getValue}

        onChange={handleChange}
        minValue={0}
        maxValue={5}
        step={1}
        showTooltip
        showSteps={true}
        // formatOptions={{
        //   style: "decimal",
        //   minimumFractionDigits: 1,
        // }}
        className="w-full"
        {...props} // truyền các props khác nếu cần
      />
    </div>
  );
}
