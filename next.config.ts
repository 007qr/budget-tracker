import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    eslint: {
        dirs: ['app', 'hooks', 'components', 'lib', 'schema', 'pages', 'types'],
    },
};

export default nextConfig;
