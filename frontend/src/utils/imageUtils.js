export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/images/default.png';
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  return `${import.meta.env.VITE_API_URL}${imagePath}`;
}; 