import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useLocation } from "wouter";
import { mockProperties, Property } from "@/data/properties";
import { propertiesApi } from "@/lib/api-client";
import type { Property as ApiProperty } from "@/lib/api-client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactAgentForm } from "@/components/ContactAgentForm";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Swiper
import { Swiper as SwiperClass } from 'swiper/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';

import { 
  ChevronRight, MapPin, Share2, Facebook, Twitter, Link as LinkIcon, 
  Home, Square, Ruler, Layers, Bed, Bath, CheckCircle2, Building, 
  Droplets, AlertTriangle, Zap, Calculator
} from "lucide-react";

/**
 * Convert API related property to mock PropertyCard format
 */
function apiRelatedToMock(apiProp: ApiProperty): Property {
  return {
    id: apiProp.id,
    listing_code: apiProp.listing_code || "",
    title: apiProp.title,
    slug: apiProp.slug,
    price: apiProp.price,
    old_price: apiProp.old_price,
    purpose: apiProp.purpose as "Dijual" | "Disewa" | "Dijual & Disewa",
    type: (apiProp.property_type || "Rumah") as any,
    location: apiProp.location,
    specs: {
      lt: apiProp.land_area,
      lb: apiProp.building_area,
      kt: apiProp.bedrooms,
      km: apiProp.bathrooms,
      lantai: apiProp.floors,
    },
    images: apiProp.image ? [apiProp.image] : [DEFAULT_IMAGE],
    badges: {
      is_premium: apiProp.is_premium,
      is_featured: apiProp.is_featured,
      is_hot: apiProp.is_hot,
      is_sold: apiProp.is_sold,
      is_choice: apiProp.is_choice,
    },
    legalitas: (apiProp as any).legal_status || "",
    status_legalitas: ((apiProp as any).ownership_status || "On Hand") as "On Hand" | "On Bank",
    province: apiProp.province,
    city: apiProp.city,
    district: apiProp.district || "",
    village: "",
    address: "",
    land_area: apiProp.land_area,
    building_area: apiProp.building_area,
    front_width: 0,
    floors: apiProp.floors,
    bedrooms: apiProp.bedrooms,
    bathrooms: apiProp.bathrooms,
    legal_status: "SHM & IMB/PBG Lengkap",
    legal_details: "",
    bank_name: null,
    outstanding_amount: null,
    distance_to_river: null,
    distance_to_grave: null,
    distance_to_powerline: null,
    road_width: 6,
    description: "",
    facilities: [],
    selling_reason: "",
    google_maps_url: "",
    video_url: null,
  };
}

const DEFAULT_IMAGE = "https://images.salambumi.xyz/kost%20dijual%20jogja.webp";

