// pages/index.tsx
import Image from 'next/image';

import HeroSection from '../Product/page';

const HomePage: React.FC = () => {
  return (
    <div className='mt-40'>
      <HeroSection
         image='assets/shopping.jpg'
        backgroundImage="/path/to/your/image.jpg"
        title="Enhace Your Shopping Experience"
        buttonText="Exprole More"
        buttonLink="#learn-more"
      />
    </div>
  );
};

export default HomePage;
