/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    HOGE: process.env.HOGE,
  },
  // 他のNext.js設定をここに追加
};

const withInterceptStdout = require('next-intercept-stdout');

// withInterceptStdoutを使用してnextConfigをラップ
module.exports = withInterceptStdout(nextConfig, (text) => {
  // 標準出力をインターセプトして特定のテキストをフィルタリング
  return text.includes('Duplicate atom key') ? '' : text;
});
