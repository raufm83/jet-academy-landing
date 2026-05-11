import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  trailingSlash: true,
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "@nextui-org/react",
      "react-icons",
      "react-icons/hi2",
      "react-icons/hi",
      "react-icons/fa6",
      "react-icons/md",
    ],
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
        maxInitialRequests: 30,
        cacheGroups: {
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
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
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
