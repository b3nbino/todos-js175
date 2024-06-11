const nextId = require("./next-id.js");
const Todo = require("./todo.js");

class TodoList {
  constructor(title) {
    this.id = nextId();
    this.title = title;
    this.todos = [];
  }

  static makeTodoList(rawTodoList) {
    let todoList = Object.assign(new TodoList(), {
      id: rawTodoList.id,
      title: rawTodoList.title,
    });

    rawTodoList.todos.forEach((todo) => todoList.add(Todo.makeTodo(todo)));
    return todoList;
  }

  add(todo) {
    if (todo instanceof Todo) {
      this.todos.push(todo);
    } else {
      throw new TypeError("can only add Todo objects");
    }
  }

  size() {
    return this.todos.length;
  }

  first() {
    return this.todos[0];
  }

  last() {
    return this.todos[this.size() - 1];
  }

  _validateIndex(index) {
    if (!(index in this.todos)) {
      throw new ReferenceError(`invalid index: ${index}`);
    }
  }

  itemAt(index) {
    this._validateIndex(index);
    return this.todos[index];
  }

  markDoneAt(index) {
    this.itemAt(index).markDone();
  }

  markUndoneAt(index) {
    this.itemAt(index).markUndone();
  }

  isDone() {
    return this.size() > 0 && this.todos.every((todo) => todo.isDone());
  }

  shift() {
    return this.todos.shift();
  }

  pop() {
    return this.todos.pop();
  }

  removeAt(index) {
    this._validateIndex(index);
    return this.todos.splice(index, 1)[0];
  }

  toString() {
    let title = `-- ${this.title} --`;
    let list = this.todos.map((todo) => todo.toString()).join("\n");
    return `${title}\n${list}`;
  }

  forEach(func) {
    this.todos.forEach(func);
  }

  filter(func) {
    let newList = new TodoList(this.title);

    this.forEach((todo) => {
      if (func(todo)) {
        newList.add(todo);
      }
    });

    return newList;
  }

  findByTitle(title) {
    let wantedTodo;

    this.forEach((todo) => {
      if (todo.getTitle() === title) {
        wantedTodo = todo;
      }
    });

    return wantedTodo;
  }

  findById(id) {
    return this.filter((todo) => todo.id === id).first();
  }

  findIndexOf(todoToFind) {
    let findId = todoToFind.id;
    return this.todos.findIndex((todo) => todo.id === findId);
  }

  allDone() {
    return this.filter((todo) => todo.isDone());
  }

  allNotDone() {
    return this.filter((todo) => !todo.isDone());
  }

  allTodos() {
    return this.filter((_) => true);
  }

  markDone(title) {
    let curr = this.findByTitle(title);
    if (curr) {
      curr.markDone();
    }
  }

  markAllDone() {
    this.forEach((todo) => todo.markDone());
  }

  markAllUndone() {
    this.forEach((todo) => todo.markUndone());
  }

  toArray() {
    return Array.from(this.todos);
  }

  getTitle() {
    return this.title;
  }

  setTitle(title) {
    this.title = title;
  }
}

module.exports = TodoList;
