import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as router from "../../../router";
import { todosStore } from "../states/todosStore";

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockTodo = {
    id: 1,
    title: "Detail Todo Judul",
    description: "Detail Todo Deskripsi",
    is_finished: 1,
    cover: "https://example.com/cover.jpg",
    created_at: "2024-02-26T02:34:26.000000Z",
    updated_at: "2024-02-26T02:44:47.000000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading spinner if profile or todo is missing", () => {
    vi.spyOn(todosStore, "asyncSetTodo").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { todoId: 1 },
      preloadedState: {
        profile: null,
        todo: null,
      },
    });

    expect(wrapper.text()).not.toContain("Detail Todo Judul");

    const { wrapper: wrapper2 } = renderWithProviders(DetailPage, {
      props: { todoId: 1 },
      preloadedState: {
        profile: mockProfile,
        todo: null,
      },
    });
    expect(wrapper2.text()).not.toContain("Detail Todo Judul");
  });

  it("should render correctly when todo id is null", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { todoId: 1 },
      preloadedState: {
        profile: mockProfile,
        todo: { ...mockTodo, id: null },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("should not call asyncSetTodo if todoId is not provided onMount", () => {
    const spy = vi.spyOn(todosStore, "asyncSetTodo").mockImplementation(() => Promise.resolve());
    renderWithProviders(DetailPage, {
      props: { todoId: null },
      preloadedState: {
        profile: mockProfile,
        todo: null,
      },
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it("should render todo details correctly and support closing cover & edit modals", async () => {
    vi.spyOn(todosStore, "asyncSetTodo").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { todoId: 1 },
      preloadedState: {
        profile: mockProfile,
        todo: mockTodo,
      },
    });

    expect(wrapper.text()).toContain("Detail Todo Judul");
    expect(wrapper.text()).toContain("Detail Todo Deskripsi");
    expect(wrapper.text()).toContain("Selesai");

    // Back to todos link
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const backLink = wrapper.find('[data-testid="back-to-todos-link"]');
    await backLink.trigger("click");
    expect(navigateSpy).toHaveBeenCalledWith("/");

    // Open & close cover modal
    const editCoverBtn = wrapper.find('[data-testid="edit-cover-btn"]');
    await editCoverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);

    const closeCoverBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeCoverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    // Open & close edit modal
    const editDetailBtn = wrapper.find('[data-testid="edit-detail-todo-btn"]');
    await editDetailBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-todo-modal"]').exists()).toBe(true);

    const closeEditBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeEditBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-todo-modal"]').exists()).toBe(false);
  });

  it("should render unfinished badge when todo is not finished and handle description fallback", () => {
    vi.spyOn(todosStore, "asyncSetTodo").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { todoId: 1 },
      preloadedState: {
        profile: mockProfile,
        todo: {
          ...mockTodo,
          is_finished: 0,
          description: "",
          cover: null,
        },
      },
    });

    expect(wrapper.text()).toContain("Sedang Proses");
    expect(wrapper.text()).toContain("Tidak ada deskripsi rinci untuk todo ini.");
  });

  it("should trigger confirm dialog and dispatch delete on delete button click when confirmed", async () => {
    vi.spyOn(todosStore, "asyncSetTodo").mockImplementation(() => Promise.resolve());
    const deleteSpy = vi
      .spyOn(todosStore, "asyncSetIsTodoDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { todoId: 1 },
      preloadedState: {
        profile: mockProfile,
        todo: mockTodo,
      },
    });

    const deleteBtn = wrapper.find('[data-testid="delete-detail-todo-btn"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should not dispatch delete when cancelled", async () => {
    vi.spyOn(todosStore, "asyncSetTodo").mockImplementation(() => Promise.resolve());
    const deleteSpy = vi
      .spyOn(todosStore, "asyncSetIsTodoDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { todoId: 1 },
      preloadedState: {
        profile: mockProfile,
        todo: mockTodo,
      },
    });

    const deleteBtn = wrapper.find('[data-testid="delete-detail-todo-btn"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(toolsHelper.showConfirmDialog).toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should navigate back to home if isTodo is true and todo is null", async () => {
    vi.spyOn(todosStore, "asyncSetTodo").mockImplementation(() => Promise.resolve());
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { todosStore: tStore } = renderWithProviders(DetailPage, {
      props: { todoId: 1 },
      preloadedState: {
        profile: mockProfile,
        todo: null,
        isTodo: false,
      },
    });

    tStore.setIsTodo(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should stay when isTodo is true and todo exists", async () => {
    vi.spyOn(todosStore, "asyncSetTodo").mockImplementation(() => Promise.resolve());
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { wrapper, todosStore: tStore } = renderWithProviders(DetailPage, {
      props: { todoId: 1 },
      preloadedState: {
        profile: mockProfile,
        todo: mockTodo,
        isTodo: false,
      },
    });

    navigateSpy.mockClear();
    tStore.setIsTodo(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Detail Todo Judul");
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("should navigate back to home if isTodoDeleted is true", async () => {
    vi.spyOn(todosStore, "asyncSetTodo").mockImplementation(() => Promise.resolve());
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { todosStore: tStore } = renderWithProviders(DetailPage, {
      props: { todoId: 1 },
      preloadedState: {
        profile: mockProfile,
        todo: mockTodo,
        isTodoDeleted: false,
      },
    });

    tStore.setIsTodoDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should trigger asyncSetTodo on todoId change", async () => {
    const setTodoSpy = vi.spyOn(todosStore, "asyncSetTodo").mockImplementation(() => Promise.resolve());
    const { rerender } = renderWithProviders(DetailPage, {
      props: { todoId: 1 },
      preloadedState: {
        profile: mockProfile,
        todo: mockTodo,
      },
    });

    await rerender({ todoId: 2 });
    await new Promise((r) => setTimeout(r, 10));

    expect(setTodoSpy).toHaveBeenCalledWith(2);
  });
});
