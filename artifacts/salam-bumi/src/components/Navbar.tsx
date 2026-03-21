import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/gallery", label: "Portofolio Gallery" },
  { href: "/notaris", label: "Notaris" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
            : "bg-white py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-secondary font-bold text-xl transition-transform group-hover:scale-105">
                SB
              </div>
              <span className="font-extrabold text-xl tracking-tight text-primary">
                SALAM BUMI
                <span className="block text-xs font-semibold text-secondary tracking-widest uppercase mt-[-4px]">
                  Property
                </span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-secondary",
                    location === link.href ? "text-primary font-semibold" : "text-gray-600"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <Button
                asChild
                className="hidden md:flex bg-secondary hover:bg-secondary/90 text-primary font-bold px-6 shadow-md shadow-secondary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <a href="https://wa.me/6281391278889" target="_blank" rel="noreferrer">
                  <Phone className="w-4 h-4 mr-2" />
                  Hubungi Kami
                </a>
              </Button>
              
              <button
                className="lg:hidden p-2 text-gray-600 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl animate-in slide-in-from-right flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-lg text-primary">Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-primary bg-gray-50 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    location === link.href 
                      ? "bg-primary/5 text-primary" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="p-5 border-t border-gray-100">
              <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-primary font-bold">
                <a href="https://wa.me/6281391278889" target="_blank" rel="noreferrer">
                  <Phone className="w-4 h-4 mr-2" />
                  0813-9127-8889
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
