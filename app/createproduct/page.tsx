"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

interface FormData {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  ratings?: number;
  image: File | null;
  quantity: number;
  category: string; // Ensure this is a string
}

const CreateProduct = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: 0,
    oldPrice: undefined,
    ratings: undefined,
    image: null,
    quantity: 0,
    category: "", // Initialize with an empty string
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, value, files } = e.target as HTMLInputElement;
    
    if (type === 'file') {
      if (files && files[0]) {
        const file = files[0];
        setFormData(prev => ({ ...prev, [name]: file }));
        setImagePreviewUrl(URL.createObjectURL(file));
      } else {
        setFormData(prev => ({ ...prev, [name]: null }));
        setImagePreviewUrl(null);
      }
    } else if (type === 'select-one') {
      setFormData(prev => ({
        ...prev,
        [name]: value, // Handle select input
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value ? parseFloat(value) : '') : value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', formData.price.toString());
      if (formData.oldPrice !== undefined) form.append('oldPrice', formData.oldPrice.toString());
      if (formData.ratings !== undefined) form.append('ratings', formData.ratings.toString());
      if (formData.image) form.append('image', formData.image);
      form.append('category', formData.category); // Ensure this matches your schema
  
      const response = await axios.post('/actions/products', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      if (response.status === 200) {
        toast.success('Product created successfully!');
        router.push('/listproducts'); // Redirect to the Products page
      } else {
        toast.error(response.data.error || 'Failed to create product.');
      }
    } catch (error: any) {
      console.error('Error creating product:', error.message || error);
      toast.error(error.response?.data?.error || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <section className="flex flex-col items-center min-h-screen p-6 bg-gray-50">
      <form
        className="p-8 bg-white rounded-lg shadow-lg max-w-lg w-full border border-gray-200"
        onSubmit={handleSubmit}
      >
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Create New Product
        </h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <label className="block text-sm font-semibold text-gray-700 mb-2">Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-2">Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-2">Price:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          step="0.01"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-2">Old Price (optional):</label>
        <input
          type="number"
          name="oldPrice"
          value={formData.oldPrice !== undefined ? formData.oldPrice : ''}
          onChange={handleChange}
          step="0.01"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity In Stock (optional):</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          step="1"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-2">Ratings (optional):</label>
        <select
          name="ratings"
          value={formData.ratings !== undefined ? formData.ratings : ''}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Rating</option>
          {[1, 2, 3, 4, 5].map(rating => (
            <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
          ))}
        </select>

        <label className="block text-sm font-semibold text-gray-700 mb-2">category (optional):</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select category</option>
          {["Accessories", "Groceries", "Fashions", "Home Appliants", "Kids"].map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <label className="block text-sm font-semibold text-gray-700 mb-2">Image (optional):</label>
        <input
          type="file"
          name="image"
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {imagePreviewUrl && (
          <div className="mt-4 mb-6">
            <img src={imagePreviewUrl} alt="Image Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      <ToastContainer />
    </section>
  );
};

export default CreateProduct;
