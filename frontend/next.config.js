/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const withInterceptStdout = require('next-intercept-stdout')

module.exports = withInterceptStdout(
  {
    env: {
      HOGE: process.env.HOGE,
    },
  },
  (text) => (text.includes('Duplicate atom key') ? '' : text)
)
