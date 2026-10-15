import { writable } from "svelte/store";
import LoginPage from "./features/auth/pages/LoginPage.svelte";
import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
import HomePage from "./features/linktrees/pages/HomePage.svelte";
import DetailPage from "./features/linktrees/pages/DetailPage.svelte";
import UsersPage from "./features/users/pages/UsersPage.svelte";
import ProfilePage from "./features/users/pages/ProfilePage.svelte";
import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";

export const currentPath = writable(globalThis.location.pathname);

export function navigate(path) {
  globalThis.history.pushState({}, "", path);
  currentPath.set(path);
}

export function redirect(path) {
  globalThis.history.replaceState({}, "", path);
  currentPath.set(path);
}

export function initRouter() {
  const sync = () => currentPath.set(globalThis.location.pathname);
  globalThis.addEventListener("popstate", sync);
  sync();
  return () => globalThis.removeEventListener("popstate", sync);
}

export function handleLinkClick(event, path) {
  event.preventDefault();
  navigate(path);
}

// Tabel rute dibuat saat dipanggil (bukan saat modul dimuat) agar impor
// melingkar antara router dan halaman tidak menyebabkan error TDZ.
function getRoutes() {
  return [
    { pattern: "/auth/login", layout: "auth", component: LoginPage },
    { pattern: "/auth/register", layout: "auth", component: RegisterPage },
    { pattern: "/", layout: "app", component: HomePage },
    { pattern: "/link-trees/:linkTreeId", layout: "app", component: DetailPage },
    { pattern: "/users", layout: "app", component: UsersPage },
    { pattern: "/profile", layout: "app", component: ProfilePage },
  ];
}

function matchPattern(pattern, path) {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");
  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export function resolveRoute(path) {
  const cleanPath = path.length > 1 ? path.replace(/\/+$/, "") : path;

  for (const route of getRoutes()) {
    const params = matchPattern(route.pattern, cleanPath);
    if (params) {
      return { layout: route.layout, component: route.component, params };
    }
  }
  return { layout: "app", component: NotFoundPage, params: {} };
}

export function isMenuActive(menuPath, current) {
  if (menuPath === "/") {
    return current === "/" || current.startsWith("/link-trees/");
  }
  return current === menuPath;
}