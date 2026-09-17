/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/resume",
        destination: "/assets/ira_quint_resume_september_2026.pdf",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
