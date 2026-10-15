import { get } from "svelte/store";
import {
  currentPath, handleLinkClick, initRouter, isMenuActive, navigate, redirect, resolveRoute,
} from "./router.js";
import LoginPage from "./features/auth/pages/LoginPage.svelte";
import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
import HomePage from "./features/linktrees/pages/HomePage.svelte";
import DetailPage from "./features/linktrees/pages/DetailPage.svelte";
import UsersPage from "./features/users/pages/UsersPage.svelte";
import ProfilePage from "./features/users/pages/ProfilePage.svelte";
import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";

describe("router", () => {
  it("navigate dan redirect memperbarui history serta store", () => {
    navigate("/users");
    expect(window.location.pathname).toBe("/users");
    expect(get(currentPath)).toBe("/users");

    redirect("/profile");
    expect(window.location.pathname).toBe("/profile");
    expect(get(currentPath)).toBe("/profile");
  });

  it("initRouter menyinkronkan path saat popstate dan bisa dihentikan", () => {
    window.history.replaceState({}, "", "/users");
    const stop = initRouter();
    expect(get(currentPath)).toBe("/users");

    window.history.replaceState({}, "", "/profile");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(get(currentPath)).toBe("/profile");

    stop();
    window.history.replaceState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(get(currentPath)).toBe("/profile");
  });

  it("handleLinkClick mencegah aksi bawaan dan berpindah halaman", () => {
    const event = { preventDefault: vi.fn() };
    handleLinkClick(event, "/users");
    expect(event.preventDefault).toHaveBeenCalled();
    expect(get(currentPath)).toBe("/users");
  });

  it("resolveRoute memetakan semua rute", () => {
    expect(resolveRoute("/auth/login")).toMatchObject({ layout: "auth", component: LoginPage });
    expect(resolveRoute("/auth/register")).toMatchObject({ layout: "auth", component: RegisterPage });
    expect(resolveRoute("/")).toMatchObject({ layout: "app", component: HomePage });
    expect(resolveRoute("/users").component).toBe(UsersPage);
    expect(resolveRoute("/profile").component).toBe(ProfilePage);
  });

  it("resolveRoute membaca parameter dan mengabaikan garis miring akhir", () => {
    const route = resolveRoute("/link-trees/abc%20123/");
    expect(route.component).toBe(DetailPage);
    expect(route.params).toEqual({ linkTreeId: "abc 123" });
  });

  it("resolveRoute menampilkan 404 untuk path yang tidak cocok", () => {
    expect(resolveRoute("/tidak-ada").component).toBe(NotFoundPage);
    expect(resolveRoute("/auth/lainnya").component).toBe(NotFoundPage);
    expect(resolveRoute("/link-trees2/x").component).toBe(NotFoundPage);
    expect(resolveRoute("/a/b/c/d").component).toBe(NotFoundPage);
  });

  it("isMenuActive menandai menu aktif", () => {
    expect(isMenuActive("/", "/")).toBe(true);
    expect(isMenuActive("/", "/link-trees/1")).toBe(true);
    expect(isMenuActive("/", "/users")).toBe(false);
    expect(isMenuActive("/users", "/users")).toBe(true);
    expect(isMenuActive("/users", "/profile")).toBe(false);
  });
});
