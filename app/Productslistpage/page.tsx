"use client";

import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { CircularProgress } from '@mui/material';
import Sidebar from '@/components/Psidebar/page'; // Adjust the path as necessary
import Card from '@/components/card/page'; // Adjust the path to Card component

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  rating?: number;
  category: string;
}

const categories = [
  'Electronics',
  'Home Appliances',
  'Fashion',
  'Books & Media',
  'Kids'
];

const HomePage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    price: '',
    categorys: {} as Record<string, boolean>, // Initialize as an empty Record
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Updated to 12 items per page

  const images = [
    { src: '/images/2.jpg', text: 'E-commerce Deals' },
    { src: '/images/3.jpg', text: 'Modern Products' },
    { src: '/images/4.jpg', text: 'Get Shopping for Kids' },
    { src: '/images/5.jpg', text: 'Explore Our Products' },
    { src: '/images/6.jpg', text: 'Here is What We Have for You' },
    { src: '/images/7.jpg', text: 'Get Help for Kids Fashions' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/mockdata.json'); // Path from public folder
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products.');
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(slideInterval);
  }, [images.length]);

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleFilterChange = (newFilterState: { price: string; categorys: Record<string, boolean> }) => {
    setFilters(newFilterState);
  };

  const filteredProducts = products.filter((p) => {
    let result = true;

    if (selectedCategory && p.category !== selectedCategory) {
      result = false;
    }

    if (filters.price) {
      const [minPrice, maxPrice] = filters.price.split('-').map(Number);
      result = result && p.price >= minPrice && (isNaN(maxPrice) || p.price <= maxPrice);
    }

    if (Object.values(filters.categorys).some(Boolean)) {
      result = result && filters.categorys[p.category];
    }

    if (searchTerm) {
      result = result && (p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return result;
  });

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-30 w-[20vw]`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-2 right-2 text-gray-600"
          aria-label="Close Sidebar"
        >
          <FaTimes size={18} />
        </button>
        <Sidebar onFilterChange={handleFilterChange} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-expanded={isSidebarOpen}
        aria-controls="sidebar"
        className="fixed top-4 left-2 text-gray-600 border cursor-pointer hover:bg-slate-400 bg-slate-300 p-1 rounded-sm z-20"
      >
        <FaBars size={16} />
      </button>

      <div className="md:flex md:flex-row items-center">
        {/* Category List */}
        <div className="flex-none relative md:w-2/6 bg-white p-4">
          <section className="py-6">
            <h2 className="text-xl font-bold mb-6 text-slate-500">Categories</h2>
            <div className="flex flex-col space-y-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`text-md font-semibold text-slate-500 block w-full text-left p-2 ${selectedCategory === category ? 'bg-gray-200' : ''}`}
                >
                  {category}
                </button>
              ))}
              <button
                onClick={() => setSelectedCategory(null)}
                className={`text-md font-semibold text-slate-500 block w-full text-left p-2 ${selectedCategory === null ? 'bg-gray-200' : ''}`}
              >
                All Categories
              </button>
            </div>
          </section>
        </div>
        {/* Carousel */}
        <div className="relative h-[65vh] w-[76%]">
          <div className="relative h-full group">
            <Image
              src={images[currentIndex].src}
              alt={`Slide ${currentIndex + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-xl"
            />
            <div className="absolute inset-0 flex items-center justify-center text-white text-2xl md:text-3xl font-bold bg-black bg-opacity-40 rounded-xl p-4">
              {images[currentIndex].text}
            </div>
            <button
              onClick={() =>
                setCurrentIndex(
                  (currentIndex - 1 + images.length) % images.length
                )
              }
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() =>
                setCurrentIndex((currentIndex + 1) % images.length)
              }
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Products */}
      <div className="flex flex-col  p-4">
        {/* Search */}
        <div className="flex w-1/2  ml-[30%]  md:flex-row gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="border px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 flex-grow"
          />
          <button
            onClick={handleSearch}
            className="flex bg-gradient-to-r from-orange-500 via-red-500 to-red-400 py-2 px-4 rounded-lg items-center shadow-md hover:shadow-lg text-white transition-all duration-300"
          >
            Search           
            <FaSearch size={14} />
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-10 p-2 mb-4 mx-[5%]">
          {isLoading ? (
            <div className="flex items-center justify-center ml-[45%] w-full h-32">
              <CircularProgress />
            </div>
          ) : error ? (
            <p className="text-center w-full text-red-600">{error}</p>
          ) : currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <Card
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                oldPrice={product.oldPrice}
                imageUrl={product.imageUrl}
                description={product.description}
                rating={product.rating}
              />
            ))
          ) : (
            <p className="text-center flex-1 flex w-full text-red-700">No results found for "<strong>{searchTerm}</strong>"</p>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-l-md"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 py-2 text-blue-500 font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
