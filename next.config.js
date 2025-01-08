/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    reactStrictMode: true,
    swcMinify: true,
    images: {
        remotePatterns: [{
            protocol: 'http',
            hostname: 'your-image-domains.com',
            pathname: '**',
        }],
    },
    pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
    webpack: (config, { isServer }) => {
        config.watchOptions = {
            aggregateTimeout: 5000,
            poll: 1000,
        }
        return config
    },
    staticPageGenerationTimeout: 60000
}

module.exports = nextConfig