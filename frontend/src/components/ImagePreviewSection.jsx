import React, { useState, useEffect } from "react";
import { Input, Image, Spinner } from "@heroui/react";
import BounceCards from "./BounceCards/BounceCards";
export default function ImagePreviewSection({
  editImage,
  setEditImage,
  isArray,
}) {
  const [previews, setPreviews] = useState([]);
  const transformStyles = [
    "rotate(5deg) translate(-150px)",
    "rotate(0deg) translate(-70px)",
    "rotate(-5deg)",
    "rotate(5deg) translate(70px)",
    "rotate(-5deg) translate(150px)",
  ];
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setEditImage(isArray ? files : files[0]); // Lưu mảng file nếu isArray, ngược lại lưu file đơn
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  // Dọn dẹp URL tạm thời
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  return (
    <div>
      <Input
        label="Chọn ảnh"
        type="file"
        accept="image/*"
        multiple={isArray} // Sử dụng multiple như một boolean
        onChange={handleImageChange}
      />
      <div className="mt-4">
        {previews.length === 0 && editImage && !Array.isArray(editImage) ? (
          <Image
            alt="Image"
            src={`${
              import.meta.env.DEV ? "http://localhost:3000" : ""
            }${editImage}`}
            className="block w-full h-auto object-cover max-w-[300px]"
            loading="lazy"
            isZoomed
          />
        ) : previews.length === 1 ? (
          <Image
            alt="Preview Image"
            src={previews[0]}
            className="block w-full h-auto object-cover max-w-[300px]"
            loading="lazy"
            isZoomed
          />
        ) : previews.length > 1 && isArray ? (
          <BounceCards
            className="custom-bounceCards"
            images={previews}
            containerWidth={500}
            containerHeight={250}
            animationDelay={1}
            animationStagger={0.08}
            easeType="elastic.out(1, 0.5)"
            transformStyles={transformStyles.slice(0, previews.length)} // Chỉ lấy số lượng tương ứng
            enableHover={false}
          />
        ) : (
          <Spinner variant="dots" color="secondary" size="md" label="Waiting your image" />
        )}
      </div>
    </div>
  );
}
