"use client";

import * as React from "react";

// Define the breakpoint for when the mobile navigation (hamburger menu) should appear.
// Screens smaller than this breakpoint will show the mobile nav.
// Screens equal to or larger than this breakpoint will show the desktop nav.
const MOBILE_BREAKPOINT = 480; // Changed from 640 to 480

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}