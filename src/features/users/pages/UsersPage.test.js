import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import UsersPage from "./UsersPage.svelte";
import { getUsers } from "../api/userApi.js";
import { renderWithProviders } from "../../../test-utils.js";

vi.mock("../api/userApi.js");

const users = [
  { id: 1, name: "Ani", email: "ani@x.com", photo: "http://img/ani.png" },
  { id: 2, name: "Budi", email: "zed@x.com", photo: null },
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getUsers.mockResolvedValue(users);
  });

  it("menampilkan daftar pengguna dengan foto atau inisial", async () => {
    const { container } = renderWithProviders(UsersPage);
    expect(await screen.findAllByTestId("user-item")).toHaveLength(2);
    expect(container.querySelector("img")).toHaveAttribute("src", "http://img/ani.png");
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("memakai inisial untuk URL root dan melengkapi path relatif", async () => {
    getUsers.mockResolvedValue([
      { id: 3, name: "Citra", email: "c@x.com", photo: "http://localhost:8000/" },
      { id: 4, name: "Dewi", email: "d@x.com", photo: "img/dewi.png" },
    ]);
    const { container } = renderWithProviders(UsersPage);
    expect(await screen.findAllByTestId("user-item")).toHaveLength(2);

    expect(screen.getByText("C")).toBeInTheDocument();
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute("src", `${new URL(DELCOM_BASEURL).origin}/img/dewi.png`);
  });

  it("menampilkan status memuat", async () => {
    getUsers.mockReturnValue(new Promise(() => {}));
    renderWithProviders(UsersPage);
    expect(await screen.findByTestId("users-loading")).toBeInTheDocument();
  });

  it("mencari berdasarkan nama atau email", async () => {
    renderWithProviders(UsersPage);
    await screen.findAllByTestId("user-item");
    const search = screen.getByLabelText("Cari pengguna");

    await fireEvent.input(search, { target: { value: "ani" } });
    await waitFor(() => expect(screen.getAllByTestId("user-item")).toHaveLength(1));

    await fireEvent.input(search, { target: { value: "zed" } });
    await waitFor(() => expect(screen.getByText("Budi")).toBeInTheDocument());
    expect(screen.queryByText("Ani")).not.toBeInTheDocument();

    await fireEvent.input(search, { target: { value: "tidak-ada" } });
    expect(await screen.findByTestId("users-empty")).toBeInTheDocument();
  });
});