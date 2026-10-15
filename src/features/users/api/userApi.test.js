import { changePassword, getMe, getUsers, updateMe, updatePhoto } from "./userApi.js";
import { apiGet, apiPost, apiPut } from "../../../helpers/apiHelper.js";

vi.mock("../../../helpers/apiHelper.js");

describe("userApi", () => {
  beforeEach(() => vi.resetAllMocks());

  it("getUsers dan getMe membaca data", async () => {
    apiGet.mockResolvedValueOnce({ data: { users: [{ id: 1 }] } });
    expect(await getUsers()).toEqual([{ id: 1 }]);
    expect(apiGet).toHaveBeenLastCalledWith("/users");

    apiGet.mockResolvedValueOnce({ data: { user: { id: 2 } } });
    expect(await getMe()).toEqual({ id: 2 });
    expect(apiGet).toHaveBeenLastCalledWith("/users/me");
  });

  it("updateMe mengirim nama dan email", async () => {
    apiPut.mockResolvedValue({ message: "ok" });
    expect(await updateMe({ name: "N", email: "e@x.c" })).toBe("ok");
    expect(apiPut).toHaveBeenCalledWith("/users/me", { name: "N", email: "e@x.c" });
  });

  it("updatePhoto mengirim FormData berisi foto", async () => {
    apiPost.mockResolvedValue({ message: "foto" });
    const file = new File(["x"], "a.png", { type: "image/png" });
    expect(await updatePhoto(file)).toBe("foto");
    expect(apiPost.mock.calls[0][0]).toBe("/users/photo");
    expect(apiPost.mock.calls[0][1].get("photo")).toBe(file);
  });

  it("changePassword memakai nama field new_password", async () => {
    apiPut.mockResolvedValue({ message: "sandi" });
    expect(await changePassword({ password: "a", newPassword: "b" })).toBe("sandi");
    expect(apiPut).toHaveBeenCalledWith("/users/change-password", { password: "a", new_password: "b" });
  });
});
