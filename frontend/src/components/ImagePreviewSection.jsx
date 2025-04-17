import React, { useState, useEffect } from "react";
import { Input, Image, Button, Spinner } from "@heroui/react";

export default function ImagePreviewSection({
  editImage = [],
  setEditImage,
  isArray,
}) {
  const [oldImages, setOldImages] = useState([]); // Ảnh từ server
  const [newImages, setNewImages] = useState([]); // Ảnh người dùng thêm

  // Load ảnh cũ từ editImage ban đầu (chỉ 1 lần)
  useEffect(() => {
    if (Array.isArray(editImage)) {
      const old = editImage.filter((img) => typeof img === "string");
      setOldImages(old);
    }
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...newFiles]);

    const updatedEditImage = [
      ...(Array.isArray(editImage) ? editImage : []),
      ...files,
    ];
    setEditImage(updatedEditImage);
  };

  const handleRemoveOldImage = (index) => {
    const updatedOld = [...oldImages];
    const removed = updatedOld.splice(index, 1);
    setOldImages(updatedOld);

    setEditImage((prev) =>
      prev.filter((img) => img !== removed[0])
    );
  };

  const handleRemoveNewImage = (index) => {
    const removed = newImages[index];
    URL.revokeObjectURL(removed.preview);

    const updatedNew = [...newImages];
    updatedNew.splice(index, 1);
    setNewImages(updatedNew);

    setEditImage((prev) =>
      prev.filter(
        (item) =>
          !(item instanceof File && item.name === removed.file.name)
      )
    );
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [newImages]);

  const serverURL = import.meta.env.DEV ? "http://localhost:3000" : "";

  return (
    <div className="space-y-4">
      <Input
        label="Chọn ảnh"
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        multiple={isArray}
        onChange={handleImageChange}
      />

      {(oldImages.length > 0 || newImages.length > 0) ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {oldImages.map((img, idx) => (
            <div key={`old-${idx}`} className="relative group">
              <Image
                src={`${serverURL}${img}`}
                alt={`Ảnh cũ ${idx + 1}`}
                className="w-full h-auto rounded-xl object-cover"
                isZoomed
              />
              <Button
                size="sm"
                color="danger"
                onPress={() => handleRemoveOldImage(idx)}
                className="absolute top-2 right-2 z-50 opacity-80 hover:opacity-100"
              >
                X
              </Button>
            </div>
          ))}

          {newImages.map((imgObj, idx) => (
            <div key={`new-${idx}`} className="relative group">
              <Image
                src={imgObj.preview}
                alt={`Ảnh mới ${idx + 1}`}
                className="w-full h-auto rounded-xl object-cover"
                isZoomed
              />
              <Button
                size="sm"
                color="danger"
                onPress={() => handleRemoveNewImage(idx)}
                className="absolute top-2 right-2 z-50 opacity-80 hover:opacity-100"
              >
                X
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <Spinner size="md" color="secondary" variant="dots" />
          <span>Chưa có ảnh nào được chọn...</span>
        </div>
      )}
    </div>
  );
}
