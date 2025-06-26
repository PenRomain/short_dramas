import axios from "axios";

export async function getImage(query: string[]): Promise<string[] | undefined> {
  try {
    const { data } = await axios.get<string[]>(
      "/api/drive" + "?" + new URLSearchParams({ images: query.join(",") }),
    );

    return data;
  } catch (e) {
    console.error("Get image error:", e);
  }
  return undefined;
}
