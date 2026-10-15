import {
  apiDelete, apiGet, apiPost, apiPut, getAccessToken, putAccessToken,
  removeAccessToken, request, safeCall,
} from "./apiHelper.js";

function stubFetch(body) {
  const fetchMock = vi.fn().mockResolvedValue({ json: async () => body });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("apiHelper", () => {
  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("mengirim GET tanpa token dan tanpa body", async () => {
    const fetchMock = stubFetch({ status: "success", data: { ok: 1 } });
    const result = await request("/ping");
    expect(result.data.ok).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(`${DELCOM_BASEURL}/ping`, {
      method: "GET",
      headers: {},
      body: undefined,
    });
  });

  it("menyertakan header Authorization bila token ada", async () => {
    putAccessToken("tok");
    const fetchMock = stubFetch({ status: "success" });
    await request("/me");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
  });

  it("mengirim body JSON", async () => {
    const fetchMock = stubFetch({ status: "success" });
    await apiPost("/items", { a: 1 });
    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("mengirim FormData apa adanya tanpa Content-Type", async () => {
    const fetchMock = stubFetch({ status: "success" });
    const form = new FormData();
    await apiPost("/upload", form);
    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBe(form);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("melempar error dengan pesan dari server", async () => {
    stubFetch({ status: "fail", message: "Token tidak valid" });
    await expect(apiGet("/x")).rejects.toThrow("Token tidak valid");
  });

  it("melempar pesan bawaan bila server tidak mengirim pesan", async () => {
    stubFetch({ status: "error" });
    await expect(apiGet("/x")).rejects.toThrow("Terjadi kesalahan pada server");
  });

  it("apiPut dan apiDelete memakai method yang benar", async () => {
    const fetchMock = stubFetch({ status: "success" });
    await apiPut("/a", { b: 2 });
    await apiDelete("/a");
    expect(fetchMock.mock.calls[0][1].method).toBe("PUT");
    expect(fetchMock.mock.calls[1][1].method).toBe("DELETE");
  });

  it("safeCall membungkus hasil sukses dan gagal", async () => {
    expect(await safeCall(async () => 5)).toEqual({ success: true, data: 5 });
    expect(
      await safeCall(async () => {
        throw new Error("boom");
      })
    ).toEqual({ success: false, message: "boom" });
  });
});
