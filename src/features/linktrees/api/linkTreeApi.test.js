import * as api from "./linkTreeApi.js";
import { apiDelete, apiGet, apiPost, apiPut } from "../../../helpers/apiHelper.js";

vi.mock("../../../helpers/apiHelper.js");

describe("linkTreeApi", () => {
  beforeEach(() => vi.resetAllMocks());

  it("normalizeLinkTree mengambil items dari tiga kemungkinan lokasi", () => {
    expect(api.normalizeLinkTree({ link_tree: { id: 1, items: [{ id: "a" }] } }).items).toEqual([{ id: "a" }]);
    expect(api.normalizeLinkTree({ link_tree: { id: 1 }, items: [{ id: "b" }] }).items).toEqual([{ id: "b" }]);
    expect(api.normalizeLinkTree({ link_tree: { id: 1 } })).toEqual({ id: 1, items: [] });
  });

  it("getLinkTrees membaca data.link_trees", async () => {
    apiGet.mockResolvedValue({ data: { link_trees: [{ id: 1 }] } });
    expect(await api.getLinkTrees()).toEqual([{ id: 1 }]);
    expect(apiGet).toHaveBeenCalledWith("/link-trees");
  });

  it("getLinkTree membaca data.link_tree beserta items", async () => {
    apiGet.mockResolvedValue({ data: { link_tree: { id: "x", title: "T" }, items: [{ id: "i" }] } });
    expect(await api.getLinkTree("x")).toEqual({ id: "x", title: "T", items: [{ id: "i" }] });
    expect(apiGet).toHaveBeenCalledWith("/link-trees/x");
  });

  it("create, update, dan delete link tree", async () => {
    apiPost.mockResolvedValue({ message: "dibuat" });
    apiPut.mockResolvedValue({ message: "diubah" });
    apiDelete.mockResolvedValue({ message: "dihapus" });
    const payload = { title: "T", type: "public", description: "D" };

    expect(await api.createLinkTree(payload)).toBe("dibuat");
    expect(apiPost).toHaveBeenCalledWith("/link-trees", payload);
    expect(await api.updateLinkTree("1", payload)).toBe("diubah");
    expect(apiPut).toHaveBeenCalledWith("/link-trees/1", payload);
    expect(await api.deleteLinkTree("1")).toBe("dihapus");
    expect(apiDelete).toHaveBeenCalledWith("/link-trees/1");
    expect(await api.deleteAllLinkTrees()).toBe("dihapus");
    expect(apiDelete).toHaveBeenLastCalledWith("/link-trees");
  });

  it("updateCover mengirim FormData berisi cover", async () => {
    apiPost.mockResolvedValue({ message: "sampul" });
    const file = new File(["x"], "c.png", { type: "image/png" });
    expect(await api.updateCover("1", file)).toBe("sampul");
    expect(apiPost.mock.calls[0][0]).toBe("/link-trees/1/cover");
    expect(apiPost.mock.calls[0][1].get("cover")).toBe(file);
  });

  it("create, update, dan delete item", async () => {
    apiPost.mockResolvedValue({ message: "item+" });
    apiPut.mockResolvedValue({ message: "item~" });
    apiDelete.mockResolvedValue({ message: "item-" });
    const item = { title: "GH", url: "https://github.com" };

    expect(await api.createItem("1", item)).toBe("item+");
    expect(apiPost).toHaveBeenCalledWith("/link-trees/1/items", item);
    expect(await api.updateItem("1", "9", item)).toBe("item~");
    expect(apiPut).toHaveBeenCalledWith("/link-trees/1/items/9", item);
    expect(await api.deleteItem("1", "9")).toBe("item-");
    expect(apiDelete).toHaveBeenCalledWith("/link-trees/1/items/9");
  });
});
