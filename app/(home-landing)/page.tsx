"use client";
import { cn } from "@/lib/utils";
import { FeaturesSection } from "./_components/Feature";
import { FeaturesGradient } from "./_components/FeaturesGradient";
import Link from "next/link";
import Navbar from "./_components/Navbar";

export default function HomeLandingPage() {
  return (
    <div className="flex flex-col min-h-screen gap-4 selection:bg-primary selection:text-white dark:bg-black">
      <Navbar />
      <div className="flex flex-col md:flex-row items-center justify-around gap-4 py-10 scroll-mt-[80px] p-12 md:p-10 border rounded-md m-12 md:h-[550px] shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <img className="h-40 md:h-72" src="/logo.png" alt="" />
          <p className="font-bold text-3xl md:text-5xl">ScrapeBun</p>
        </div>
        <div className="flex-1 max-w-lg w-full">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shadow-sm">
            {/* Node Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-pink-400" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Launch Browser
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-600 font-medium">
                  Entry Point
                </span>
              </div>
            </div>

            {/* Node Body */}
            <div className="p-4 flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium">
                  Website URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://www.example.com"
                  className="mt-2 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  e.g. https://www.google.com
                </p>
              </div>

              {/* Output Type */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Output</span>
                <span className="px-2 py-1 rounded-md border border-neutral-300 dark:border-neutral-700">
                  Web Page
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between mt-2 gap-2">
            <p className="text-xs font-bold">
              This looks fun? Let&apos;s get started.
            </p>
            <Link href="/home">
              <button className="p-1.5 bg-primary rounded-md text-xs hover:bg-primary/50 hover:scale-105 transition-all duration-300 w-full md:w-auto">
                Start Scraping
              </button>
            </Link>
          </div>
        </div>
      </div>

      <SectionWrapper
        id="howItWorks"
        primaryTitle="How"
        secondaryTitle="It Works"
      >
        <FeaturesGradient />
      </SectionWrapper>
      <SectionWrapper
        id="scrapingFeatures"
        primaryTitle="Scraping"
        secondaryTitle="Features"
      >
        <FeaturesSection />
      </SectionWrapper>
    </div>
  );
}

function SectionWrapper({
  children,
  className,
  id,
  primaryTitle,
  secondaryTitle,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  primaryTitle?: string;
  secondaryTitle?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-10 box-border max-w-screen-xl mx-auto scroll-mt-[80px] p-5 md:p-10",
        className
      )}
      id={id}
    >
      <div className="text-2xl md:text-4xl lg:text-6xl text-foreground">
        <span className="text-primary">{primaryTitle}</span>{" "}
        <span className="">{secondaryTitle}</span>
      </div>
      {children}
    </section>
  );
}
