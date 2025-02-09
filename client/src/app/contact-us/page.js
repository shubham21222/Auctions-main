import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ContactPage = () => {
  return (
    <>
    <Header/>
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 mt-[80px]">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
        <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full mb-6"></div>
        <p className="text-lg text-gray-600">We{''}re here to assist you</p>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information Section */}
        <div className="bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-800 h-[400px] flex flex-col justify-center">
          <div className="space-y-8">
            {/* Address */}
            <div className="flex items-start space-x-6">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Visit Us</h3>
                <p className="text-gray-300 leading-relaxed">
                  269 South Beverly Drive<br />
                  Suite 142<br />
                  Beverly Hills, CA 90212<br />
                  USA
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-6">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Phone className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Call Us</h3>
                <a 
                  href="tel:310-402-2450" 
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  310-402-2450
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-6">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Email Us</h3>
                <a 
                  href="mailto:hello@nyelizabeth.com" 
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                 hello@nyelizabeth.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-800 h-[400px]">
          <div className="relative w-full h-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.2759782722405!2d-118.39932499999999!3d34.062439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bbfb83137b27%3A0x74cb2b7b4a2ed576!2s269%20S%20Beverly%20Dr%20%23142%2C%20Beverly%20Hills%2C%20CA%2090212%2C%20USA!5e0!3m2!1sen!2sin!4v1736915960187!5m2!1sen!2sin"
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default ContactPage;