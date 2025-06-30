"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { CloudflareAnalyticsService } from "../cloudflare/cloudflare-analytics";

export const InitUser = memo(function InitUser({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialized, setInitialized] = useState(false);
  const analytics = useMemo(() => new CloudflareAnalyticsService(), []);

  useEffect(() => {
    if (!initialized) {
      analytics.newUser();
      setInitialized(true);
    }
  }, [analytics, initialized]);

  return <>{children}</>;
});
