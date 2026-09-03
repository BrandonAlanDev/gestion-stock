"use client";

import dynamic from "next/dynamic";

const ChartsWrapper = dynamic(() => import("./ChartsWrapper"), {
  ssr: false,
});

export default ChartsWrapper;