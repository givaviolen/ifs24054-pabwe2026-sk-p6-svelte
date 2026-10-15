import { writable } from "svelte/store";
import todoApi from "../api/todoApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

function createTodosStore() {
  const initial = {
    todos: [],
    todo: null,
    isTodo: false,
    isTodoAdd: false,
    isTodoAdded: false,
    isTodoChange: false,
    isTodoChanged: false,
    isTodoChangeCover: false,
    isTodoChangedCover: false,
    isTodoDelete: false,
    isTodoDeleted: false,
  };

  let currentState = { ...initial };
  const innerStore = writable(currentState);
  innerStore.subscribe((val) => {
    currentState = val;
  });

  return {
    subscribe: innerStore.subscribe,
    get todos() { return currentState.todos; },
    get todo() { return currentState.todo; },
    get isTodo() { return currentState.isTodo; },
    get isTodoAdd() { return currentState.isTodoAdd; },
    get isTodoAdded() { return currentState.isTodoAdded; },
    get isTodoChange() { return currentState.isTodoChange; },
    get isTodoChanged() { return currentState.isTodoChanged; },
    get isTodoChangeCover() { return currentState.isTodoChangeCover; },
    get isTodoChangedCover() { return currentState.isTodoChangedCover; },
    get isTodoDelete() { return currentState.isTodoDelete; },
    get isTodoDeleted() { return currentState.isTodoDeleted; },
    get $state() { return currentState; },
    reset(state = initial) {
      innerStore.set({ ...initial, ...state });
    },
    setTodos(todos) {
      innerStore.update((s) => ({ ...s, todos }));
    },
    setTodo(todo) {
      innerStore.update((s) => ({ ...s, todo }));
    },
    setIsTodo(status) {
      innerStore.update((s) => ({ ...s, isTodo: status }));
    },
    setIsTodoAdd(status) {
      innerStore.update((s) => ({ ...s, isTodoAdd: status }));
    },
    setIsTodoAdded(status) {
      innerStore.update((s) => ({ ...s, isTodoAdded: status }));
    },
    setIsTodoChange(status) {
      innerStore.update((s) => ({ ...s, isTodoChange: status }));
    },
    setIsTodoChanged(status) {
      innerStore.update((s) => ({ ...s, isTodoChanged: status }));
    },
    setIsTodoChangeCover(status) {
      innerStore.update((s) => ({ ...s, isTodoChangeCover: status }));
    },
    setIsTodoChangedCover(status) {
      innerStore.update((s) => ({ ...s, isTodoChangedCover: status }));
    },
    setIsTodoDelete(status) {
      innerStore.update((s) => ({ ...s, isTodoDelete: status }));
    },
    setIsTodoDeleted(status) {
      innerStore.update((s) => ({ ...s, isTodoDeleted: status }));
    },
    async asyncSetTodos(is_finished = "") {
      try {
        const todos = await todoApi.getTodos(is_finished);
        this.setTodos(todos);
      } catch {
        this.setTodos([]);
      }
    },
    async asyncSetTodo(todoId) {
      try {
        const todo = await todoApi.getTodoById(todoId);
        this.setTodo(todo);
      } catch {
        this.setTodo(null);
      } finally {
        this.setIsTodo(true);
      }
    },
    async asyncSetIsTodoAdd(title, description) {
      try {
        await todoApi.postTodo(title, description);
        showSuccessDialog("Todo berhasil ditambahkan!");
        this.setIsTodoAdded(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsTodoAdded(false);
      } finally {
        this.setIsTodoAdd(true);
      }
    },
    async asyncSetIsTodoChange(todoId, title, description, is_finished) {
      try {
        const message = await todoApi.putTodo(
          todoId,
          title,
          description,
          is_finished
        );
        showSuccessDialog(message || "Todo berhasil diperbarui!");
        this.setIsTodoChanged(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsTodoChanged(false);
      } finally {
        this.setIsTodoChange(true);
      }
    },
    async asyncSetIsTodoChangeCover(todoId, cover) {
      try {
        const message = await todoApi.postTodoCover(todoId, cover);
        showSuccessDialog(message || "Cover berhasil diperbarui!");
        this.setIsTodoChangedCover(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsTodoChangedCover(false);
      } finally {
        this.setIsTodoChangeCover(true);
      }
    },
    async asyncSetIsTodoDelete(todoId) {
      try {
        const message = await todoApi.deleteTodo(todoId);
        showSuccessDialog(message || "Todo berhasil dihapus!");
        this.setIsTodoDeleted(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsTodoDeleted(false);
      } finally {
        this.setIsTodoDelete(true);
      }
    },
  };
}

export const todosStore = createTodosStore();
export const useTodosStore = () => todosStore;
export default todosStore;
