import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchForm } from "@/components/SearchForm";
import { PropertyCard } from "@/components/PropertyCard";
import { mockProperties } from "@/data/properties";
import { Button } from "@/components/ui/button";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Home() {
  const [visibleCount, setVisibleCount] = useState(8);
  
  const choiceProperties = mockProperties.filter(p => p.badges.is_choice);
  const gridProperties = mockProperties.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-48 min-h-[85vh] flex items-center">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.salambumi.xyz/kost%20dijual%20jogja.webp" 
              alt="Real Estate Jogja" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B152A]/80 via-[#0B152A]/60 to-[#0B152A]/90 mix-blend-multiply" />
          </div>

          <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 text-center text-white mt-10">
            <span className="inline-block py-1.5 px-4 rounded-full bg-secondary/20 text-secondary border border-secondary/30 text-sm font-bold tracking-wider mb-6 uppercase">
              #1 Agen Properti Yogyakarta
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl mx-auto leading-tight">
              Finding The Best Properties, <br className="hidden md:block"/> Will Be Easier And More Precise
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 font-light">
              "Don't Wait To Buy Real Estate, Buy Real Estate And Wait"
            </p>
          </div>

          {/* Floating Search Form */}
          <div className="absolute left-0 right-0 -bottom-16 md:-bottom-24 z-20 px-4">
            <SearchForm />
          </div>
        </section>

        {/* Spacer for floating card */}
        <div className="h-24 md:h-32"></div>

        {/* FEATURED PROPERTIES CAROUSEL */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">Properti Pilihan</h2>
                <p className="text-gray-500 max-w-2xl">
                  Kurasi properti premium terbaik dengan nilai investasi tinggi dan lokasi paling strategis.
                </p>
              </div>
              <Button variant="outline" className="shrink-0 rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white">
                Lihat Semua Pilihan
              </Button>
            </div>

            <div className="relative w-full overflow-hidden rounded-2xl pt-4 pb-12 px-2">
              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                navigation
                pagination={{ clickable: true, dynamicBullets: true }}
                className="w-full !px-2 !pb-12"
              >
                {choiceProperties.map((property) => (
                  <SwiperSlide key={property.id} className="h-auto pb-4">
                    <PropertyCard property={property} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>

        {/* LATEST PROPERTIES GRID */}
        <section className="py-16 md:py-24 bg-gray-50/50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">Properti Terbaru</h2>
              <p className="text-gray-500">
                Temukan listing terbaru kami yang baru saja masuk pasar. Dari rumah subsidi hingga ruko komersial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
              {gridProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {visibleCount < mockProperties.length && (
              <div className="flex justify-center">
                <Button 
                  onClick={() => setVisibleCount(prev => Math.min(prev + 8, mockProperties.length))}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
                >
                  Muat Lebih Banyak Properti
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary z-0"></div>
          <div className="absolute inset-0 bg-[url('https://images.salambumi.xyz/kost%20dijual%20jogja.webp')] opacity-10 mix-blend-overlay object-cover z-0"></div>
          
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Punya Properti Untuk Dijual/Disewakan?</h2>
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Titipkan properti Anda pada kami. Tim marketing profesional kami siap membantu menjualkan atau menyewakan properti Anda dengan cepat.
            </p>
            <Button className="bg-secondary hover:bg-secondary/90 text-primary font-bold rounded-full px-8 py-6 text-lg shadow-xl shadow-secondary/20 transition-all hover:scale-105">
              Titip Jual Properti
            </Button>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
