import { useState } from "react";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/button";

export function SearchForm() {
  const [, setLocation] = useLocation();
  const [purpose, setPurpose] = useState<string>("Dijual");
  const [propertyType, setPropertyType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [village, setVillage] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Districts by city
  const districtsByCity: Record<string, string[]> = {
    Sleman: ["Depok", "Ngaglik", "Mlati", "Gamping", "Ngemplak", "Kalasan", "Prambanan", "Berbah", "Cangkringan", "Tempel", "Turi", "Pakem", "Seyegan", "Godean", "Minggir"],
    Bantul: ["Bantul", "Banguntapan", "Sewon", "Kasihan", "Pajangan", "Pandak", "Piyungan", "Srandakan", "Sanden", "Kretek", "Dlingo", "Imogiri", "Pleret", "Pundong", "Jetis"],
    Yogyakarta: ["Gondokusuman", "Jetis", "Gondomanan", "Ngampilan", "Danurejan", "Kraton", "Mergangsan", "Umbulharjo", "Kotagede", "Tegalrejo", "Gedongtengen", "Mantrijeron", "Wirobrajan"],
    GunungKidul: ["Wonosari", "Playen", "Paliyan", "Panggang", "Semanu", "Karangmojo", "Ngawen", "Gedangsari", "Saptosari", "Tepus", "Rongkop", "Girisubo", "Tanjungsari", "Purwosari", "Ponjong"],
    KulonProgo: ["Wates", "Panjatan", "Galur", "Lendah", "Sentolo", "Pengasih", "Kokap", "Girimulyo", "Nanggulan", "Samigaluh", "Kalibawang", "Temon"],
  };

  // Villages by district (example for some districts)
  const villagesByDistrict: Record<string, string[]> = {
    Depok: ["Catur Tunggal", "Condongcatur", "Maguwoharjo", "Depok"],
    Ngaglik: ["Sinduharjo", "Sardonoharjo", "Minomartani", "Sariharjo", "Donoharjo"],
    Mlati: ["Sinduadi", "Sendangadi", "Tlogoadi", "Tirtoadi"],
  };

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (purpose) {
      // Map purpose to URL
      if (purpose === "Dijual") params.set("purpose", "dijual");
      else if (purpose === "Disewa") params.set("purpose", "disewa");
      else params.set("purpose", "semua");
    }
    
    if (propertyType) params.set("type", propertyType.toLowerCase());
    if (priceRange) params.set("price", priceRange);
    if (city) params.set("city", city);
    if (district) params.set("district", district);
    if (village) params.set("village", village);
    
    const queryString = params.toString();
    setLocation(`/properti${queryString ? `?${queryString}` : ""}`);
  };

  // Reset filters
  const handleReset = () => {
    setPurpose("Dijual");
    setPropertyType("");
    setPriceRange("");
    setCity("");
    setDistrict("");
    setVillage("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-6xl mx-auto border border-gray-100">
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
        {(["Dijual", "Disewa", "Semua"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setPurpose(tab)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              purpose === tab
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        
        {/* Jenis Properti */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 px-1">Jenis Properti</label>
          <select 
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer"
          >
            <option value="">Semua Tipe</option>
            <option value="rumah">Rumah</option>
            <option value="kost">Kost</option>
            <option value="tanah">Tanah</option>
            <option value="villa">Villa</option>
            <option value="ruko">Ruko</option>
            <option value="apartment">Apartment</option>
            <option value="hotel">Hotel</option>
            <option value="homestay">Homestay</option>
            <option value="gudang">Gudang</option>
            <option value="komersial">Komersial Lainnya</option>
          </select>
        </div>

        {/* Harga */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 px-1">Rentang Harga</label>
          <select 
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer"
          >
            <option value="">Semua Harga</option>
            <option value="0-1000000000">Dibawah 1M</option>
            <option value="1000000000-2000000000">1M - 2M</option>
            <option value="2000000000-3000000000">2M - 3M</option>
            <option value="3000000000-4000000000">3M - 4M</option>
            <option value="4000000000-5000000000">4M - 5M</option>
            <option value="5000000000-6000000000">5M - 6M</option>
            <option value="6000000000-7000000000">6M - 7M</option>
            <option value="7000000000-8000000000">7M - 8M</option>
            <option value="8000000000-9000000000">8M - 9M</option>
            <option value="9000000000-10000000000">9M - 10M</option>
            <option value="10000000000-99999999999">Diatas 10M</option>
          </select>
        </div>

        {/* Kab/Kota */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 px-1">Kab. / Kota</label>
          <select 
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setDistrict(""); // Reset district when city changes
              setVillage(""); // Reset village when city changes
            }}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer"
          >
            <option value="">Semua Kota</option>
            <option value="Sleman">Kab. Sleman</option>
            <option value="Bantul">Kab. Bantul</option>
            <option value="Yogyakarta">Yogyakarta Kota</option>
            <option value="GunungKidul">Kab. Gunung Kidul</option>
            <option value="KulonProgo">Kab. Kulon Progo</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-100">
          
          {/* Kecamatan */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 px-1">Kecamatan</label>
            <select 
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setVillage(""); // Reset village when district changes
              }}
              disabled={!city}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer disabled:opacity-50"
            >
              <option value="">{city ? "Semua Kecamatan" : "Pilih Kota Dulu"}</option>
              {city && districtsByCity[city]?.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Kel/Desa */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 px-1">Kelurahan / Desa</label>
            <select 
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              disabled={!district}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer disabled:opacity-50"
            >
              <option value="">{district ? "Semua Kelurahan" : "Pilih Kecamatan Dulu"}</option>
              {district && villagesByDistrict[district]?.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Provinsi (static) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 px-1">Provinsi</label>
            <div className="w-full bg-gray-100 border border-gray-200 text-gray-600 rounded-xl px-4 py-3">
              DI. Yogyakarta
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-primary font-semibold flex items-center gap-2 hover:text-secondary transition-colors py-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showAdvanced ? "Sembunyikan Filter" : "Filter Lanjutan"}
        </button>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            onClick={handleReset}
            variant="outline"
            className="w-full sm:w-auto h-12 rounded-xl"
          >
            Reset
          </Button>
          <Button 
            onClick={handleSearch}
            className="w-full sm:w-auto min-w-[200px] h-12 bg-secondary hover:bg-secondary/90 text-primary font-bold text-base rounded-xl shadow-lg shadow-secondary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Search className="w-5 h-5 mr-2" />
            Cari Properti
          </Button>
        </div>
      </div>
    </div>
  );
}
