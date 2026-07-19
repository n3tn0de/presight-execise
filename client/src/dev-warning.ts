export const STRICT_MODE_FETCH_WARNING =
  "[Presight] Development mode uses React 19 StrictMode. The initial /api/users and /api/facets requests may be canceled during StrictMode's intentional remount and immediately issued again. This does not happen in production. See https://react.dev/reference/react/StrictMode for details.";

export function warnAboutStrictModeFetches(
  isDevelopment: boolean,
  warn: (...data: unknown[]) => void = console.warn,
): void {
  if (isDevelopment) warn(STRICT_MODE_FETCH_WARNING);
}
