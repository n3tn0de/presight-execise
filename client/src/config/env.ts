const apiUrl =
  typeof import.meta.env === "undefined"
    ? undefined
    : import.meta.env.VITE_API_URL;

export const env = {
  API_URL:
    apiUrl === undefined || apiUrl === "" ? "http://localhost:3000" : apiUrl,
} as const;
