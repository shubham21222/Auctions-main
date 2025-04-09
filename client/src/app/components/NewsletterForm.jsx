import React, { useState } from 'react';
import axios from 'axios';
import config from '@/app/config_BASE_URL';
import toast from 'react-hot-toast';

const NewsletterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    status: 'ACTIVE'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${config.baseURL}/v1/api/newsletter/create`, formData);
      // Reset form after successful submission
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        status: 'ACTIVE'
      });
      toast.success('Successfully subscribed to newsletter!', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to subscribe. Please try again.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#333',
          color: '#fff',
        },
      });
    }
  };

  return (
    <section className="bg-gray-100 py-16 mb-14 flex justify-center items-center container mx-auto max-w-screen-2xl ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-6">
          <h2 className="text-4xl sm:text-5xl">Subscribe to NY Elizabeth{''}s Newsletter</h2>
        </div>
        <form className="space-y-4 pt-6" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full bg-white px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* First Name and Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="w-full bg-white px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="w-full bg-white px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <div className=" text-center pt-6">
            <button
              type="submit"
              className=" w-full sm:w-auto  bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full text-white font-medium px-8 py-3 rounded-md shadow-sm transition-colors duration-300"
            >
              Submit
            </button>
          </div>
        </form>

        {/* Privacy Text */}
        <p className="text-gray-600 text-sm mt-6 text-center">
          By subscribing you are agreeing to NY Elizabeth Privacy Policy. You can unsubscribe from NY Elizabeth emails at
          any time by clicking the {""}Manage your Subscriptions{""} link in any of your emails.
        </p>
      </div>
    </section>
  );
};

export default NewsletterForm;