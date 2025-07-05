"use client";

import { memo } from "react";
import { CookiesProvider, type ReactCookieProps } from "react-cookie";

type CookiesProviderWrapProps = ReactCookieProps;
export default memo<CookiesProviderWrapProps>(function CookiesProviderWrap({
  children,
  ...restProps
}: CookiesProviderWrapProps) {
  return <CookiesProvider {...restProps}>{children}</CookiesProvider>;
});
