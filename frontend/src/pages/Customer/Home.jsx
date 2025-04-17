import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
} from "@heroui/react";
import { ShoppingCart, Star, Truck, Shield, Clock } from "lucide-react";
import useProductStore from "../../store/productStore";

const Home = () => {
  const { products } = useProductStore();

  const featuredProducts = products.slice(0, 6);
  const newArrivals = products.slice(6, 12);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[500px]">
        <Image
          removeWrapper
          alt="Hero Banner"
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1445205170230-053b83016050"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Summer Collection 2024
            </h1>
            <p className="text-xl md:text-2xl mb-8">Discover the latest trends</p>
            <Button
              color="primary"
              size="lg"
              className="text-lg"
              endContent={<ShoppingCart />}
            >
              Shop Now
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm">
              <Truck className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold">Free Shipping</h3>
                <p className="text-sm text-gray-600">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold">Fast Delivery</h3>
                <p className="text-sm text-gray-600">Within 2-3 business days</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold">Secure Payment</h3>
                <p className="text-sm text-gray-600">100% secure payment</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm">
              <Star className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold">Best Quality</h3>
                <p className="text-sm text-gray-600">Quality guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product._id} className="h-full">
                <CardHeader className="p-0">
                  <Image
                    removeWrapper
                    alt={product.name}
                    className="w-full h-[200px] object-cover"
                    src={product.image}
                  />
                </CardHeader>
                <CardBody className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600">{product.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-primary">
                      ${product.price}
                    </span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="ml-1">{product.rating}</span>
                    </div>
                  </div>
                </CardBody>
                <CardFooter className="p-4">
                  <Button
                    color="primary"
                    className="w-full"
                    endContent={<ShoppingCart />}
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* New Arrivals Banner */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="h-[400px]">
              <CardHeader className="absolute z-10 top-1 flex-col !items-start">
                <p className="text-tiny text-white/60 uppercase font-bold">
                  New Collection
                </p>
                <h4 className="text-white font-medium text-2xl">
                  Summer Fashion 2024
                </h4>
              </CardHeader>
              <Image
                removeWrapper
                alt="New Collection"
                className="z-0 w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1445205170230-053b83016050"
              />
            </Card>
            <Card className="h-[400px]">
              <CardHeader className="absolute z-10 top-1 flex-col !items-start">
                <p className="text-tiny text-white/60 uppercase font-bold">
                  Special Offer
                </p>
                <h4 className="text-white font-medium text-2xl">
                  Up to 50% Off
                </h4>
              </CardHeader>
              <Image
                removeWrapper
                alt="Special Offer"
                className="z-0 w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
              />
            </Card>
          </div>
        </div>
      </div>

      {/* New Arrivals */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">New Arrivals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <Card key={product._id} className="h-full">
                <CardHeader className="p-0">
                  <Image
                    removeWrapper
                    alt={product.name}
                    className="w-full h-[200px] object-cover"
                    src={product.image}
                  />
                </CardHeader>
                <CardBody className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600">{product.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-primary">
                      ${product.price}
                    </span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="ml-1">{product.rating}</span>
                    </div>
                  </div>
                </CardBody>
                <CardFooter className="p-4">
                  <Button
                    color="primary"
                    className="w-full"
                    endContent={<ShoppingCart />}
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Stay updated with our latest products and exclusive offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg text-black"
            />
            <Button color="secondary" size="lg">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 