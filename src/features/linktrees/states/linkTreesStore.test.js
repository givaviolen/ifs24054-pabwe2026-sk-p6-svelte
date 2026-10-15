import { get } from "svelte/store";
import {
  filterLinkTrees, getLinkTreeStats, initialLinkTreesState, linkTreesState, linkTreesStore,
} from "./linkTreesStore.js";
import * as api from "../api/linkTreeApi.js";

vi.mock("../api/linkTreeApi.js");

const list = [
  { id: "1", user_id: "u1", title: "Alpha", type: "public" },
  { id: "2", user_id: "u2", title: "Beta", type: "unlisted" },
  { id: "3", user_id: "u1", title: "Gamma", type: "private" },
];

describe("linkTreesStore", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    linkTreesState.set(initialLinkTreesState());
  });

  it("filterLinkTrees memfilter berdasarkan kata kunci dan kepemilikan", () => {
    expect(filterLinkTrees(list, { query: "", onlyMine: false, profileId: "u1" })).toHaveLength(3);
    expect(filterLinkTrees(list, { query: " ALP ", onlyMine: false, profileId: "u1" })).toEqual([list[0]]);
    expect(filterLinkTrees(list, { query: "", onlyMine: true, profileId: "u1" })).toEqual([list[0], list[2]]);
    expect(filterLinkTrees(list, { query: "beta", onlyMine: true, profileId: "u1" })).toEqual([]);
  });

  it("getLinkTreeStats menghitung statistik", () => {
    expect(getLinkTreeStats(list, "u1")).toEqual({ total: 3, public: 1, unlisted: 1, private: 1, mine: 2 });
  });

  it("fetchLinkTrees berhasil dan gagal", async () => {
    api.getLinkTrees.mockResolvedValueOnce(list);
    await linkTreesStore.fetchLinkTrees();
    expect(get(linkTreesStore)).toMatchObject({ linkTrees: list, loading: false, error: null });

    api.getLinkTrees.mockRejectedValueOnce(new Error("gagal muat"));
    await linkTreesStore.fetchLinkTrees();
    expect(get(linkTreesStore)).toMatchObject({ linkTrees: list, error: "gagal muat" });
  });

  it("fetchLinkTree berhasil, gagal, dan clearDetail", async () => {
    api.getLinkTree.mockResolvedValueOnce({ id: "1", items: [] });
    await linkTreesStore.fetchLinkTree("1");
    expect(get(linkTreesStore)).toMatchObject({ linkTree: { id: "1", items: [] }, detailLoading: false });

    api.getLinkTree.mockRejectedValueOnce(new Error("tidak ada"));
    await linkTreesStore.fetchLinkTree("1");
    expect(get(linkTreesStore)).toMatchObject({ linkTree: null, error: "tidak ada" });

    linkTreesState.update((state) => ({ ...state, linkTree: { id: "x" }, error: "e" }));
    linkTreesStore.clearDetail();
    expect(get(linkTreesStore)).toMatchObject({ linkTree: null, error: null });
  });

  it("mutasi daftar berhasil memuat ulang daftar", async () => {
    api.getLinkTrees.mockResolvedValue(list);
    api.createLinkTree.mockResolvedValue("ok");
    api.deleteLinkTree.mockResolvedValue("ok");
    api.deleteAllLinkTrees.mockResolvedValue("ok");

    expect((await linkTreesStore.addLinkTree({ title: "T" })).success).toBe(true);
    expect((await linkTreesStore.deleteLinkTree("1")).success).toBe(true);
    expect((await linkTreesStore.deleteAllLinkTrees()).success).toBe(true);
    expect(api.getLinkTrees).toHaveBeenCalledTimes(3);
    expect(get(linkTreesStore)).toMatchObject({ adding: false, deleting: false, deletingAll: false });
  });

  it("mutasi detail dan item berhasil memuat ulang detail", async () => {
    api.getLinkTree.mockResolvedValue({ id: "1", items: [] });
    api.updateLinkTree.mockResolvedValue("ok");
    api.updateCover.mockResolvedValue("ok");
    api.createItem.mockResolvedValue("ok");
    api.updateItem.mockResolvedValue("ok");
    api.deleteItem.mockResolvedValue("ok");

    await linkTreesStore.changeLinkTree("1", {});
    await linkTreesStore.changeCover("1", "file");
    await linkTreesStore.addItem("1", {});
    await linkTreesStore.changeItem("1", "i", {});
    await linkTreesStore.deleteItem("1", "i");
    expect(api.getLinkTree).toHaveBeenCalledTimes(5);
    expect(api.updateItem).toHaveBeenCalledWith("1", "i", {});
    expect(get(linkTreesStore)).toMatchObject({ changing: false, changingCover: false, itemMutating: false });
  });

  it("mutasi yang gagal mengembalikan pesan dan tidak memuat ulang", async () => {
    api.createLinkTree.mockRejectedValue(new Error("ditolak"));
    const result = await linkTreesStore.addLinkTree({});
    expect(result).toEqual({ success: false, message: "ditolak" });
    expect(api.getLinkTrees).not.toHaveBeenCalled();
    expect(get(linkTreesStore).adding).toBe(false);
  });

  it("bendera mutasi aktif selama permintaan berjalan", async () => {
    let finish;
    api.createLinkTree.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    api.getLinkTrees.mockResolvedValue([]);
    const pending = linkTreesStore.addLinkTree({});
    expect(get(linkTreesStore).adding).toBe(true);
    finish("ok");
    await pending;
    expect(get(linkTreesStore).adding).toBe(false);
  });
});
