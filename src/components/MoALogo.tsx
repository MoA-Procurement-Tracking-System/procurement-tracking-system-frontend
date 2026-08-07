import React from "react";

interface MoALogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const MoALogo: React.FC<MoALogoProps> = ({
  size = "md",
  showText = true,
}) => {
  const dimensions = {
    sm: { circle: 56, title: "text-xs", subtitle: "text-[9px]" },
    md: {
      circle: 92,
      title: "text-base font-extrabold",
      subtitle: "text-[11px] font-semibold",
    },
    lg: {
      circle: 120,
      title: "text-xl font-black",
      subtitle: "text-xs font-bold",
    },
  }[size];

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Circular Emblem matching uploaded image */}
      <div
        className="relative flex items-center justify-center bg-white"
        style={{ width: dimensions.circle, height: dimensions.circle }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="moaLogoCircle">
              <circle cx="100" cy="100" r="96" />
            </clipPath>
          </defs>

          {/* White Background Circle */}
          <circle cx="100" cy="100" r="96" fill="#FFFFFF" />

          {/* Masked emblem contents */}
          <g clipPath="url(#moaLogoCircle)">
            {/* --- TOP SECTION: Yellow Horizontal Stripes (Sun) --- */}
            <rect x="0" y="16" width="200" height="9" fill="#F3B229" />
            <rect x="0" y="28" width="200" height="9" fill="#F3B229" />
            <rect x="0" y="40" width="200" height="9" fill="#F3B229" />
            <rect x="0" y="52" width="200" height="9" fill="#F3B229" />
            <rect x="0" y="64" width="200" height="9" fill="#F3B229" />

            {/* --- MIDDLE SECTION: Green Slanted Terraced Field Stripes --- */}
            <polygon points="0,74 200,48 200,59 0,85" fill="#0A8B42" />
            <polygon points="0,89 200,63 200,74 0,100" fill="#0A8B42" />
            <polygon points="0,104 200,78 200,89 0,115" fill="#0A8B42" />
            <polygon points="0,119 200,93 200,104 0,130" fill="#0A8B42" />

            {/* --- BOTTOM SECTION: Blue Horizontal Water Wave Stripes --- */}
            <rect x="0" y="126" width="200" height="9" fill="#135D9D" />
            <rect x="0" y="138" width="200" height="9" fill="#135D9D" />
            <rect x="0" y="150" width="200" height="9" fill="#135D9D" />
            <rect x="0" y="162" width="200" height="9" fill="#135D9D" />
            <rect x="0" y="174" width="200" height="9" fill="#135D9D" />
            <rect x="0" y="186" width="200" height="9" fill="#135D9D" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="mt-3 flex flex-col items-center">
          <span
            className={`text-slate-900 tracking-tight font-extrabold ${dimensions.title}`}
          >
            ግብርና ሚኒስቴር
          </span>
          <span
            className={`text-slate-900 font-serif font-semibold tracking-[0.2em] uppercase mt-1 ${dimensions.subtitle}`}
          >
            MINISTRY{" "}
            <span className="text-[0.75em] tracking-normal font-sans font-normal">
              OF
            </span>{" "}
            AGRICULTURE
          </span>
        </div>
      )}
    </div>
  );
};
