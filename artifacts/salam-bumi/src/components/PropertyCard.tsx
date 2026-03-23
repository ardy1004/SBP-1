import { useState } from "react";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { Property } from "@/data/properties";
import { 
  MapPin, Bed, Bath, Maximize, Share2, 
  Home, Building, Hotel, Diamond, Star, Flame, ChevronLeft, ChevronRight 
} from "lucide-react";
import { Button } from "./ui/button";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveImg((p) => (p + 1) % property.images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveImg((p) => (p - 1 + property.images.length) % property.images.length);
  };

  const getTypeIcon = () => {
    switch (property.type) {
      case "Rumah": return <Home className="w-3.5 h-3.5" />;
      case "Apartment": return <Building className="w-3.5 h-3.5" />;
      case "Kost": return <Hotel className="w-3.5 h-3.5" />;
      default: return <Home className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top badges Layering */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <div className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
          {getTypeIcon()}
          {property.type}
        </div>
      </div>

      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
        {property.badges.is_premium && (
          <div className="bg-gradient-to-r from-secondary to-yellow-400 text-primary text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-lg animate-pulse">
            <Star className="w-3.5 h-3.5 fill-primary" />
            PREMIUM
          </div>
        )}
        {property.badges.is_featured && (
          <div className="bg-gradient-to-r from-blue-400 to-primary text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md">
            <Diamond className="w-3.5 h-3.5 fill-white" />
            FEATURED
          </div>
        )}
        {(property.badges.is_hot || property.old_price) && (
          <div className="bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md">
            <Flame className="w-3.5 h-3.5 fill-white" />
            HOT
          </div>
        )}
      </div>

      {/* Image Gallery */}
      <Link href={`/property/${property.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={property.images[activeImg]} 
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* SOLD Ribbon Overlay */}
        {property.badges.is_sold && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            {/* Red overlay on entire image (20% opacity) */}
            <div className="absolute inset-0 bg-red-500/20" />
            
            {/* Diagonal Ribbon from bottom-left to top-right */}
            <div className="absolute bottom-0 left-0 w-full h-full flex items-center justify-center">
              <div className="absolute bg-gradient-to-r from-red-600 to-red-500 text-white font-extrabold text-xl sm:text-2xl md:text-3xl px-12 sm:px-16 md:px-20 py-2 sm:py-3 border-[3px] border-white shadow-2xl transform -rotate-45 tracking-widest whitespace-nowrap">
                S O L D
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Arrows (Show on hover if multiple imgs) */}
        {property.images.length > 1 && isHovered && (
          <>
            <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-primary transition-colors z-20 backdrop-blur-sm">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-primary transition-colors z-20 backdrop-blur-sm">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom Badges in Image */}
        <div className="absolute bottom-3 left-3 z-20">
          <span className="bg-white/95 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
            {property.purpose}
          </span>
        </div>

        <button 
          onClick={(e) => { e.preventDefault(); /* share logic */ }}
          className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-primary hover:bg-white shadow-sm transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
            {property.listing_code}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {property.status_legalitas}
          </span>
        </div>

        <Link href={`/property/${property.slug}`}>
          <h3 className="font-bold text-base text-gray-900 leading-snug mb-2 line-clamp-2 hover:text-primary transition-colors">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-start gap-1.5 text-gray-500 mb-4">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-secondary" />
          <span className="text-xs leading-relaxed">{property.location}</span>
        </div>

        {/* Prices */}
        <div className="mt-auto mb-4">
          {property.old_price && (
            <div className="text-xs text-gray-400 line-through mb-0.5">
              {formatCurrency(property.old_price)}
            </div>
          )}
          <div className="font-extrabold text-xl text-primary">
            {formatCurrency(property.price)}
            {property.purpose === "Disewa" && <span className="text-xs font-medium text-gray-500"> / thn</span>}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full mb-4" />

        {/* Specs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {property.specs.kt !== undefined && (
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-2" title="Kamar Tidur">
              <Bed className="w-4 h-4 text-gray-500 mb-1" />
              <span className="text-xs font-semibold text-gray-700">{property.specs.kt}</span>
            </div>
          )}
          {property.specs.km !== undefined && (
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-2" title="Kamar Mandi">
              <Bath className="w-4 h-4 text-gray-500 mb-1" />
              <span className="text-xs font-semibold text-gray-700">{property.specs.km}</span>
            </div>
          )}
          {property.specs.lt !== undefined && (
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-2" title="Luas Tanah">
              <Maximize className="w-4 h-4 text-gray-500 mb-1" />
              <span className="text-xs font-semibold text-gray-700">{property.specs.lt}<span className="text-[10px]">m²</span></span>
            </div>
          )}
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-2 px-1" title="Legalitas">
            <span className="text-[10px] text-gray-500 mb-1">Legal</span>
            <span className="text-[10px] font-bold text-primary text-center leading-tight truncate w-full">{property.legalitas.split(',')[0]}</span>
          </div>
        </div>

        <Button asChild variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl h-11 transition-all">
          <Link href={`/property/${property.slug}`}>
            Lihat Detail Properti
          </Link>
        </Button>
      </div>
    </div>
  );
}
