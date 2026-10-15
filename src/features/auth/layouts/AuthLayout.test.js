import { render, screen } from "@testing-library/svelte";
import AuthLayout from "./AuthLayout.svelte";
import { textSnippet } from "../../../test-utils.js";

describe("AuthLayout", () => {
  it("menampilkan identitas aplikasi dan isi halaman", () => {
    render(AuthLayout, { props: { children: textSnippet("isi form") } });
    expect(screen.getByText("Delcom Link Tree")).toBeInTheDocument();
    expect(screen.getByText(/kumpulkan semua tautan/i)).toBeInTheDocument();
    expect(screen.getByText("isi form")).toBeInTheDocument();
  });
});
