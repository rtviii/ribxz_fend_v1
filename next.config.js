/** @type {import('next').NextConfig} */
const nextConfig = {
    // typescript: {
    //     ignoreBuildErrors: true
    // },
    // output: 'export',
    swcMinify: false,
    // reactStrictMode:false
    // typescript:{
    //   ignoreBuildErrors:true
    // }
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                hostname: '*'
            }
        ]
    },
    eslint: {
        ignoreDuringBuilds: true
    },
    experimental: {
        missingSuspenseWithCSRBailout: false
    }
};

module.exports = nextConfig;
