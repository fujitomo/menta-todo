
import { useEffect } from 'react';

const IndexPage = () => {
  return null; // 何もレンダリングしない
};

export const getServerSideProps = async () => {
  return {
    redirect: {
      destination: '/TodoList', // ここにリダイレクト先のページのパスを指定
      permanent: false,
    },
  };
};

export default IndexPage;