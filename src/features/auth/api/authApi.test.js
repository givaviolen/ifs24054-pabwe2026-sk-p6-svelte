import { login, register } from "./authApi.js";
import { apiPost } from "../../../helpers/apiHelper.js";

vi.mock("../../../helpers/apiHelper.js");

describe("authApi", () => {
  beforeEach(() => vi.resetAllMocks());

  it("login mengembalikan token", async () => {
    apiPost.mockResolvedValue({ data: { token: "tok" } });
    expect(await login({ email: "a@b.c", password: "pw" })).toBe("tok");
    expect(apiPost).toHaveBeenCalledWith("/auth/login", { email: "a@b.c", password: "pw" });
  });

  it("register mengembalikan pesan", async () => {
    apiPost.mockResolvedValue({ message: "dibuat" });
    expect(await register({ name: "N", email: "a@b.c", password: "pw" })).toBe("dibuat");
    expect(apiPost).toHaveBeenCalledWith("/auth/register", { name: "N", email: "a@b.c", password: "pw" });
  });
});
