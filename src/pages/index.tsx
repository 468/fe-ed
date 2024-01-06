import Head from "next/head";
import dynamic from "next/dynamic";

import styles from "@/styles/Home.module.css";
const Main = dynamic(() => import("@/components/Main"), { ssr: false });

export async function getStaticProps() {
  return {
    props: {},
  };
}

export default function Home(): JSX.Element {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
      </Head>
      <main className={styles.main}>
        <Main />
      </main>
    </>
  );
}
