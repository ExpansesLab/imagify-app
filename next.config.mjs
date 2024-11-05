/** @type {import('next').NextConfig} */
import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";

const withNextIntl = createNextIntlPlugin();
const withMDX = createMDX({
    extension: /\.mdx?$/,
    options: {},
});

const nextConfig = {
    reactStrictMode: false,
    images: {
        unoptimized: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
    output: 'standalone',
    // Добавляем конфигурацию для NextAuth
    async headers() {
        return [
            {
                // Применяем заголовки для всех роутов
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
        ];
    },
    // Настраиваем редиректы для аутентификации
    async redirects() {
        return [
            {
                source: '/sign-in',
                has: [
                    {
                        type: 'cookie',
                        key: 'next-auth.session-token',
                    },
                ],
                permanent: false,
                destination: '/',
            },
        ];
    },
};

export default withNextIntl(withMDX(nextConfig));
