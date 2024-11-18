/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{
      source: '/',
      destination: '/home',
      permanent: true,
    },];
  },


  experimental: {
    forceSwcTransforms: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // enable cors
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value:
              process.env.NODE_ENV === 'production'
                ? 'https://naviroq.vercel.app'
                : '*',
          },
        
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS' },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Authorization, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  crossOrigin: 'anonymous',
  

};

export default nextConfig;