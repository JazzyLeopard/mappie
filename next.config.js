/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    reactStrictMode: true,
    swcMinify: true,
    images: {
        remotePatterns: [{ hostname: 'img.clerk.com' }],
    },
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
    pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
    webpack: (config, { dev, isServer }) => {
        // Production optimizations
        if (!dev && !isServer) {
          // Enable tree shaking and minification
          config.optimization = {
            ...config.optimization,
            usedExports: true,
            sideEffects: true,
            minimize: true,
          }
          config.watchOptions = {
            aggregateTimeout: 5000,
            poll: 1000,
          }
        }
        return config
      },
    staticPageGenerationTimeout: 60000
}

module.exports = nextConfig