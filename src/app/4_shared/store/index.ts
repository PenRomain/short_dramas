import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { googleApi } from "./services/google";

export const store = configureStore({
  reducer: {
    [googleApi.reducerPath]: googleApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(googleApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