export default function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | undefined>(
    mockProperties.find(p => p.slug === slug)
  );
  const [loading, setLoading] = useState(true);

  // Reset property when slug changes (navigation between detail pages)
  useEffect(() => {
    const mockProp = mockProperties.find(p => p.slug === slug);
    if (mockProp) {
      setProperty(mockProp);
    }
  }, [slug]);

  // Fetch dari API, fallback ke mock data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!slug) return;
      try {
        const result = await propertiesApi.getBySlug(slug);
        if (result.success && result.data) {
          const d = result.data;
          const mockFallback = mockProperties.find(p => p.slug === slug);
          setProperty({
            id: d.id,
            listing_code: d.listing_code,
            title: d.title,
            slug: d.slug,
            price: d.price,
            old_price: d.old_price,
            purpose: d.purpose as any,
            type: d.property_type as any,
            location: d.location,
            specs: { lt: d.land_area, lb: d.building_area, kt: d.bedrooms, km: d.bathrooms, lantai: d.floors },
            images: d.images?.length ? d.images.map((i: any) => i.url) : (d.image ? [d.image] : mockFallback?.images || []),
            badges: { is_premium: d.is_premium, is_featured: d.is_featured, is_hot: d.is_hot, is_sold: d.is_sold, is_choice: d.is_choice },
            legalitas: d.legal_status || "",
            status_legalitas: d.ownership_status as any || "On Hand",
            city: d.city,
            district: d.district || "",
            province: d.province,
            address: d.address || "",
            land_area: d.land_area,
            building_area: d.building_area,
            bedrooms: d.bedrooms,
            bathrooms: d.bathrooms,
            floors: d.floors,
            description: d.description || "",
            facilities: d.facilities || [],
            legal_status: d.legal_status as any,
            bank_name: d.bank_name,
            outstanding_amount: d.outstanding_amount,
            road_width: d.road_width,
            selling_reason: d.selling_reason,
          } as Property);
        }
      } catch {
        // API tidak tersedia, fallback ke mock data untuk slug saat ini
        const mockProp = mockProperties.find(p => p.slug === slug);
        if (mockProp) {
          setProperty(mockProp);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug]);
  
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Mortgage Calculator State
  const [calcPrice, setCalcPrice] = useState(property?.price || 0);
  const [dpPercent, setDpPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenorYears, setTenorYears] = useState(15);

  useEffect(() => {
    if (property) {
      document.title = `${property.title} - ${formatCurrency(property.price)} | Salam Bumi Property`;
      
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', property.description.substring(0, 160));
      
      setCalcPrice(property.price);
      window.scrollTo(0, 0);
    }
  }, [property]);

  // Related properties — fetch from API, fallback to mock data
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (!property) return;

    const fetchRelated = async () => {
      try {
        const result = await propertiesApi.getRelated(property.id, property.type, property.city, 4);
        if (result.success && result.data.length > 0) {
          setRelatedProperties(result.data.map(apiRelatedToMock));
        } else {
          // API returned empty — fallback to mock
          fallbackToMockRelated();
        }
      } catch {
        // API unavailable — fallback to mock
        fallbackToMockRelated();
      }
    };

    const fallbackToMockRelated = () => {
      const mockRelated = mockProperties
        .filter(p => p.id !== property.id && (p.type === property.type || p.city === property.city))
        .slice(0, 4);
      setRelatedProperties(mockRelated);
    };

    fetchRelated();
  }, [property]);

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Properti Tidak Ditemukan</h1>
            <p className="text-gray-500 mb-8">Maaf, properti yang Anda cari mungkin sudah dihapus atau tidak tersedia.</p>
            <Button onClick={() => setLocation("/")}>Kembali ke Beranda</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link disalin",
      description: "Tautan properti berhasil disalin ke clipboard.",
    });
  };

  const handleShareWa = () => {
    const text = `Halo, saya melihat properti ini: ${property.title} - ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFb = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(property.title)}`, '_blank');
  };

  // Calculator Logic
  const dpAmount = calcPrice * (dpPercent / 100);
  const principal = calcPrice - dpAmount;
  const monthlyRate = (interestRate / 100) / 12;
  const months = tenorYears * 12;
  const monthlyInstallment = principal > 0 && monthlyRate > 0 
    ? (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : 0;
  const totalInterest = (monthlyInstallment * months) - principal;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
            <Link href="/properties" className="hover:text-primary transition-colors">Properti</Link>
            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
            <span className="hover:text-primary transition-colors cursor-pointer">{property.type}</span>
            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
            <span className="text-gray-900 font-semibold truncate max-w-[200px] md:max-w-md">{property.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content (70%) */}
            <div className="w-full lg:w-[70%] space-y-8">
              
              {/* Image Gallery */}
              <div className="bg-white rounded-2xl p-2 md:p-4 shadow-sm border border-gray-100">
                <div className="relative rounded-xl overflow-hidden mb-3 aspect-[4/3] md:aspect-[16/9] bg-gray-100">
                  {property.badges.is_sold && (
                    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
                      <div className="absolute bg-accent/90 text-white font-extrabold text-3xl md:text-5xl py-4 w-[150%] text-center transform -rotate-45 -translate-x-[20%] translate-y-[80%] md:translate-y-[100%] shadow-2xl backdrop-blur-sm border-y-8 border-white/20">
                        TERJUAL
                      </div>
                    </div>
                  )}

                  <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {activeImageIndex + 1} / {property.images.length}
                  </div>

                  <Swiper
                    loop={property.images.length > 1}
                    spaceBetween={10}
                    navigation={true}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    modules={[FreeMode, Navigation, Thumbs, Pagination]}
                    onSlideChange={(swiper) => setActiveImageIndex(swiper.realIndex)}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    className="w-full h-full"
                  >
                    {property.images.map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <img src={img} alt={`${property.title} - Foto ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {property.images.length > 1 && (
                <div className="h-20 md:h-24">
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    loop={property.images.length > 6}
                    spaceBetween={10}
                    slidesPerView={Math.min(4, property.images.length)}
                    freeMode={true}
                    watchSlidesProgress={true}
                    modules={[FreeMode, Navigation, Thumbs]}
                    className="w-full h-full"
                    breakpoints={{
                      640: { slidesPerView: Math.min(5, property.images.length) },
                      768: { slidesPerView: Math.min(6, property.images.length) },
                    }}
                  >
                    {property.images.map((img, idx) => (
                      <SwiperSlide key={idx} className="cursor-pointer rounded-lg overflow-hidden opacity-50 [&.swiper-slide-thumb-active]:opacity-100 [&.swiper-slide-thumb-active]:border-2 [&.swiper-slide-thumb-active]:border-primary transition-all">
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                )}
              </div>

              {/* Property Info - Desktop Title Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold text-gray-500 tracking-widest uppercase bg-gray-100 px-3 py-1 rounded-md">
                      {property.listing_code}
                    </span>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
                      {property.purpose}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {property.badges.is_premium && <span className="bg-gradient-to-r from-secondary to-yellow-400 text-primary text-xs font-bold px-3 py-1 rounded-md shadow-sm animate-pulse">PREMIUM</span>}
                    {property.badges.is_featured && <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm">FEATURED</span>}
                    {(property.badges.is_hot || property.old_price) && <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm">HOT</span>}
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                  {property.title}
                </h1>

                <a href={property.google_maps_url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-gray-500 hover:text-primary transition-colors mb-6 group w-fit">
                  <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5 group-hover:animate-bounce" />
                  <span className="text-sm md:text-base">{property.location}</span>
                </a>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6 border-t border-gray-100">
                  <div>
                    <div className="text-sm font-semibold text-gray-500 mb-1">Harga Penawaran</div>
                    {property.old_price && (
                      <div className="text-sm text-gray-400 line-through mb-1">
                        {formatCurrency(property.old_price)}
                      </div>
                    )}
                    <div className="font-extrabold text-3xl md:text-4xl text-primary">
                      {formatCurrency(property.price)}
                      {property.purpose === "Disewa" && <span className="text-lg font-medium text-gray-500"> / thn</span>}
                    </div>
                  </div>

                  {/* Share Buttons */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-500 mr-2 hidden md:block">Bagikan:</span>
                    <button onClick={handleShareWa} className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-colors" aria-label="Share WhatsApp">
                      <Share2 className="w-4 h-4" /> {/* Fallback icon, ideal is WA */}
                    </button>
                    <button onClick={handleShareFb} className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors" aria-label="Share Facebook">
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button onClick={handleShareTwitter} className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-colors" aria-label="Share Twitter">
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button onClick={handleCopyLink} className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 transition-colors" aria-label="Copy Link">
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Spesifikasi Properti</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Luas Tanah</div>
                      <div className="font-bold text-gray-900">{property.land_area} <span className="text-sm font-normal">m²</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Square className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Luas Bangunan</div>
                      <div className="font-bold text-gray-900">{property.building_area} <span className="text-sm font-normal">m²</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Ruler className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Lebar Depan</div>
                      <div className="font-bold text-gray-900">{property.front_width} <span className="text-sm font-normal">m</span></div>
                    </div>
                  </div>
                  {property.floors > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Lantai</div>
                        <div className="font-bold text-gray-900">{property.floors}</div>
                      </div>
                    </div>
                  )}
                  {property.bedrooms > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Bed className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Kamar Tidur</div>
                        <div className="font-bold text-gray-900">{property.bedrooms}</div>
                      </div>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Bath className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Kamar Mandi</div>
                        <div className="font-bold text-gray-900">{property.bathrooms}</div>
                      </div>
                    </div>
                  )}
                  {property.kost_type && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Building className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Tipe Kost</div>
                        <div className="font-bold text-gray-900">{property.kost_type}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi Properti</h2>
                <div className="relative">
                  <div className={`text-gray-600 leading-relaxed whitespace-pre-line ${!showFullDesc ? 'line-clamp-5' : ''}`}>
                    {property.description}
                  </div>
                  {!showFullDesc && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                  )}
                </div>
                <button 
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="mt-4 text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  {showFullDesc ? "Tampilkan Lebih Sedikit" : "Baca Selengkapnya"}
                </button>
              </div>

              {/* Facilities */}
              {Array.isArray(property.facilities) && property.facilities.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Fasilitas</h2>
                  <div className="flex flex-wrap gap-3">
                    {property.facilities.map((fac, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        {fac}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Legalitas & Status</h2>
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    <div className="p-5">
                      <div className="text-sm text-gray-500 mb-1">Status Legalitas</div>
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {property.legal_status}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{property.legal_details}</p>
                    </div>
                    <div className="p-5">
                      <div className="text-sm text-gray-500 mb-1">Kepemilikan</div>
                      <div className="font-bold text-gray-900 mb-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs ${property.status_legalitas === 'On Hand' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {property.status_legalitas}
                        </span>
                      </div>
                      {property.status_legalitas === 'On Bank' && property.bank_name && (
                        <div className="space-y-1 mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Bank:</span>
                            <span className="font-semibold">{property.bank_name}</span>
                          </div>
                          {property.outstanding_amount && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Sisa Pokok:</span>
                              <span className="font-semibold">{formatCurrency(property.outstanding_amount)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5 border-t border-gray-200 bg-white">
                    <div className="text-sm text-gray-500 mb-1">Alasan Jual</div>
                    <div className="font-medium text-gray-900">{property.selling_reason}</div>
                  </div>
                </div>
              </div>

              {/* Environmental */}
              {(property.distance_to_river !== null || property.distance_to_grave !== null || property.distance_to_powerline !== null || property.road_width) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Lingkungan Sekitar</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.distance_to_river !== null && (
                      <div className={`flex items-center gap-4 p-4 rounded-xl border ${property.distance_to_river < 10 ? 'bg-red-50 border-red-100' : 'bg-blue-50/50 border-blue-100'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${property.distance_to_river < 10 ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                          <Droplets className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Jarak ke Sungai</div>
                          <div className="font-bold flex items-center gap-2">
                            {property.distance_to_river} meter
                            {property.distance_to_river < 10 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Perhatian</span>}
                          </div>
                        </div>
                      </div>
                    )}
                    {property.distance_to_grave !== null && (
                      <div className={`flex items-center gap-4 p-4 rounded-xl border ${property.distance_to_grave < 50 ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${property.distance_to_grave < 50 ? 'bg-orange-100 text-orange-500' : 'bg-gray-200 text-gray-500'}`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Jarak ke Makam</div>
                          <div className="font-bold flex items-center gap-2">
                            {property.distance_to_grave} meter
                            {property.distance_to_grave < 50 && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Dekat</span>}
                          </div>
                        </div>
                      </div>
                    )}
                    {property.distance_to_powerline !== null && (
                      <div className="flex items-center gap-4 p-4 rounded-xl border bg-yellow-50 border-yellow-100">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-yellow-100 text-yellow-600">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Jarak ke Sutet</div>
                          <div className="font-bold">{property.distance_to_powerline} meter</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 p-4 rounded-xl border bg-gray-50 border-gray-100">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-200 text-gray-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18h16"/><path d="M4 14h16"/><path d="M4 10h16"/><path d="M4 6h16"/></svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Lebar Jalan Depan</div>
                        <div className="font-bold">{property.road_width} meter</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Video */}
              {property.video_url && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Video Properti</h2>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100">
                    <iframe 
                      src={property.video_url} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Maps */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Lokasi di Peta</h2>
                <div className="h-[400px] w-full rounded-xl overflow-hidden bg-gray-100 relative">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${property.address}&z=15&output=embed`}
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Property Map"
                  ></iframe>
                </div>
              </div>

              {/* KPR Calculator */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Kalkulator KPR</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  <div className="lg:col-span-7 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Properti (Rp)</label>
                      <input 
                        type="number" 
                        value={calcPrice}
                        onChange={(e) => setCalcPrice(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-gray-700">Uang Muka (%)</label>
                        <span className="font-bold text-primary">{dpPercent}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" max="50" step="1"
                        value={dpPercent}
                        onChange={(e) => setDpPercent(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="text-xs text-gray-500 text-right">{formatCurrency(dpAmount)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Suku Bunga (%)</label>
                        <input 
                          type="number" step="0.1"
                          value={interestRate}
                          onChange={(e) => setInterestRate(Number(e.target.value))}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tenor (Tahun)</label>
                        <select 
                          value={tenorYears}
                          onChange={(e) => setTenorYears(Number(e.target.value))}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold cursor-pointer appearance-none"
                        >
                          <option value="5">5 Tahun</option>
                          <option value="10">10 Tahun</option>
                          <option value="15">15 Tahun</option>
                          <option value="20">20 Tahun</option>
                          <option value="25">25 Tahun</option>
                          <option value="30">30 Tahun</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="bg-primary rounded-2xl p-6 text-white h-full flex flex-col relative overflow-hidden shadow-xl">
                      {/* Decorative background elements */}
                      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-secondary/20 blur-2xl"></div>
                      
                      <div className="relative z-10 flex-grow">
                        <div className="text-primary-foreground/80 text-sm font-medium mb-1">Estimasi Cicilan per Bulan</div>
                        <div className="text-3xl md:text-4xl font-extrabold text-secondary mb-8">
                          {formatCurrency(monthlyInstallment)}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/20">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-primary-foreground/80">Pokok Hutang:</span>
                            <span className="font-semibold">{formatCurrency(principal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-primary-foreground/80">Total Bunga ({tenorYears}th):</span>
                            <span className="font-semibold">{formatCurrency(totalInterest)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-semibold pt-2">
                            <span className="text-white">Total Pinjaman:</span>
                            <span className="text-white">{formatCurrency(principal + totalInterest)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 text-[10px] text-primary-foreground/60 leading-tight relative z-10">
                        *Perhitungan ini hanya simulasi. Suku bunga dan ketentuan riil mengikuti kebijakan bank terkait.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile Contact Form (shown only on mobile, below main content) */}
              <div className="block lg:hidden mt-8">
                <ContactAgentForm propertyTitle={property.title} />
              </div>

            </div>

            {/* Sidebar (30%) - Desktop Only */}
            <div className="hidden lg:block w-[30%]">
              <ContactAgentForm propertyTitle={property.title} />
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <section className="mt-20 border-t border-gray-200 pt-16 bg-white">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold text-gray-900">Properti Terkait</h2>
                <Button variant="outline" onClick={() => setLocation("/properties")} className="hidden md:flex rounded-full text-primary border-primary/20 hover:bg-primary hover:text-white">
                  Lihat Semua
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProperties.map(p => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
              <Button variant="outline" onClick={() => setLocation("/properties")} className="w-full mt-6 md:hidden rounded-xl text-primary border-primary/20 hover:bg-primary hover:text-white">
                Lihat Semua Properti
              </Button>
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
