import React from 'react';

const NewsletterForm = () => {
  return (
    <section className="bg-gray-100 py-16 mb-14 flex justify-center items-center container mx-auto max-w-screen-2xl ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-6">
          <h2 className="text-4xl sm:text-5xl">Subscribe to NY Elizabeth{''}s Newsletter</h2>
        </div>
        <form className="space-y-4 pt-6">
          {/* Email Input */}
          <div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-white px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* First Name and Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="w-full bg-white px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-full bg-white px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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