import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images :{
    unoptimized:true, //resimlerin bozulmasını engeller
  },
};

export default nextConfig;