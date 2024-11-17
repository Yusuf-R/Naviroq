/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [{
            source: '/',
            destination: '/home',
            permanent: true,
        }, ];
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

};

export default nextConfig;