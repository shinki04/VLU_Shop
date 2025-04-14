import React, { useState } from "react";
import { useUserStore } from "../store/userStore";

export default function ProfileForm() {
  const { user, updateProfile, deleteImage, uploadImage, isLoading, error } = useUserStore();
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.image || null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(user?.image || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = user?.image || "";
      if (image) {
        imageUrl = await uploadImage(image); // Gọi API upload
      }
      await updateProfile({ ...formData, image: imageUrl });
      alert("Profile updated successfully!");
      setImage(null);
      setImagePreview(imageUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteImage = async () => {
    if (window.confirm("Are you sure you want to delete your profile image?")) {
      try {
        await deleteImage();
        alert("Image deleted successfully!");
        setImage(null);
        setImagePreview(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!user) {
    return <div className="text-center mt-10">Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Profile</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 w-full p-2 border rounded-md"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Profile"
              className="mt-2 w-24 h-24 object-cover rounded-full"
            />
          )}
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
          {user.image && (
            <button
              type="button"
              onClick={handleDeleteImage}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white p-2 rounded-md hover:bg-red-700 disabled:bg-red-300"
            >
              {isLoading ? "Deleting..." : "Delete Image"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}