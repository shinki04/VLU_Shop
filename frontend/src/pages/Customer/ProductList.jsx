import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardBody,
  CardHeader,
  Image,
  Button,
  Select,
  SelectItem,
  Input,
} from "@heroui/react";
import useProductStore from "../../store/productStore";
import useCategoryStore from "../../store/categoryStore";

const ProductList = () => {
  const { products, fetchAllProducts, filterProducts, isLoading, error } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 999999999]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchCategories(1, 100); // Fetch up to 100 categories
    fetchAllProducts(page, limit);
  }, [fetchCategories, fetchAllProducts, page, limit]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setPage(1); // Reset page when category changes
  };

  const handlePriceChange = (value) => {
    setPriceRange(value.split("-").map(Number));
    setPage(1); // Reset page when price range changes
  };

  const handleSearch = () => {
    const categoryIds = selectedCategory ? [selectedCategory] : [];
    filterProducts({
      keyword: searchValue,
      categoryIds,
      priceRange: priceRange.join(","),
      page,
      limit,
    });
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <Select 
          placeholder="Select category"
          onChange={handleCategoryChange}
        >
          <SelectItem key="all" value="">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category._id} value={category._id}>
              {category.name}
            </SelectItem>
          ))}
        </Select>

        <Select
          placeholder="Price range"
          onChange={handlePriceChange}
        >
          <SelectItem value="0-999999999">All Prices</SelectItem>
          <SelectItem value="0-50">$0 - $50</SelectItem>
          <SelectItem value="50-100">$50 - $100</SelectItem>
          <SelectItem value="100-200">$100 - $200</SelectItem>
          <SelectItem value="200-500">$200 - $500</SelectItem>
          <SelectItem value="500-999999999">$500+</SelectItem>
        </Select>

        <Input
          placeholder="Search products"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <Button onClick={handleSearch}>Search</Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <Grid.Container gap={2}>
          {products.map((product) => (
            <Grid key={product._id} xs={12} sm={6} md={4}>
              <Card>
                <CardHeader>
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    objectFit="cover"
                    width="100%"
                    height={200}
                  />
                </CardHeader>
                <CardBody>
                  <h4>{product.name}</h4>
                  <p>{product.description}</p>
                  <p className="text-lg font-bold">${product.price}</p>
                </CardBody>
              </Card>
            </Grid>
          ))}
        </Grid.Container>
      )}
    </div>
  );
};

export default ProductList;