import { get } from "svelte/store";
import { authState, authStore, initialAuthState } from "./authStore.js";
import { login, register } from "../api/authApi.js";
import { getMe } from "../../users/api/userApi.js";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper.js";

vi.mock("../api/authApi.js");
vi.mock("../../users/api/userApi.js");

const user = { id: "u1", name: "Budi" };

describe("authStore", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authState.set(initialAuthState());
  });

  it("init tanpa token hanya menandai initialized", async () => {
    await authStore.init();
    expect(getMe).not.toHaveBeenCalled();
    expect(get(authStore)).toMatchObject({ initialized: true, isAuthenticated: false });
  });

  it("init dengan token memuat profil", async () => {
    putAccessToken("tok");
    getMe.mockResolvedValue(user);
    await authStore.init();
    expect(get(authStore)).toMatchObject({ initialized: true, isAuthenticated: true, profile: user });
  });

  it("init dengan token tidak valid menghapus token", async () => {
    putAccessToken("rusak");
    getMe.mockRejectedValue(new Error("expired"));
    await authStore.init();
    expect(getAccessToken()).toBeNull();
    expect(get(authStore)).toMatchObject({ initialized: true, isAuthenticated: false, profile: null });
  });

  it("login gagal mengembalikan pesan dan tidak menyimpan token", async () => {
    login.mockRejectedValue(new Error("Email salah"));
    const result = await authStore.login({ email: "a", password: "b" });
    expect(result).toEqual({ success: false, message: "Email salah" });
    expect(getAccessToken()).toBeNull();
    expect(get(authStore).loading).toBe(false);
  });

  it("login berhasil menyimpan token dan profil", async () => {
    login.mockResolvedValue("tok");
    getMe.mockResolvedValue(user);
    const result = await authStore.login({ email: "a", password: "b" });
    expect(result.success).toBe(true);
    expect(getAccessToken()).toBe("tok");
    expect(get(authStore)).toMatchObject({ isAuthenticated: true, profile: user, loading: false });
  });

  it("login berhasil tetapi profil gagal dimuat", async () => {
    login.mockResolvedValue("tok");
    getMe.mockRejectedValue(new Error("profil gagal"));
    const result = await authStore.login({ email: "a", password: "b" });
    expect(result).toEqual({ success: false, message: "profil gagal" });
    expect(get(authStore).isAuthenticated).toBe(false);
  });

  it("register berhasil dan gagal", async () => {
    register.mockResolvedValueOnce("dibuat");
    expect(await authStore.register({})).toEqual({ success: true, data: "dibuat" });

    register.mockRejectedValueOnce(new Error("email dipakai"));
    expect(await authStore.register({})).toEqual({ success: false, message: "email dipakai" });
    expect(get(authStore).loading).toBe(false);
  });

  it("logout menghapus token dan mengosongkan state", () => {
    putAccessToken("tok");
    authState.update((state) => ({ ...state, isAuthenticated: true, profile: user }));
    authStore.logout();
    expect(getAccessToken()).toBeNull();
    expect(get(authStore)).toMatchObject({ isAuthenticated: false, profile: null, initialized: true });
  });
});
