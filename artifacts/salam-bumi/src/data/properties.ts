export interface PropertyBadge {
  is_premium: boolean;
  is_featured: boolean;
  is_hot: boolean;
  is_sold: boolean;
  is_choice: boolean;
}

export interface PropertySpecs {
  lt?: number; // Luas Tanah (m2)
  lb?: number; // Luas Bangunan (m2)
  kt?: number; // Kamar Tidur
  km?: number; // Kamar Mandi
  lantai?: number; // Jumlah Lantai
}

export interface Property {
  id: string;
  listing_code: string;
  title: string;
  slug: string;
  price: number;
  old_price?: number;
  purpose: "Dijual" | "Disewa" | "Dijual & Disewa";
  type: "Rumah" | "Kost" | "Tanah" | "Villa" | "Ruko" | "Apartment";
  location: string;
  specs: PropertySpecs;
  images: string[];
  badges: PropertyBadge;
  legalitas: string;
  status_legalitas: "On Hand" | "On Bank";
  province: string;
  city: string;
  district: string;
  village: string;
  address: string;
  land_area: number;
  building_area: number;
  front_width: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  legal_status: "SHM & IMB/PBG Lengkap" | "SHM Pekarangan Tanpa IMB" | "SHM Sawah/Tegalan" | "SHGB & IMB/PBG Lengkap" | "Girik/Letter C/PPJB";
  legal_details: string;
  bank_name: string | null;
  outstanding_amount: number | null;
  distance_to_river: number | null;
  distance_to_grave: number | null;
  distance_to_powerline: number | null;
  road_width: number;
  description: string;
  facilities: string[];
  selling_reason: string;
  google_maps_url: string;
  video_url: string | null;
  kost_type?: "Putra" | "Putri" | "Campur";
  views?: number;
  leads?: number;
}

const DEFAULT_IMAGE = "https://images.salambumi.xyz/kost%20dijual%20jogja.webp";

// Unique placeholder images per property type (picsum.photos — always available)
const IMAGES: Record<string, string[]> = {
  Rumah: [
    "https://picsum.photos/seed/rumah1/800/600",
    "https://picsum.photos/seed/rumah2/800/600",
    "https://picsum.photos/seed/rumah3/800/600",
  ],
  Kost: [
    "https://picsum.photos/seed/kost1/800/600",
    "https://picsum.photos/seed/kost2/800/600",
  ],
  Tanah: [
    "https://picsum.photos/seed/tanah1/800/600",
  ],
  Villa: [
    "https://picsum.photos/seed/villa1/800/600",
    "https://picsum.photos/seed/villa2/800/600",
    "https://picsum.photos/seed/villa3/800/600",
  ],
  Ruko: [
    "https://picsum.photos/seed/ruko1/800/600",
    "https://picsum.photos/seed/ruko2/800/600",
  ],
  Apartment: [
    "https://picsum.photos/seed/apt1/800/600",
  ],
};

const baseProperty = {
  province: "DI Yogyakarta",
  city: "Sleman",
  district: "Depok",
  village: "Caturtunggal",
  address: "Jl. Gejayan No.123",
  land_area: 0,
  building_area: 0,
  front_width: 10,
  floors: 1,
  bedrooms: 0,
  bathrooms: 0,
  legal_status: "SHM & IMB/PBG Lengkap" as const,
  legal_details: "Sertifikat Hak Milik atas nama pemilik langsung, IMB/PBG lengkap dan sesuai dengan kondisi bangunan saat ini.",
  bank_name: null,
  outstanding_amount: null,
  distance_to_river: null,
  distance_to_grave: null,
  distance_to_powerline: null,
  road_width: 6,
  description: "Properti luar biasa di lokasi yang sangat strategis. Akses mudah ke berbagai fasilitas umum seperti kampus, rumah sakit, pusat perbelanjaan, dan jalan utama.\n\nBangunan dirancang dengan spesifikasi material berkualitas tinggi, memastikan kenyamanan dan durabilitas untuk jangka panjang. Lingkungan aman dan nyaman, cocok untuk investasi maupun tempat tinggal keluarga.\n\nJangan lewatkan kesempatan untuk memiliki properti bernilai tinggi ini. Hubungi kami segera untuk informasi lebih lanjut dan jadwalkan kunjungan lokasi.",
  facilities: ["Carport", "Garden", "PAM", "Listrik 2200W"],
  selling_reason: "Pindah luar kota",
  google_maps_url: "https://maps.google.com/?q=-7.7567,110.3655",
  video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  views: 0,
  leads: 0,
};

