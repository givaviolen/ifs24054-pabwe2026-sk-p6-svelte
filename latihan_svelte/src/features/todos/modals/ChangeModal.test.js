import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import todoApi from "../api/todoApi";

describe("ChangeModal", () => {
  const mockTodo = {
    id: 1,
    title: "Initial Title",
    description: "Initial Desc",
    is_finished: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: false, todoId: 1 },
    });
    expect(wrapper.find('[data-testid="edit-todo-modal"]').exists()).toBe(false);
  });

  it("should populate inputs with todo data and handle changes", async () => {
    vi.spyOn(todoApi, "getTodoById").mockResolvedValue(mockTodo);

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, todoId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const titleInput = wrapper.find('[data-testid="edit-todo-title-input"]');
    const descInput = wrapper.find('[data-testid="edit-todo-description-input"]');
    const statusSelect = wrapper.find('[data-testid="edit-todo-status-select"]');

    expect(titleInput.element.value).toBe("Initial Title");
    expect(descInput.element.value).toBe("Initial Desc");
    expect(statusSelect.element.value).toBe("0");

    await statusSelect.setValue("1");
    expect(statusSelect.element.value).toBe("1");
  });

  it("should handle error in loadTodoData and call handleClose", async () => {
    vi.spyOn(todoApi, "getTodoById").mockRejectedValue(new Error("Fail"));
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const closeSpy = vi.fn();

    renderWithProviders(ChangeModal, {
      props: { show: true, todoId: 1, onClose: closeSpy },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(errorSpy).toHaveBeenCalledWith("Gagal mengambil data todo");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle empty title and description in todo object", async () => {
    vi.spyOn(todoApi, "getTodoById").mockResolvedValue({
      id: 1,
      title: null,
      description: null,
      is_finished: 1,
    });

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, todoId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.find('[data-testid="edit-todo-title-input"]').element.value).toBe("");
  });

  it("should validate empty title and empty description", async () => {
    vi.spyOn(todoApi, "getTodoById").mockResolvedValue(mockTodo);
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, todoId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const titleInput = wrapper.find('[data-testid="edit-todo-title-input"]');
    const form = wrapper.find("form");

    await titleInput.setValue("   ");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    await titleInput.setValue("Valid Title");
    const descInput = wrapper.find('[data-testid="edit-todo-description-input"]');
    await descInput.setValue("   ");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should dispatch asyncSetIsTodoChange and close on success", async () => {
    vi.spyOn(todoApi, "getTodoById").mockResolvedValue(mockTodo);
    const closeSpy = vi.fn();

    const { wrapper, todosStore } = renderWithProviders(ChangeModal, {
      props: { show: true, todoId: 1, onClose: closeSpy },
      preloadedState: {
        isTodoChange: false,
        isTodoChanged: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const changeSpy = vi.spyOn(todosStore, "asyncSetIsTodoChange").mockReturnValue(Promise.resolve());

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, "Initial Title", "Initial Desc", false);

    // Simulate completion with isTodoChanged true
    todosStore.setIsTodoChange(true);
    todosStore.setIsTodoChanged(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should dispatch asyncSetIsTodoChange with true when isFinished is 1", async () => {
    vi.spyOn(todoApi, "getTodoById").mockResolvedValue({ ...mockTodo, is_finished: 1 });

    const { wrapper, todosStore } = renderWithProviders(ChangeModal, {
      props: { show: true, todoId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const changeSpy = vi.spyOn(todosStore, "asyncSetIsTodoChange").mockReturnValue(Promise.resolve());

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, "Initial Title", "Initial Desc", true);
  });

  it("should handle isTodoChange true when isTodoChanged is false", async () => {
    vi.spyOn(todoApi, "getTodoById").mockResolvedValue(mockTodo);

    const { wrapper, todosStore } = renderWithProviders(ChangeModal, {
      props: { show: true, todoId: 1 },
      preloadedState: {
        isTodoChange: false,
        isTodoChanged: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    todosStore.setIsTodoChange(true);
    todosStore.setIsTodoChanged(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="edit-todo-title-input"]').exists()).toBe(true);
  });

  it("should trigger onClose on cancel or close button click", async () => {
    vi.spyOn(todoApi, "getTodoById").mockResolvedValue(mockTodo);
    const closeSpy = vi.fn();

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, todoId: 1, onClose: closeSpy },
    });

    await new Promise((r) => setTimeout(r, 20));

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-edit-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle null getTodoById response and changed and close without callback", async () => {
    vi.spyOn(todoApi, "getTodoById").mockResolvedValue(null);

    const { wrapper, todosStore } = renderWithProviders(ChangeModal, {
      props: { show: true, todoId: 1 },
      preloadedState: {
        isTodoChange: false,
        isTodoChanged: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");

    todosStore.setIsTodoChange(true);
    todosStore.setIsTodoChanged(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.exists()).toBe(true);
  });
});
