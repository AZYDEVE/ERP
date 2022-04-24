import MainLayout from "../component/mainLayout";
import "../styles/globals.css";
import React from "react";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import createEmotionCache from "../util/createEmotionCache";
import Theme from "../util/theme";
import "../styles/globals.css";
import Head from "next/head";

const clientSideEmotionCache = createEmotionCache();

const MyApp = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <title>AWSOMETEK</title>
      </Head>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={Theme}>
          <CssBaseline />
          <MainLayout>
            <Component {...pageProps} />;
          </MainLayout>
        </ThemeProvider>
      </CacheProvider>
    </>
  );
};

export default MyApp;
