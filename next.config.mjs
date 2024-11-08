/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true, // This will ignore all ESLint errors during build
        // Or if you want to be more specific:
        // rules: {
        //   "@typescript-eslint/no-empty-interface": "off"
        // }
      },
};

export default nextConfig;
