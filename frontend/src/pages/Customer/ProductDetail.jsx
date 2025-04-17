import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardBody, CardHeader, Image, Button, Typography } from '@heroui/react';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <Image
            src={product.images[0]}
            alt={product.name}
            objectFit="cover"
            width="100%"
            height={400}
          />
        </CardHeader>
        <CardBody>
          <Typography variant="h4">{product.name}</Typography>
          <Typography variant="body1">{product.description}</Typography>
          <Typography variant="h6" color="primary">${product.price}</Typography>
          <Button>Add to Cart</Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProductDetail;