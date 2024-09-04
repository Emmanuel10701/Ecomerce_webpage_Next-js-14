"use client";

import Image from "next/image";
import Product from "../products/page";

interface HeroSectionProps {
  backgroundImage: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  backgroundImage,
  title,
  buttonText,
  buttonLink,
  image,
}) => {
  return (
    <div className="relative w-full">
      {/* Title Section */}
      <div className="text-center mb-8 px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-600">
          OUR PRODUCTS
        </h1>
      </div>

      {/* Hero Section */}
      <div
        className="relative w-[70%]  h-[60vh] md:h-[70vh] bg-cover bg-center mx-auto"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="relative rounded-4xl flex flex-col md:flex-row items-center justify-center md:justify-between h-full px-4 md:px-8 rounded-4xl text-white">
          {/* Text and Button Container */}
          <div className="relative z-10 md:w-1/2 text-center md:text-left space-y-4 mb-8 md:mb-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 bg-clip-text text-transparent">
              {title}
            </h1>
            <a
              href={buttonLink}
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              {buttonText}
            </a>
          </div>

          {/* Image Container */}
          <div className="relative w-full md:w-1/2 h-full">
          <Image
            src="/assets/shopping.jpg" // Note the leading slash
            alt="Shopping"
            layout="fill"
            objectFit="cover"
            />
          </div>
        </div>
      </div>
      <Product/>
    </div>
  );
};

export default HeroSection;
