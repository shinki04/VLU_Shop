// import React, { useState } from 'react';
// import { Slider } from '@heroui/react';
// import { Star } from 'lucide-react';

// const ReactRatingStarsComponent = ({ defaultValue = 3, onChangeRange }) => {
//   const [value, setValue] = useState(defaultValue);

//   const handleChange = (newValue) => {
//     setValue(newValue);
//     if (onChangeRange) {
//       onChangeRange(newValue);
//     }
//   };

//   // Chuyển đổi giá trị slider thành số sao (1-5)
//   const renderStars = () => {
//     const stars = [];
//     const starValue = Math.round(value); // Làm tròn giá trị để hiển thị sao
//     for (let i = 1; i <= 5; i++) {
//       stars.push(
//         <Star
//           key={i}
//           className={i <= starValue ? 'text-yellow-400' : 'text-gray-300'}
//           size={24}
//           fill='currentColor'
//         />
//       );
//     }
//     return stars;
//   };

//   return (
//     <div className="flex flex-col items-center gap-2">
//       <div className="flex gap-1">{renderStars()}</div>
//       <Slider
//         value={value}
//         onChange={handleChange}
//         minValue={1}
//         maxValue={5}
//         step={1}
//         showSteps={true}
//         className="w-64"
//         aria-label="Rating slider"
//         formatOptions={{ style: 'decimal' }}
//         renderThumb={(props) => (
//           <div
//             {...props}
//             className="h-5 w-5 bg-yellow-400 rounded-full cursor-pointer"
//           />
//         )}
//       />
//     </div>
//   );
// };

// export default ReactRatingStarsComponent;

import React, { useState } from "react";
import { Star } from "lucide-react";

const ReactRatingStarsComponent = ({ defaultValue = 5, onChangeRange }) => {
  const [value, setValue] = useState(defaultValue);

  const handleStarClick = (newValue) => {
    setValue(newValue);
    if (onChangeRange) {
      onChangeRange(newValue);
    }
  };

  // Hiển thị các ngôi sao
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          className="focus:outline-none"
          aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
        >
          <Star
            className={i <= value ? "text-yellow-400" : "text-gray-300"}
            size={24}
            fill="currentColor"
          />
        </button>
      );
    }
    return stars;
  };

  return <div className="flex gap-1 items-center">{renderStars()}</div>;
};

export default ReactRatingStarsComponent;
