import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App.svelte";
import { renderWithProviders } from "./test-utils";
import { todosStore } from "./features/todos/states/todosStore";
import { usersStore } from "./features/users/states/usersStore";
import apiHelper from "./helpers/apiHelper";

describe("App Component", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockTodo = {
    id: 1,
    title: "App Test Todo",
    description: "App Test Desc",
    is_finished: 0,
    cover: null,
    created_at: "2024-02-26T02:34:26.000000Z",
    updated_at: "2024-02-26T02:44:47.000000Z",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(usersStore, "asyncSetProfile").mockImplementation(() => Promise.resolve());
    vi.spyOn(todosStore, "asyncSetTodos").mockImplementation(() => Promise.resolve());
    vi.spyOn(todosStore, "asyncSetTodo").mockImplementation(() => Promise.resolve());
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
  });

  it("should render LoginPage when navigating to /auth/login", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const { wrapper } = renderWithProviders(App, {
      route: "/auth/login",
      preloadedState: {
        isAuthLogin: false,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Masuk Sekarang");
  });

  it("should render RegisterPage when navigating to /auth/register", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const { wrapper } = renderWithProviders(App, {
      route: "/auth/register",
      preloadedState: {
        isAuthLogin: false,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Daftar Sekarang");
  });

  it("should render HomePage when navigating to / with auth", () => {
    const { wrapper } = renderWithProviders(App, {
      route: "/",
      preloadedState: {
        isAuthLogin: true,
        profile: mockProfile,
        todos: [mockTodo],
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Daftar Todos");
  });

  it("should render DetailPage when navigating to /todos/:id with auth", () => {
    const { wrapper } = renderWithProviders(App, {
      route: "/todos/1",
      preloadedState: {
        isAuthLogin: true,
        profile: mockProfile,
        todo: mockTodo,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("App Test Todo");
  });

  it("should render UsersPage when navigating to /users with auth", () => {
    const { wrapper } = renderWithProviders(App, {
      route: "/users",
      preloadedState: {
        isAuthLogin: true,
        profile: mockProfile,
        users: [mockProfile],
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Semua Pengguna");
  });

  it("should render ProfilePage when navigating to /profile with auth", () => {
    const { wrapper } = renderWithProviders(App, {
      route: "/profile",
      preloadedState: {
        isAuthLogin: true,
        profile: mockProfile,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Profil Akun");
  });

  it("should render NotFoundPage for invalid route", () => {
    const { wrapper } = renderWithProviders(App, {
      route: "/invalid-unknown-route",
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Halaman Tidak Ditemukan");
  });
});
