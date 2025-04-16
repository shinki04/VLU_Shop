import React, { useState, useEffect } from "react";
import { Input, Image, Button, Spinner } from "@heroui/react";

export default function ImagePreviewSection({
  editImage = [],
  setEditImage,
  isArray,
}) {
  const [oldImages, setOldImages] = useState([]); // ảnh cũ từ server
  const [newImages, setNewImages] = useState([]); // ảnh mới người dùng thêm

  // Load ảnh cũ từ props (nếu là mảng path)
  useEffect(() => {
    if (Array.isArray(editImage)) {
      const old = editImage.filter((img) => typeof img === "string");
      setOldImages(old);
    }
  }, [editImage]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImageObjects = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...newImageObjects]);
    setEditImage((prev) => [...(Array.isArray(prev) ? prev : []), ...files]);
  };

  const handleRemoveOldImage = (index) => {
    const updated = oldImages.filter((_, i) => i !== index);
    setOldImages(updated);
    setEditImage((prev) => prev.filter((item) => item !== oldImages[index]));
  };

  const handleRemoveNewImage = (index) => {
    URL.revokeObjectURL(newImages[index].preview);
    const updatedNew = [...newImages];
    updatedNew.splice(index, 1);
    setNewImages(updatedNew);
    setEditImage((prev) =>
      prev.filter(
        (item) =>
          !(item instanceof File && item.name === newImages[index].file.name)
      )
    );
  };

  useEffect(() => {
    return () => {
      newImages.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [newImages]);

  const serverURL = import.meta.env.DEV ? "http://localhost:3000" : "";

  return (
    <div>
      <Input
        label="Chọn ảnh"
        type="file"
        accept="image/*"
        multiple={isArray}
        onChange={handleImageChange}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {/* Ảnh từ server */}
        {oldImages.map((img, index) => (
          <div key={`old-${index}`} className="relative group">
            <Image
              src={`${serverURL}${img}`}
              alt={`Old Image ${index + 1}`}
              className="w-full h-auto object-cover rounded-lg"
              isZoomed
              onChange={handleImageChange}
            />
            <Button
              size="sm"
              color="danger"

              onPress={() => handleRemoveOldImage(index)}
              className="absolute top-2 right-2 opacity-80 hover:opacity-100 z-50"
            >
              X
            </Button>
          </div>
        ))}

        {/* Ảnh người dùng thêm */}
        {newImages.map((item, index) => (
          <div key={`new-${index}`} className="relative group">
            <Image
              src={item.preview}
              alt={`New Image ${index + 1}`}
              className="w-full h-auto object-cover rounded-lg"
              isZoomed
              onChange={handleImageChange}
            />
            <Button
              size="sm"
              color="danger"
              onPress={() => handleRemoveNewImage(index)}
              className="absolute top-2 right-2 opacity-80 hover:opacity-100"
            >
              X
            </Button>
          </div>
        ))}
      </div>

      {oldImages.length === 0 && newImages.length === 0 && (
        <Spinner
          variant="dots"
          color="secondary"
          size="md"
          label="Chờ bạn chọn ảnh..."
          className="mt-4"
        />
      )}
    </div>
  );
}
