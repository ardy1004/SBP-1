import { Link } from "wouter";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0B152A] text-white pt-20 pb-10 border-t-4 border-secondary">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary font-bold text-2xl">
                  SB
                </div>
                <div>
                  SALAM BUMI
                  <span className="block text-sm font-medium text-secondary tracking-widest uppercase mt-[-2px]">
                    Property
                  </span>
                </div>
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
              Agen properti terpercaya di Yogyakarta. Membantu Anda menemukan rumah, kost, tanah, dan properti komersial idaman dengan legalitas aman terjamin.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <p>CV Salam Bumi Property<br/>Jl Pajajaran, Catur Tunggal<br/>Depok, Sleman, DI Yogyakarta</p>
              </div>
              <a href="https://wa.me/6281391278889" className="flex items-center gap-3 text-gray-300 hover:text-secondary transition-colors w-max">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <span>0813-9127-8889</span>
              </a>
              <a href="mailto:info@salambumi.xyz" className="flex items-center gap-3 text-gray-300 hover:text-secondary transition-colors w-max">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <span>info@salambumi.xyz</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 border-b border-white/10 pb-3 inline-block">Jenis Properti</h4>
            <ul className="space-y-3">
              {['Rumah', 'Kost', 'Tanah', 'Villa', 'Ruko', 'Apartment'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-secondary transition-colors text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary/50"></span>
                    {item} Dijual
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 border-b border-white/10 pb-3 inline-block">Lokasi Populer</h4>
            <ul className="space-y-3">
              {['Sleman', 'Bantul', 'Yogyakarta Kota', 'Seturan', 'Gejayan', 'Kaliurang', 'Malioboro'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-secondary transition-colors text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary/50"></span>
                    Properti di {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 border-b border-white/10 pb-3 inline-block">Investasi</h4>
            <ul className="space-y-3 mb-8">
              <li>
                <Link href="#" className="text-gray-400 hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary/50"></span>
                  Kost Dijual UGM
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary/50"></span>
                  Properti Dekat Kampus
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary/50"></span>
                  Kost Investasi
                </Link>
              </li>
            </ul>

            <h4 className="font-bold text-lg mb-4">Ikuti Kami</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Salam Bumi Property. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
