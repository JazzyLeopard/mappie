/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['your-image-domains.com'],
    },
}

module.exports = nextConfig