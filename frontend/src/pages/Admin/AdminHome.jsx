// import React from 'react'

// export default function AdminHome() {
//   return (
//     <div>
//       AdminHome
//     </div>
//   )
// }


// Description: This file contains the HomePage component, which serves as the main landing page for an e-commerce website.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Button,
  Card,
  CardBody,
  Image,
  addToast,
} from '@heroui/react';
import { X } from 'lucide-react';
import useUserStore from '../../store/userStore';

const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser: user, logout, defaultImage } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addToast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        timeout: 5000,
        shouldShowTimeoutProgress: true,
        classNames: {
          closeButton: 'opacity-100 absolute right-4 top-1/2 -translate-y-1/2',
          icon: 'w-6 h-6',
        },
        closeIcon: <X size={16} strokeWidth={0.75} absoluteStrokeWidth />,
        color: 'success',
      });
      navigate('/login');
    } catch (error) {
      addToast({
        title: 'Logout Failed',
        description: error.message || 'An error occurred while logging out.',
        timeout: 5000,
        color: 'danger',
      });
    }
  };

  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Categories', href: '/categories' },
    { name: 'Contact', href: '/contact' },
  ];

  const avatarSrc = user?.image
    ? `http://localhost:3000${user.image}`
    : `http://localhost:3000${defaultImage}`;

  // Sample product data for "The Best Dress for the Best Woman"
  const bestDresses = [
    { name: 'Đầm Otis', price: '1.700.000 đ', image: 'https://product.hstatic.net/200000623993/product/mg25_-_lb_no.09_x_logo-11_aefa283ede97409e87a6aff47b1999a3_large.jpg' },
    { name: 'Đầm Regina', price: '1.509.000 đ', image: 'https://product.hstatic.net/200000623993/product/mg25_-_lb_no.08_x_logo-28_4bb84c804d2247c49e5fe2954552548b_large.jpg' },
    { name: 'Đầm Kelin', price: '1.650.000 đ', image: 'https://product.hstatic.net/200000623993/product/mg25_-_lb_no.09_x_logo-63_1730e3b0935f4f3995bc11dff48477f8_large.jpg' },
  ];

  // Sample product data for "Best Outfit for Your Happiness"
  const bestOutfits = [
    { name: 'Áo Ducie', price: '790.000 đ', image: 'https://product.hstatic.net/200000623993/product/mg25_-_lb_no.09_x_logo-24_40a48d1ec65044f7b386ece1c90b941c_large.jpg' },
    { name: 'Áo Sary', price: '990.000 đ', image: 'https://product.hstatic.net/200000623993/product/mg25_-_lb_no.08_x_logo-46_1d8cbc3f191f456f828c86383ddf3b91_large.jpg' },
    { name: 'Áo Kasy', price: '1.560.000 đ', image: 'https://product.hstatic.net/200000623993/product/mg25-lb_no.04_x_logo-44_2e4e5649316745d6b691099f3b4de56c_large.jpg' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Best Dress Section */}
      <div className="px-6 py-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-8">
          The Best Dress for the Best Woman
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestDresses.map((dress, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardBody>
                <Image
                  src={dress.image}
                  alt={dress.name}
                  className="w-full h-96 object-cover"
                />
                <p className="text-lg mt-4">{dress.name}</p>
                <p className="text-lg font-bold">{dress.price}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Best Outfit Section */}
      <div className="px-6 py-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-8">
          Best Outfit for Your Happiness
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestOutfits.map((outfit, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardBody>
                <Image
                  src={outfit.image}
                  alt={outfit.name}
                  className="w-full h-96 object-cover"
                />
                <p className="text-lg mt-4">{outfit.name}</p>
                <p className="text-lg font-bold">{outfit.price}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}