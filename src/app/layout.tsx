import type { Metadata } from "next";
import { Montserrat, Montserrat_Subrayada } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import StoreProvider from "./4_shared/store/store-provider";
import cx from "clsx";
import { OrientationGuard } from "./2_widgets/orientation-guard";
import { Prefetch } from "./2_widgets/prefetch";

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
  title: "Dubai",
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
        <OrientationGuard>
          <StoreProvider>
            <Prefetch>{children}</Prefetch>
          </StoreProvider>
        </OrientationGuard>
      </body>
    </html>
  );
}
