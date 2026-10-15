import { get } from "svelte/store";
import { initialUsersState, userStore, usersState } from "./userStore.js";
import { changePassword, getUsers, updateMe, updatePhoto } from "../api/userApi.js";
import { authStore } from "../../auth/states/authStore.js";

vi.mock("../api/userApi.js");
vi.mock("../../auth/states/authStore.js", () => ({ authStore: { fetchProfile: vi.fn() } }));

describe("userStore", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    usersState.set(initialUsersState());
  });

  it("fetchUsers menyimpan daftar pengguna", async () => {
    getUsers.mockResolvedValue([{ id: 1 }]);
    const result = await userStore.fetchUsers();
    expect(result.success).toBe(true);
    expect(get(userStore)).toMatchObject({ users: [{ id: 1 }], loading: false });
  });

  it("fetchUsers yang gagal mempertahankan daftar lama", async () => {
    usersState.update((state) => ({ ...state, users: [{ id: 9 }] }));
    getUsers.mockRejectedValue(new Error("gagal"));
    const result = await userStore.fetchUsers();
    expect(result.success).toBe(false);
    expect(get(userStore).users).toEqual([{ id: 9 }]);
  });

  it("mutasi profil yang berhasil memuat ulang profil", async () => {
    updateMe.mockResolvedValue("ok");
    updatePhoto.mockResolvedValue("ok");
    changePassword.mockResolvedValue("ok");

    expect((await userStore.updateProfile({ name: "N" })).success).toBe(true);
    expect((await userStore.uploadPhoto("file")).success).toBe(true);
    expect((await userStore.changePassword({ password: "a" })).success).toBe(true);
    expect(authStore.fetchProfile).toHaveBeenCalledTimes(3);
    expect(get(userStore).saving).toBe(false);
  });

  it("mutasi profil yang gagal tidak memuat ulang profil", async () => {
    updateMe.mockRejectedValue(new Error("gagal"));
    const result = await userStore.updateProfile({});
    expect(result).toEqual({ success: false, message: "gagal" });
    expect(authStore.fetchProfile).not.toHaveBeenCalled();
  });

  it("bendera saving aktif selama mutasi berjalan", async () => {
    let finish;
    updateMe.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const pending = userStore.updateProfile({});
    expect(get(userStore).saving).toBe(true);
    finish("ok");
    await pending;
    expect(get(userStore).saving).toBe(false);
  });
});
