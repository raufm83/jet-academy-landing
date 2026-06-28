import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  trailingSlash: false,
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "@nextui-org/react",
      "react-icons",
      "date-fns",
      "swiper",
      "framer-motion",
      "yet-another-react-lightbox",
    ],
    staleTimes: {
      dynamic: 0,
      static: 600,
    },
    optimizeCss: true,
  },
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Development optimizations
    if (dev) {
      // Enable fast refresh
      config.optimization.moduleIds = "named";

      // Optimize development builds
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;
    }

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 25,
        cacheGroups: {
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: "framework",
            priority: 50,
            chunks: "all",
            enforce: true,
          },
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: "framer-motion",
            priority: 40,
            chunks: "async",
            reuseExistingChunk: true,
          },
          nextui: {
            test: /[\\/]node_modules[\\/]@nextui-org[\\/]/,
            name: "nextui",
            priority: 40,
            chunks: "async",
            reuseExistingChunk: true,
          },
          swiper: {
            test: /[\\/]node_modules[\\/]swiper[\\/]/,
            name: "swiper",
            priority: 35,
            chunks: "async",
            reuseExistingChunk: true,
          },
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Optimize module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000,
    deviceSizes: [320, 400, 560, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "place-hold.it",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.jetacademy.az",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "api.jetacademy.az",
        port: "",
        pathname: "/**",
      },
       {
        protocol: "https",
        hostname: "api.new.jetacademy.az",
        port: "",
        pathname: "/**",
      },
       {
        protocol: "http",
        hostname: "api.new.jetacademy.az",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*\\.(webp|png|jpg|jpeg|svg|ico|woff2|woff|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "https://api.jetacademy.az").replace(/\/api\/?$/, "");
    return [
      { source: "/sitemap.xml", destination: "/api/sitemap" },
      { source: "/uploads/:path*", destination: `${apiOrigin}/uploads/:path*` },
    ];
  },
};

export default withNextIntl(nextConfig);
