"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { headerRoutes } from "@/lib/data";
import { ModeToggle } from "@/components/ThemeToggle";

const Navbar: React.FC = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollIntoView = (href: string) => {
    const element = document.getElementById(href.substring(1));
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHomeClick = () => {
    router.push("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ------------------ MOBILE NAV ------------------ */
  if (isMobile) {
    return (
      <div className="sticky top-0 z-50 px-4 py-4 bg-background/80 backdrop-blur-md">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="Logo"
            className="h-8 cursor-pointer dark:brightness-0 dark:invert"
            onClick={handleHomeClick}
          />

          {/* Hamburger */}
          <MenuIcon
            className="h-7 w-7 cursor-pointer text-foreground"
            onClick={() => setIsMobileOpen(true)}
          />
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <aside className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-6">
            <div className="flex justify-end">
              <XIcon
                className="h-7 w-7 cursor-pointer text-foreground"
                onClick={() => setIsMobileOpen(false)}
              />
            </div>

            <div className="mt-24 flex flex-col items-center gap-6 text-center">
              {headerRoutes.map((route) =>
                route.button ? (
                  <Button
                    key={route.href}
                    onClick={() => {
                      router.push(route.href);
                      setIsMobileOpen(false);
                    }}
                  >
                    {route.title}
                  </Button>
                ) : (
                  <span
                    key={route.href}
                    className="text-lg font-light cursor-pointer hover:opacity-80 text-foreground"
                    onClick={() => {
                      scrollIntoView(route.href);
                      setIsMobileOpen(false);
                    }}
                  >
                    {route.title}
                  </span>
                )
              )}

              <ModeToggle />
            </div>
          </aside>
        )}
      </div>
    );
  }

  /* ------------------ DESKTOP NAV ------------------ */
  const buttonRoute = headerRoutes.find((r) => r.button);
  const linkRoutes = headerRoutes.filter((r) => !r.button);

  return (
    <div className="flex justify-center w-full sticky top-0 z-50 px-4 py-4 mt-8 h-24">
      <div
        className={`flex justify-between items-center transition-all duration-200 ${
          isScrolled
            ? "w-[90vw] bg-white dark:bg-black border shadow-md rounded-lg"
            : "w-[90vw] rounded-lg bg-white dark:bg-black backdrop-blur-md "
        }`}
      >
        {/* Left: Logo */}
        <div className="px-6 flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Logo"
            className="object-contain cursor-pointer h-8 md:h-12"
            onClick={handleHomeClick}
          />
        </div>

        {/* Center: Links (no button) */}
        <nav className="flex items-center gap-6">
          {linkRoutes.map((route) => (
            <span
              key={route.href}
              className="text-sm cursor-pointer hover:opacity-80 text-foreground transition-opacity"
              onClick={() => scrollIntoView(route.href)}
            >
              {route.title}
            </span>
          ))}
        </nav>

        {/* Right: Get Started + Theme Toggle */}
        <div className="px-6 flex items-center gap-4">
          {buttonRoute && (
            <Link href={buttonRoute.href}>
              <Button>{buttonRoute.title}</Button>
            </Link>
          )}
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
