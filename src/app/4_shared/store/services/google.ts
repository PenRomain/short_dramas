import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type GetManifestQuery = {
  images: Record<
    string,
    { id: string; mime: string; name: string; webContentLink: string }
  >;
  tracks: Record<string, { id: string; mime: string; name: string }>;
};

type GetSheetsManifestQuery = {
  locations: string[][];
  emotions: string[][];
  cutscenes: string[][];
};

export const googleApi = createApi({
  reducerPath: "googleApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getDriveManifest: builder.query<GetManifestQuery, void>({
      query: () => "drive/manifest",
      keepUnusedDataFor: 86400,
    }),
    getSheetsManifest: builder.query<GetSheetsManifestQuery, void>({
      query: () => "sheets/manifest",
      keepUnusedDataFor: 86400,
    }),
    getTrack: builder.query<string, string>({
      query: (file) => ({
        url: "drive",
        params: { music: file },
        responseHandler: async (res) => {
          const blob = await res.blob();
          return URL.createObjectURL(blob);
        },
      }),
      async onCacheEntryAdded(_, { cacheEntryRemoved, cacheDataLoaded }) {
        const url = await cacheDataLoaded;
        await cacheEntryRemoved;
        URL.revokeObjectURL(url.data);
      },
    }),
    getImage: builder.query<string, string>({
      query: (file) => ({
        url: "drive",
        params: { image: file },
        responseHandler: async (res) => {
          return res.url;
        },
      }),
      async onCacheEntryAdded(_, { cacheEntryRemoved, cacheDataLoaded }) {
        const url = await cacheDataLoaded;
        await cacheEntryRemoved;
        URL.revokeObjectURL(url.data);
      },
    }),
  }),
});

export const {
  useGetDriveManifestQuery,
  useGetSheetsManifestQuery,
  useGetImageQuery,
  useGetTrackQuery,
} = googleApi;
