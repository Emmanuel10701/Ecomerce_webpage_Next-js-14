"use client";

import React, { useState, useEffect } from 'react';
import { FaBars, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CircularProgress, Button } from '@mui/material';
import Sidebar from '../Psidebar/page'; // Adjust the path if necessary
import mockdata from '../../public/mockdata.json'; // Mock data file, adjust path if necessary
import Card from '../card/page'; // Adjust the path if necessary

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  keywords: string[];
  rating?: number;
}

interface FilterState {
  price: string;
  keywords: Record<string, boolean>;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockdata);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockdata);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<FilterState>({
    price: '',
    keywords: {
      Expensive: false,
      'On Sale': false,
      'New Arrival': false,
      Trending: false,
      Popular: false
    }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const itemsPerPage = 20;

  useEffect(() => {
    handleSearch(); // Update filtered products whenever filters or search changes
  }, [filters, searchQuery]);

  useEffect(() => {
    setLoading(true);
    setIsSearching(true);

    try {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      setProducts(paginatedProducts);
      setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
    } catch (error: unknown) {
      console.error('Failed to process products:', error instanceof Error ? error.message : 'Unknown error');
      setError('Failed to process products');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [currentPage, filteredProducts]);

  const handleSearch = () => {
    setIsSearching(true);

    try {
      let tempFilteredProducts = mockdata;

      if (filters.price) {
        const priceRange = filters.price.split('-');
        const minPrice = parseFloat(priceRange[0]);
        const maxPrice = priceRange[1] === 'and-above' ? Infinity : parseFloat(priceRange[1]);
        tempFilteredProducts = tempFilteredProducts.filter(product => product.price >= minPrice && product.price <= maxPrice);
      }

      if (Object.values(filters.keywords).some(v => v)) {
        tempFilteredProducts = tempFilteredProducts.filter(product =>
          product.keywords.some(keyword => filters.keywords[keyword])
        );
      }

      if (searchQuery) {
        tempFilteredProducts = tempFilteredProducts.filter(product =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredProducts(tempFilteredProducts);
    } catch (error: unknown) {
      console.error('Failed to filter products:', error instanceof Error ? error.message : 'Unknown error');
      setError('Failed to filter products');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    setCurrentPage(prevPage => {
      if (direction === 'prev') return Math.max(prevPage - 1, 1);
      if (direction === 'next') return Math.min(prevPage + 1, totalPages);
      return prevPage;
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onFilterChange={setFilters}
      />
      <div className="ml-0 md:ml-[20%] p-2 flex-grow">
        <div className="flex items-center mb-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`text-gray-600 md:hidden ${isSidebarOpen ? 'hidden' : 'block'}`}
          >
            <FaBars size={24} />
          </button>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
            className="ml-4 p-2 border border-gray-300 rounded"
          />
        </div>

        {loading && <CircularProgress />}
        {error && <p className="text-red-500">{error}</p>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {products.map(product => (
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
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white"
          >
            <FaChevronLeft />
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange('next')}
            disabled={currentPage === totalPages}
            className="bg-blue-500 text-white"
          >
            <FaChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
