import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import Image from "next/image";

function Logo({
  fontSize = "2xl",
  iconSize = 20,
}: {
  fontSize?: string;
  iconSize?: number;
}) {
  return (
    <Link
      className={cn(
        "text-2xl font-extrabold flex items-center gap-2",
        fontSize
      )}
      href="/"
    >
      <Image
        src="/logo.png"
        alt="scrape-bun logo"
        width={iconSize * 2}
        height={iconSize * 2}
        className="object-contain"
      />
      <div>
        <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          scrape-bun
        </span>
      </div>
    </Link>
  );
}

export default Logo;
