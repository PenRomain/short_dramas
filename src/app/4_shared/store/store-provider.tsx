"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { ReactNode, useEffect } from "react";
import { googleApi } from "./services/google";

export default function StoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    store.dispatch(googleApi.endpoints.getDriveManifest.initiate());
    store.dispatch(googleApi.endpoints.getSheetsManifest.initiate());
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
