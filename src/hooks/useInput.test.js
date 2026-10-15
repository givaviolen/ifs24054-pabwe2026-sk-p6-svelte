import { get } from "svelte/store";
import { useInput } from "./useInput.js";

describe("useInput", () => {
  it("menyimpan nilai awal, bisa diubah, dan bisa direset", () => {
    const input = useInput("awal");
    expect(get(input.value)).toBe("awal");

    input.value.set("baru");
    expect(input.getValue()).toBe("baru");

    input.reset();
    expect(input.getValue()).toBe("awal");
  });
});
