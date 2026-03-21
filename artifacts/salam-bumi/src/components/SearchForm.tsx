import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/button";

export function SearchForm() {
  const [purpose, setPurpose] = useState<"Dijual" | "Disewa" | "Dijual & Disewa">("Dijual");

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-6xl mx-auto border border-gray-100">
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
        {(["Dijual", "Disewa", "Dijual & Disewa"] as const).map((tab) => (
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

      {/* Grid Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        
        {/* Jenis Properti */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 px-1">Jenis Properti</label>
          <select className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer">
            <option value="">Semua Tipe</option>
            <option value="Rumah">Rumah</option>
            <option value="Kost">Kost</option>
            <option value="Tanah">Tanah</option>
            <option value="Villa">Villa</option>
            <option value="Ruko">Ruko</option>
            <option value="Apartment">Apartment</option>
            <option value="Hotel">Hotel</option>
            <option value="Homestay">Homestay</option>
          </select>
        </div>

        {/* Harga */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 px-1">Rentang Harga</label>
          <select className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer">
            <option value="">Semua Harga</option>
            <option value="<1M">Dibawah 1M</option>
            <option value="1M-2M">1M - 2M</option>
            <option value="2M-3M">2M - 3M</option>
            <option value="3M-4M">3M - 4M</option>
            <option value=">10M">Diatas 10M</option>
          </select>
        </div>

        {/* Provinsi */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 px-1">Provinsi</label>
          <select className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer">
            <option value="DIY">DI. Yogyakarta</option>
          </select>
        </div>

        {/* Kab/Kota */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 px-1">Kab. / Kota</label>
          <select className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer">
            <option value="">Semua Kota</option>
            <option value="Sleman">Kab. Sleman</option>
            <option value="Bantul">Kab. Bantul</option>
            <option value="Yogyakarta">Yogyakarta Kota</option>
            <option value="GunungKidul">Kab. Gunung Kidul</option>
            <option value="KulonProgo">Kab. Kulon Progo</option>
          </select>
        </div>

        {/* Kecamatan */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 px-1">Kecamatan</label>
          <select className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer">
            <option value="">Semua Kecamatan</option>
            <option value="Depok">Depok</option>
            <option value="Ngaglik">Ngaglik</option>
            <option value="Mlati">Mlati</option>
            <option value="Gamping">Gamping</option>
          </select>
        </div>

        {/* Kel/Desa */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 px-1">Kelurahan / Desa</label>
          <select className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer disabled:opacity-50">
            <option value="">Pilih Kecamatan Dulu</option>
          </select>
        </div>

      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button className="text-primary font-semibold flex items-center gap-2 hover:text-secondary transition-colors py-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filter Lanjutan
        </button>
        <Button className="w-full sm:w-auto min-w-[200px] h-12 bg-secondary hover:bg-secondary/90 text-primary font-bold text-base rounded-xl shadow-lg shadow-secondary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <Search className="w-5 h-5 mr-2" />
          Cari Properti
        </Button>
      </div>

    </div>
  );
}
