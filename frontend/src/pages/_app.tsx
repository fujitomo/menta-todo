import { CacheProvider, EmotionCache } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";
import Head from "next/head";
import createEmotionCache from "../createEmotionCache";
import "../styles/globals.css";
import theme from "../theme";
import { RecoilRoot, useSetRecoilState } from "recoil"
import MainLayout from "@/components/pages/MainLayout";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { displayAvatar } from "@/recoilAtoms/recoilState";

const clientSideEmotionCache = createEmotionCache();
interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}
// アバターアイコン設定用コンポーネント
function AvatarControl() {
  const router = useRouter();
  const setDisplayAvatar = useSetRecoilState(displayAvatar);

  useEffect(() => {
    if (router.pathname === "/TodoList") {
      setDisplayAvatar(true);
    } else {
      setDisplayAvatar(false);
    }
  }, [router.pathname, setDisplayAvatar]);

  return null; // このコンポーネントは何も描画しません
}

function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <RecoilRoot>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <MainLayout>
            <AvatarControl /> {/* AvatarControl コンポーネントを追加 */}
            <Component {...pageProps} />
          </MainLayout>
        </ThemeProvider>
      </CacheProvider>
    </RecoilRoot>
  );
}

export default MyApp;
