import React, { useState } from 'react';
import { Input, Button, Card, CardBody, Typography } from '@heroui/react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/contact', formData);
    alert('Message sent!');
  };

  return (
    <div className="p-4">
      <Card>
        <CardBody>
          <Typography variant="h4" gutterBottom>Contact Us</Typography>
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
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Input
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              rows={4}
            />
            <Button type="submit">Send</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Contact;