import React, { useState } from 'react';
import { Input, Button, Card, CardBody } from '@heroui/react';
import axios from 'axios';
import useCartStore from '../../store/cartStore';

const CheckoutForm = () => {
  const { cartItems, totalPrice, clearCart } = useCartStore();
  const [formData, setFormData] = useState({ name: '', address: '', paymentMethod: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/checkout', { ...formData, cartItems, totalPrice });
    clearCart();
    alert('Order placed successfully!');
  };

  return (
    <div className="p-4">
      <Card>
        <CardBody>
          <h4>Checkout</h4>
          <form onSubmit={handleSubmit}>
            <Input
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Input
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Input
              name="paymentMethod"
              placeholder="Payment Method"
              value={formData.paymentMethod}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Button type="submit">Place Order</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default CheckoutForm;