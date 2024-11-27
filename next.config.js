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
}

module.exports = nextConfig