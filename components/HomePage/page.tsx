"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import your images
import img1 from '/public/assets/c1.jpg';
import img2 from '/public/assets/ecomerce.jpg';
import img3 from '/public/assets/c2.jpg';
import img4 from '/public/assets/c3.jpg';
import img5 from '/public/assets/c4.webp';

// Interface for image data
interface ImageData {
  src: StaticImageData;
  text: string;
}

// Image data array with text
const images: ImageData[] = [
  { src: img1, text: "Black Friday Deals" },
  { src: img2, text: "E-commerce Deals" },
  { src: img3, text: "Modern Products" },
  { src: img4, text: "Get 80% Offer" },
];

export default function ImageSlider(): JSX.Element {
  // State to keep track of the current image index
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [checkedItems, setCheckedItems] = useState({
    groceries: false,
    electronics: false,
    clothes: false,
    food: false,
  });

  // State to determine if the image is being hovered over
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Function to show the previous slide
  const prevSlide = (): void => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  // Function to show the next slide
  const nextSlide = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // useEffect hook to handle automatic slide transition
  useEffect(() => {
    // Start interval for automatic slide change if not hovered
    if (!isHovered) {
      const interval = setInterval(() => {
        nextSlide();
      }, 3000);

      // Cleanup the interval on component unmount
      return () => {
        clearInterval(interval);
      };
    }
  }, [isHovered]);

  // Handle mouse over event
  const handleMouseOver = (): void => {
    setIsHovered(true);
  };

  // Handle mouse leave event
  const handleMouseLeave = (): void => {
    setIsHovered(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setCheckedItems((prevItems) => ({
      ...prevItems,
      [name]: checked,
    }));
  };

  return (
    <div className="relative flex flex-col md:flex-row mx-auto max-w-7xl p-4 space-y-4 md:space-y-0 md:space-x-4">
      {/* Search input and button */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full px-4 flex items-center justify-center bg-white shadow-md rounded-lg md:hidden mt-4 z-10">
        <input
          type="text"
          className='w-[70%] px-4 py-2 rounded-lg focus:outline-1'
          placeholder='What are you looking for?'
        />
        <button
          className="bg-blue-400 text-white hover:bg-blue-500 py-2 px-4 rounded-lg m-3"
        >
          Search
        </button>
      </div>

      {/* Category Selection */}
      <div className="w-full md:w-1/4 p-4  border-r-2 border-gray-300 rounded-sm">
        <h1 className="text-xl text-slate-500 mt-10 font-semibold mb-4">Select Categories</h1>
        <div className="space-y-3">
          {Object.entries(checkedItems).map(([key, checked]) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={key}
                name={key}
                checked={checked}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={key} className="ml-2 text-sm">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Image Slider */}
      <div className="relative w-full md:w-3/4 h-[50vh]">
        <div
          className="relative w-full h-full group"
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        >
          <Image
            src={images[currentIndex].src}
            alt={`Slider Image ${currentIndex + 1}`}
            layout="fill"
            objectFit="cover"
            className="rounded-xl transition-transform duration-500 ease-in-out"
          />
          <div className="absolute inset-0 flex items-center justify-center text-white text-xl md:text-2xl font-bold bg-black bg-opacity-50 rounded-xl p-4">
            {images[currentIndex].text}
          </div>
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#111927] text-white p-2 rounded-xl hover:bg-[#1a222f]"
            onClick={prevSlide}
          >
            <ChevronLeft className="text-gray-400 group-hover:text-white" />
          </button>
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#111927] text-white p-2 rounded-xl hover:bg-[#1a222f]"
            onClick={nextSlide}
          >
            <ChevronRight className="text-gray-400 group-hover:text-white" />
          </button>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1 w-10 ${
                  index === currentIndex
                    ? "bg-[#beff46] rounded-xl"
                    : "bg-gray-300 rounded-xl"
                } transition-all duration-500 ease-in-out`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
