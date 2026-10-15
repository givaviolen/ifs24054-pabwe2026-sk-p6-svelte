import { get } from "svelte/store";
import { render, screen, waitFor } from "@testing-library/svelte";
import App from "./App.svelte";
import { getMe } from "./features/users/api/userApi.js";
import { getLinkTrees } from "./features/linktrees/api/linkTreeApi.js";
import { putAccessToken, getAccessToken } from "./helpers/apiHelper.js";
import { profile, resetStores } from "./test-utils.js";
import { currentPath } from "./router.js";

vi.mock("./features/users/api/userApi.js");
vi.mock("./features/linktrees/api/linkTreeApi.js");

function visit(path) {
  window.history.pushState({}, "", path);
}

describe("App", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetStores();
    getMe.mockResolvedValue(profile);
    getLinkTrees.mockResolvedValue([]);
  });

  it("tanpa token mengarahkan halaman aplikasi ke login", async () => {
    visit("/");
    render(App);

    expect(await screen.findByTestId("login-form")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/auth/login");
    expect(get(currentPath)).toBe("/auth/login");
  });

  it("menampilkan status memuat saat profil sedang diambil", () => {
    putAccessToken("tok");
    getMe.mockReturnValue(new Promise(() => {}));
    visit("/");
    render(App);

    expect(screen.getByTestId("app-loading")).toBeInTheDocument();
  });

  it("dengan token valid menampilkan beranda dalam layout aplikasi", async () => {
    putAccessToken("tok");
    visit("/");
    render(App);

    expect(await screen.findByTestId("home-page")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-name")).toHaveTextContent("Budi");
  });

  it("pengguna yang sudah masuk diarahkan keluar dari halaman login", async () => {
    putAccessToken("tok");
    visit("/auth/login");
    render(App);

    expect(await screen.findByTestId("home-page")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });

  it("path tidak dikenal menampilkan halaman 404", async () => {
    putAccessToken("tok");
    visit("/tidak-ada");
    render(App);

    expect(await screen.findByTestId("not-found-page")).toBeInTheDocument();
  });

  it("token yang ditolak server dihapus lalu pengguna diarahkan ke login", async () => {
    putAccessToken("kedaluwarsa");
    getMe.mockRejectedValue(new Error("Unauthorized"));
    visit("/profile");
    render(App);

    expect(await screen.findByTestId("login-form")).toBeInTheDocument();
    await waitFor(() => expect(getAccessToken()).toBeNull());
  });
});
