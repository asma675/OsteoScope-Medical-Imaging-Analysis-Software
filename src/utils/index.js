/**
 * Simple route helper used across pages/components.
 *
 * In this app, routes are defined as:
 *   - Dashboard => "/"
 *   - <AnyOtherPageName> => "/<PageName>"
 */
export function createPageUrl(pageName, params) {
  if (!pageName) return "/";

  // allow passing full paths
  let path = String(pageName);
  if (!path.startsWith("/")) {
    path = path === "Dashboard" ? "/" : `/${path}`;
  }

  // Optional query params support (not required by current code, but harmless)
  if (params && typeof params === "object") {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      usp.set(k, String(v));
    }
    const qs = usp.toString();
    if (qs) path += (path.includes("?") ? "&" : "?") + qs;
  }

  return path;
}
