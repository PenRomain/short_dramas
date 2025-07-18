import type { Metadata } from "next";
import { Montserrat, Montserrat_Subrayada } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import StoreProvider from "./4_shared/store/store-provider";
import cx from "clsx";
import { OrientationGuard } from "./2_widgets/orientation-guard";
import { Prefetch } from "./2_widgets/prefetch";
import { InitUser } from "./3_entities/user/init-user";
import CookiesProviderWrap from "./4_shared/cookies-provider-wrap";
import MainMenu from "./1_features/main-menu";

// const HeadLinks = dynamic(() => import("./2_widgets/head-links"));

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const montserratSubrayada = Montserrat_Subrayada({
  variable: "--font-montserrat-subrayada",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Short dramas",
  description: "Visual novel",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />
      {/* <HeadLinks /> */}
      <body className={cx(montserrat.variable, montserratSubrayada.variable)}>
        <CookiesProviderWrap>
          <InitUser>
            <OrientationGuard>
              <StoreProvider>{children}</StoreProvider>
            </OrientationGuard>
          </InitUser>
        </CookiesProviderWrap>
      </body>
    </html>
  );
}
