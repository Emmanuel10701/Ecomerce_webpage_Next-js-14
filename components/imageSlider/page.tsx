"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Interface for image data
interface ImageData {
  src: string;
  text: string;
}

// Image data array with text
const images: ImageData[] = [
  { src: '/assets/c1.jpg', text: "Black Friday Deals" },
  { src: '/assets/ecomerce.jpg', text: "E-commerce Deals" },
  { src: '/assets/c2.jpg', text: "Modern Products" },
  { src: '/assets/c3.jpg', text: "Get 80% Offer" },
];

export default function ImageSlider(): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const prevSlide = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const nextSlide = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        nextSlide();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  return (
    <div className="relative w-full h-[50vh]">
      <div
        className="relative w-full h-full group"
        onMouseOver={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={images[currentIndex].src}
          alt={`Slide ${currentIndex + 1}`}
          layout="fill"
          objectFit="cover"
          className="rounded-xl"
        />
        <div className="absolute inset-0 flex items-center justify-center text-white text-xl md:text-2xl font-bold bg-black bg-opacity-50 rounded-xl p-4">
          {images[currentIndex].text}
        </div>
        <button
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#111927] text-white p-2 rounded-xl hover:bg-[#1a222f]"
          onClick={prevSlide}
        >
          <ChevronLeft />
        </button>
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#111927] text-white p-2 rounded-xl hover:bg-[#1a222f]"
          onClick={nextSlide}
        >
          <ChevronRight />
        </button>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-10 ${
                index === currentIndex ? "bg-[#beff46]" : "bg-gray-300"
              } rounded-xl transition-all duration-500`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
