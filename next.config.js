/** @type {import('next').NextConfig} */
const nextConfig = {

  // output: 'export',
  swcMinify: false,
  // reactStrictMode:false
  images: { unoptimized: true },
  eslint:{
    ignoreDuringBuilds:true
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // typescript:{
  //   ignoreBuildErrors:true
  // }
}

module.exports = nextConfig
