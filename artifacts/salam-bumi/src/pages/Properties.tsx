import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { PropertyCard } from "@/components/PropertyCard";
import { propertiesApi } from "@/lib/api-client";
import { Property } from "@/data/properties";
import { Search, Filter, ChevronDown, Loader2, Home, Building, Map, Palmtree, Store, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PROPERTY_TYPES = [
  { value: "", label: "Semua Tipe", icon: Grid },
  { value: "rumah", label: "Rumah", icon: Home },
  { value: "kost", label: "Kost", icon: Building },
  { value: "tanah", label: "Tanah", icon: Map },
  { value: "villa", label: "Villa", icon: Palmtree },
  { value: "ruko", label: "Ruko", icon: Store },
  { value: "apartment", label: "Apartment", icon: Building },
  { value: "hotel", label: "Hotel", icon: Building },
  { value: "homestay", label: "Homestay", icon: Home },
  { value: "gudang", label: "Gudang", icon: Store },
];

const PURPOSE_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "Dijual", label: "Dijual" },
  { value: "Disewa", label: "Disewa" },
];

function apiPropertyToProperty(api: any): Property {
  return {
    id: api.id,
    listing_code: api.listing_code || "",
    title: api.title || "Properti",
    slug: api.slug || "",
    // Gunakan field 'price' jika ada, atau fallback ke price_offer/price_rent
    price: api.price || api.price_offer || api.price_rent || 0,
    old_price: api.old_price,
    purpose: api.purpose || "Dijual",
    type: api.property_type || "Rumah",
    location: api.location || `${api.district || ""}, ${api.city || ""}`,
    specs: {
      lt: api.land_area,
      lb: api.building_area,
      kt: api.bedrooms,
      km: api.bathrooms,
      lantai: api.floors,
    },
    images: api.image ? [api.image] : ["https://via.placeholder.com/400x300"],
    badges: {
      is_premium: api.is_premium || false,
      is_featured: api.is_featured || false,
      is_hot: api.is_hot || false,
      is_sold: api.is_sold || false,
      is_choice: api.is_choice || false,
    },
    legalitas: api.legal_status || "",
    status_legalitas: api.ownership_status || "On Hand",
    province: api.province || "",
    city: api.city || "",
    district: api.district || "",
    village: api.village || "",
    address: api.address || "",
    land_area: api.land_area || 0,
    building_area: api.building_area || 0,
    front_width: api.front_width || 0,
    floors: api.floors || 1,
    bedrooms: api.bedrooms || 0,
    bathrooms: api.bathrooms || 0,
    legal_status: api.legal_status || "SHM & IMB/PBG Lengkap",
    legal_details: api.legal_details || "",
    bank_name: api.bank_name || null,
    outstanding_amount: api.outstanding_amount || null,
    distance_to_river: api.distance_to_river || null,
    distance_to_grave: api.distance_to_grave || null,
    distance_to_powerline: api.distance_to_powerline || null,
    road_width: api.road_width || 0,
    description: api.description || "",
    facilities: api.facilities ? (typeof api.facilities === 'string' ? api.facilities.split(',').map((f: string) => f.trim()) : api.facilities) : [],
    selling_reason: api.selling_reason || "",
    google_maps_url: api.google_maps_url || "",
    video_url: api.video_url || null,
    views: api.views_count || 0,
  };
}

export default function Properties() {
  const [location] = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  // Get filters from URL path AND query parameters
  useEffect(() => {
    // Parse URL path: /properti/{purpose}/{type}
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p);
    const pathParams = parts.slice(1); // Skip 'properti'
    
    // Parse query parameters: /properti?purpose=dijual&type=kost&city=Sleman
    const searchParams = new URLSearchParams(window.location.search);
    
    // Priority: Query params > Path params
    
    // Handle purpose
    const queryPurpose = searchParams.get("purpose");
    if (queryPurpose) {
      const purposeMap: Record<string, string> = {
        "dijual": "Dijual",
        "disewa": "Disewa",
        "semua": ""
      };
      setSelectedPurpose(purposeMap[queryPurpose.toLowerCase()] || "");
    } else if (pathParams.length >= 1) {
      const param = pathParams[0].toLowerCase();
      const purposes = ['dijual', 'disewa'];
      if (purposes.includes(param)) {
        setSelectedPurpose(param === 'dijual' ? 'Dijual' : 'Disewa');
      } else {
        setSelectedType(param);
      }
    }
    
    // Handle type from query params
    const queryType = searchParams.get("type");
    if (queryType) {
      setSelectedType(queryType.toLowerCase());
    } else if (pathParams.length === 2) {
      setSelectedType(pathParams[1].toLowerCase());
    }
    
    // Handle city from query params
    const queryCity = searchParams.get("city");
    if (queryCity) {
      setSelectedCity(queryCity);
    }
  }, [location]);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const result = await propertiesApi.getAll({ limit: 1000 });
        if (result.success && result.data) {
          setProperties(result.data.map(apiPropertyToProperty));
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter properties
  const filtered = properties.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.listing_code.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());

    const matchType =
      !selectedType ||
      p.type.toLowerCase() === selectedType.toLowerCase();

    const matchPurpose =
      !selectedPurpose || p.purpose === selectedPurpose;

    const matchCity =
      !selectedCity ||
      p.city.toLowerCase().includes(selectedCity.toLowerCase());

    return matchSearch && matchType && matchPurpose && matchCity && !p.badges.is_sold;
  });

  const displayedProperties = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Header */}
        <div className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">
              {selectedType
                ? `Properti ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`
                : "Semua Properti"}
            </h1>
            <p className="text-white/80">
              Temukan properti impian Anda di Salam Bumi Property
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Cari properti..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Purpose Filter */}
              <div className="relative">
                <select
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {PURPOSE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Type Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {PROPERTY_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive =
                  selectedType.toLowerCase() === type.value.toLowerCase();
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-500">
              Menampilkan {displayedProperties.length} dari {filtered.length}{" "}
              properti
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="ml-3 text-gray-500">Memuat properti...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Home className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tidak Ada Properti Ditemukan
              </h3>
              <p className="text-gray-500 mb-4">
                Coba ubah filter atau kata kunci pencarian Anda
              </p>
              <Button
                onClick={() => {
                  setSearch("");
                  setSelectedType("");
                  setSelectedPurpose("");
                }}
                variant="outline"
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    variant="outline"
                    className="px-8"
                  >
                    Muat Lebih Banyak ({filtered.length - visibleCount} lagi)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; 2026 Salam Bumi Property. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
