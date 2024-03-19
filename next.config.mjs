/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: 'fdyxcmvcmhsdylqsjtbt.supabase.co',
                port: '',
            }
        ]
    }
};

export default nextConfig;