export const mockProperties: Property[] = [
  {
    ...baseProperty,
    id: "1",
    listing_code: "SLM-001",
    title: "Rumah Mewah Hook Tropis Dekat UGM & Hartono Mall",
    slug: "rumah-mewah-hook-tropis",
    price: 3500000000,
    purpose: "Dijual",
    type: "Rumah",
    location: "Depok, Sleman, DI Yogyakarta",
    specs: { lt: 200, lb: 180, kt: 4, km: 3, lantai: 2 },
    images: [...IMAGES.Rumah],
    badges: { is_premium: true, is_featured: true, is_hot: false, is_sold: false, is_choice: true },
    legalitas: "SHM, IMB",
    status_legalitas: "On Hand",
    land_area: 200,
    building_area: 180,
    bedrooms: 4,
    bathrooms: 3,
    floors: 2,
    facilities: ["Carport 2 Mobil", "Garden", "PAM", "Listrik 3500W", "AC", "Water Heater"],
    views: 342,
    leads: 18,
  },
  {
    ...baseProperty,
    id: "2",
    listing_code: "KST-012",
    title: "Kost Eksklusif 15 Kamar Full Furnished Seturan",
    slug: "kost-eksklusif-15-kamar",
    price: 4200000000,
    old_price: 4500000000,
    purpose: "Dijual",
    type: "Kost",
    location: "Depok, Sleman, DI Yogyakarta",
    specs: { lt: 250, lb: 400, kt: 15, km: 15, lantai: 3 },
    images: [...IMAGES.Kost],
    badges: { is_premium: true, is_featured: false, is_hot: true, is_sold: false, is_choice: true },
    legalitas: "SHM, IMB",
    status_legalitas: "On Bank",
    land_area: 250,
    building_area: 400,
    bedrooms: 15,
    bathrooms: 15,
    floors: 3,
    bank_name: "BCA",
    outstanding_amount: 1500000000,
    facilities: ["Full Furnished", "WiFi", "CCTV", "Parkir Luas", "Penjaga Kost", "Pemanas Air"],
    kost_type: "Campur",
    views: 567,
    leads: 32,
  },
  {
    ...baseProperty,
    id: "3",
    listing_code: "TNH-088",
    title: "Tanah Kavling Strategis View Sawah Jakal Km 9",
    slug: "tanah-kavling-strategis",
    price: 950000000,
    purpose: "Dijual",
    type: "Tanah",
    location: "Ngaglik, Sleman, DI Yogyakarta",
    specs: { lt: 150 },
    images: [...IMAGES.Tanah],
    badges: { is_premium: false, is_featured: false, is_hot: false, is_sold: true, is_choice: false },
    legalitas: "SHM Pekarangan",
    status_legalitas: "On Hand",
    land_area: 150,
    building_area: 0,
    bedrooms: 0,
    bathrooms: 0,
    floors: 0,
    legal_status: "SHM Pekarangan Tanpa IMB",
    distance_to_river: 50,
    distance_to_powerline: 200,
    facilities: ["Akses Jalan Mobil", "Dekat Fasum", "View Sawah", "Pagar Keliling"],
    views: 128,
    leads: 7,
  },
  {
    ...baseProperty,
    id: "4",
    listing_code: "VIL-045",
    title: "Villa Private Pool Nuansa Ubud di Pinggiran Jogja",
    slug: "villa-private-pool",
    price: 2800000000,
    purpose: "Dijual & Disewa",
    type: "Villa",
    location: "Pakem, Sleman, DI Yogyakarta",
    specs: { lt: 300, lb: 200, kt: 3, km: 3, lantai: 1 },
    images: [...IMAGES.Villa],
    badges: { is_premium: true, is_featured: true, is_hot: false, is_sold: false, is_choice: true },
    legalitas: "SHM, IMB",
    status_legalitas: "On Hand",
    land_area: 300,
    building_area: 200,
    bedrooms: 3,
    bathrooms: 3,
    floors: 1,
    facilities: ["Private Pool", "Fully Furnished", "Gazebo", "Garden", "WiFi", "Smart TV"],
    distance_to_river: 8,
    views: 891,
    leads: 45,
  },
  {
    ...baseProperty,
    id: "5",
    listing_code: "RUK-011",
    title: "Ruko 2 Lantai Pinggir Jalan Utama Gejayan",
    slug: "ruko-2-lantai-gejayan",
    price: 150000000,
    purpose: "Disewa",
    type: "Ruko",
    location: "Depok, Sleman, DI Yogyakarta",
    specs: { lt: 100, lb: 180, km: 2, lantai: 2 },
    images: [...IMAGES.Ruko],
    badges: { is_premium: false, is_featured: false, is_hot: true, is_sold: false, is_choice: false },
    legalitas: "SHM, IMB",
    status_legalitas: "On Hand",
    land_area: 100,
    building_area: 180,
    bedrooms: 0,
    bathrooms: 2,
    floors: 2,
    facilities: ["Listrik 5500W", "Parkir 4 Mobil", "Kamar Mandi 2", "Air Sumur"],
    road_width: 10,
    views: 203,
    leads: 11,
  },
  {
    ...baseProperty,
    id: "6",
    listing_code: "APT-009",
    title: "Apartment Studio Mewah Malioboro City Full Furnished",
    slug: "apartment-studio-malioboro",
    price: 650000000,
    old_price: 700000000,
    purpose: "Dijual",
    type: "Apartment",
    location: "Depok, Sleman, DI Yogyakarta",
    specs: { lb: 24, kt: 1, km: 1, lantai: 8 },
    images: [...IMAGES.Apartment],
    badges: { is_premium: false, is_featured: true, is_hot: true, is_sold: false, is_choice: true },
    legalitas: "Strata Title",
    status_legalitas: "On Bank",
    land_area: 0,
    building_area: 24,
    bedrooms: 1,
    bathrooms: 1,
    floors: 8,
    bank_name: "Mandiri",
    outstanding_amount: 200000000,
    facilities: ["Kolam Renang", "Gym", "Security 24 Jam", "Access Card", "Full Furnished"],
    video_url: null,
    views: 445,
    leads: 22,
  },
  {
    ...baseProperty,
    id: "7",
    listing_code: "RMH-102",
    title: "Rumah Minimalis Modern Dalam Cluster Palagan",
    slug: "rumah-minimalis-palagan",
    price: 1250000000,
    purpose: "Dijual",
    type: "Rumah",
    location: "Ngaglik, Sleman, DI Yogyakarta",
    specs: { lt: 110, lb: 90, kt: 3, km: 2, lantai: 1 },
    images: [IMAGES.Rumah[1], IMAGES.Rumah[2]],
    badges: { is_premium: false, is_featured: false, is_hot: false, is_sold: false, is_choice: false },
    legalitas: "SHM, IMB",
    status_legalitas: "On Hand",
    land_area: 110,
    building_area: 90,
    bedrooms: 3,
    bathrooms: 2,
    floors: 1,
    facilities: ["One Gate System", "Security 24/7", "Taman Bermain", "Carport"],
    views: 156,
    leads: 8,
  },
  {
    ...baseProperty,
    id: "8",
    listing_code: "KST-044",
    title: "Kost Putri Eksklusif Dekat UPN & YKPN",
    slug: "kost-putri-upn",
    price: 2100000000,
    purpose: "Dijual",
    type: "Kost",
    location: "Depok, Sleman, DI Yogyakarta",
    specs: { lt: 150, lb: 280, kt: 10, km: 10, lantai: 2 },
    images: [IMAGES.Kost[1], IMAGES.Kost[0]],
    badges: { is_premium: false, is_featured: true, is_hot: false, is_sold: false, is_choice: true },
    legalitas: "SHM, IMB",
    status_legalitas: "On Hand",
    land_area: 150,
    building_area: 280,
    bedrooms: 10,
    bathrooms: 10,
    floors: 2,
    kost_type: "Putri",
    facilities: ["Kamar Mandi Dalam", "AC", "WiFi", "Dapur Bersama", "Ruang Santai"],
    views: 289,
    leads: 15,
  },
  {
    ...baseProperty,
    id: "9",
    listing_code: "TNH-115",
    title: "Tanah Luas Cocok Untuk Perumahan di Bantul",
    slug: "tanah-luas-perumahan",
    price: 4500000000,
    purpose: "Dijual",
    type: "Tanah",
    location: "Kasihan, Bantul, DI Yogyakarta",
    specs: { lt: 1500 },
    images: [IMAGES.Tanah[0]],
    badges: { is_premium: true, is_featured: false, is_hot: false, is_sold: false, is_choice: false },
    legalitas: "SHM Pekarangan",
    status_legalitas: "On Bank",
    land_area: 1500,
    building_area: 0,
    bedrooms: 0,
    bathrooms: 0,
    floors: 0,
    legal_status: "SHM Sawah/Tegalan",
    bank_name: "BRI",
    outstanding_amount: 1000000000,
    distance_to_grave: 45,
    facilities: ["Akses Jalan Lebar", "Bentuk Kotak", "Tanah Datar", "Saluran Air"],
    views: 95,
    leads: 4,
  },
  {
    ...baseProperty,
    id: "10",
    listing_code: "RMH-055",
    title: "Rumah Etnik Jawa Klasik Dengan Pendopo",
    slug: "rumah-etnik-jawa",
    price: 5200000000,
    old_price: 5500000000,
    purpose: "Dijual",
    type: "Rumah",
    location: "Mantrijeron, Bantul, DI Yogyakarta",
    specs: { lt: 500, lb: 350, kt: 5, km: 4, lantai: 1 },
    images: [...IMAGES.Rumah],
    badges: { is_premium: true, is_featured: true, is_hot: true, is_sold: false, is_choice: true },
    legalitas: "SHM, IMB",
    status_legalitas: "On Hand",
    land_area: 500,
    building_area: 350,
    bedrooms: 5,
    bathrooms: 4,
    floors: 1,
    facilities: ["Pendopo", "Taman Luas", "Garasi 3 Mobil", "Kayu Jati Asli"],
    views: 678,
    leads: 28,
  },
  {
    ...baseProperty,
    id: "11",
    listing_code: "VIL-022",
    title: "Villa Pemandangan Pantai Selatan Gunung Kidul",
    slug: "villa-pantai-selatan",
    price: 3100000000,
    purpose: "Dijual",
    type: "Villa",
    location: "Tepus, Gunung Kidul, DI Yogyakarta",
    specs: { lt: 400, lb: 250, kt: 4, km: 4, lantai: 2 },
    images: [IMAGES.Villa[0], IMAGES.Villa[2]],
    badges: { is_premium: true, is_featured: false, is_hot: false, is_sold: true, is_choice: false },
    legalitas: "SHM, IMB",
    status_legalitas: "On Hand",
    land_area: 400,
    building_area: 250,
    bedrooms: 4,
    bathrooms: 4,
    floors: 2,
    facilities: ["Ocean View", "Infinity Pool", "Balkon", "Smart Home System"],
    views: 412,
    leads: 19,
  },
  {
    ...baseProperty,
    id: "12",
    listing_code: "RUK-019",
    title: "Ruko Usaha Makanan Dekat Kampus UNY",
    slug: "ruko-usaha-makanan",
    price: 1800000000,
    purpose: "Dijual",
    type: "Ruko",
    location: "Depok, Sleman, DI Yogyakarta",
    specs: { lt: 80, lb: 150, km: 2, lantai: 2 },
    images: [IMAGES.Ruko[1], IMAGES.Ruko[0]],
    badges: { is_premium: false, is_featured: false, is_hot: false, is_sold: false, is_choice: false },
    legalitas: "SHM, IMB",
    status_legalitas: "On Hand",
    land_area: 80,
    building_area: 150,
    bedrooms: 0,
    bathrooms: 2,
    floors: 2,
    facilities: ["Rolling Door", "Parkir Motor", "Ex Rumah Makan", "Listrik 4400W"],
    views: 167,
    leads: 9,
  }
];
