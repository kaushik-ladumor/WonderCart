import React from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Users,
  Package,
  Shield,
  Truck,
  Award,
} from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-black text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            About WonderCart
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Your trusted marketplace for unique products from sellers around the
            world
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Our Story
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Founded in 2024, WonderCart began with a simple mission: to create
              a marketplace that connects talented sellers with discerning
              buyers in a seamless, trustworthy environment.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              What started as a small project has grown into a vibrant community
              of thousands of sellers and hundreds of thousands of satisfied
              customers. We believe in the power of commerce to bring people
              together and create opportunities.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Today, WonderCart is proud to be one of the fastest-growing online
              marketplaces, known for our commitment to quality, security, and
              customer satisfaction.
            </p>
          </div>
          <div className="bg-gray-100 p-8 rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
              alt="Team collaboration"
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-black mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                To empower entrepreneurs and creators by providing them with a
                platform to reach customers worldwide, while ensuring buyers
                have access to high-quality, unique products in a safe and
                secure environment.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-black mb-4">Our Vision</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                To become the world's most trusted marketplace where anyone can
                start, run, and grow a business, and where shoppers can discover
                products they love from sellers they trust.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-12">
          WonderCart by Numbers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-black mb-2">
              50K+
            </div>
            <p className="text-gray-600 text-lg">Sellers</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-black mb-2">
              500K+
            </div>
            <p className="text-gray-600 text-lg">Products</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-black mb-2">
              2M+
            </div>
            <p className="text-gray-600 text-lg">Customers</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-black mb-2">
              150+
            </div>
            <p className="text-gray-600 text-lg">Countries</p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-black text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trust & Security</h3>
              <p className="text-gray-300">
                We prioritize the safety and security of our community above all
                else.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community First</h3>
              <p className="text-gray-300">
                We believe in building strong relationships between buyers and
                sellers.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Excellence</h3>
              <p className="text-gray-300">
                We maintain high standards for products and service on our
                platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-12">
          Why Choose WonderCart
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Easy Shopping</h3>
            <p className="text-gray-600">
              Simple and intuitive shopping experience
            </p>
          </div>
          <div className="text-center">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Quick and reliable shipping worldwide
            </p>
          </div>
          <div className="text-center">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">
              Secure Payments
            </h3>
            <p className="text-gray-600">
              Protected transactions and buyer protection
            </p>
          </div>
          <div className="text-center">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Easy Returns</h3>
            <p className="text-gray-600">Hassle-free return policy</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-4">
            Meet Our Leadership
          </h2>
          <p className="text-gray-600 text-lg text-center mb-12 max-w-3xl mx-auto">
            Dedicated professionals working to make WonderCart the best
            marketplace for everyone
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-black">John Smith</h3>
              <p className="text-gray-600 mb-2">CEO & Founder</p>
              <p className="text-sm text-gray-500">15+ years in e-commerce</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-black">Sarah Johnson</h3>
              <p className="text-gray-600 mb-2">Chief Technology Officer</p>
              <p className="text-sm text-gray-500">
                12+ years in tech leadership
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-black">Michael Chen</h3>
              <p className="text-gray-600 mb-2">Head of Operations</p>
              <p className="text-sm text-gray-500">10+ years in logistics</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
          Join the WonderCart Community
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Whether you're looking to start selling or find amazing products,
          we're here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="bg-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
          >
            Start Selling
          </Link>
          <Link
            to="/shop"
            className="bg-white text-black border-2 border-black px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition"
          >
            Start Shopping
          </Link>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-black transition">
              Home
            </Link>
            <Link
              to="/terms"
              className="text-gray-600 hover:text-black transition"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-gray-600 hover:text-black transition"
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-black transition"
            >
              Contact Us
            </Link>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            © 2026 WonderCart. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
