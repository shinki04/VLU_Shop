import React from 'react';
import { Grid, Card, CardBody, CardHeader, Image, Button, Typography } from '@heroui/react';
import useCartStore from '../../store/cartStore';

const Cart = () => {
  const { cartItems, totalPrice, removeFromCart } = useCartStore();

  return (
    <div className="p-4">
      {cartItems.length === 0 ? (
        <Typography variant="body1">Your cart is empty</Typography>
      ) : (
        <Grid.Container gap={2}>
          {cartItems.map(item => (
            <Grid key={item.id} xs={12} sm={6} md={4}>
              <Card>
                <CardHeader>
                  <Image
                    src={item.image}
                    alt={item.name}
                    objectFit="cover"
                    width="100%"
                    height={200}
                  />
                </CardHeader>
                <CardBody>
                  <Typography variant="h5">{item.name}</Typography>
                  <Typography variant="body2">{item.description}</Typography>
                  <Typography variant="h6" color="primary">${item.price}</Typography>
                  <Button onClick={() => removeFromCart(item.id)}>Remove</Button>
                </CardBody>
              </Card>
            </Grid>
          ))}
        </Grid.Container>
      )}
      <div className="mt-4">
        <Typography variant="h6">Total: ${totalPrice}</Typography>
        <Button href="/checkout">Proceed to Checkout</Button>
      </div>
    </div>
  );
};

export default Cart;