const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const TodoList = require("./lib/todolist");
const Todo = require("./lib/todo");
const { body, validationResult } = require("express-validator");
const { sortTodos, sortTodoLists } = require("./lib/sort");

const app = express();
const host = "localhost";
const port = 3000;

let todoLists = require("./lib/seed-data");

function findList(listId) {
  return todoLists.filter((list) => list.id === listId)[0];
}

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    name: "launch-school-todos-session-id",
    resave: false,
    saveUninitialized: true,
    secret: "this is not very secure",
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

app.get("/", (req, res) => {
  res.redirect("/lists");
});

app.get("/lists", (req, res) => {
  res.render("lists", { todoLists: sortTodoLists(todoLists) });
});

app.get("/lists/new", (req, res) => {
  res.render("new-list");
});

app.post(
  //Lets user make new lists
  "/lists",
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please enter a list title.")
      .isLength({ max: 100 })
      .withMessage("List title must be between 1 and 100 characters.")
      .custom((title) => {
        let duplicate = todoLists.find((list) => list.title === title);
        return duplicate === undefined;
      })
      .withMessage("List title must be unique."),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash("error", message.msg));
      res.render("new-list", {
        flash: req.flash(),
        todoListTitle: req.body.todoListTitle,
      });
    } else {
      todoLists.push(new TodoList(req.body.todoListTitle));
      req.flash("success", "New list created!");
      res.redirect("/lists");
    }
  }
);

app.get("/lists/:todoListId", (req, res, next) => {
  //Renders todo list page
  let todoListId = req.params.todoListId;
  let todoList = findList(+todoListId);
  if (todoList === undefined) {
    next(new Error("Not found."));
  } else {
    res.render("list", {
      todoList: todoList,
      todos: sortTodos(todoList),
    });
  }
});

app.post("/lists/:todoListId/todos/:todoId/toggle", (req, res, next) => {
  //Adds checkbox functionality
  let todoList = findList(+req.params.todoListId);
  let todo = todoList.findById(+req.params.todoId);

  if (todo === undefined) {
    //Throws error if checking todo exists
    next(new Error("Todo not found"));
  }

  if (todo.isDone()) {
    todo.markUndone();
    req.flash("success", `${todo.getTitle()} undone!`);
  } else {
    todo.markDone();
    req.flash("success", `${todo.getTitle()} done!`);
  }

  res.redirect(`/lists/${req.params.todoListId}`);
});

app.post("/lists/:todoListId/todos/:todoId/destroy", (req, res, next) => {
  //Adds delete functionality
  let todoList = findList(+req.params.todoListId);
  let todo = todoList.findById(+req.params.todoId);

  if (todo === undefined) {
    //Throws error if checking todo exists
    next(new Error("Todo not found"));
  }

  let todoIndex = todoList.findIndexOf(todo);
  todoList.removeAt(todoIndex);
  req.flash("success", `Removed ${todo.getTitle()}.`);
  res.redirect(`/lists/${req.params.todoListId}`);
});

app.post("/lists/:todoListId/complete_all", (req, res, next) => {
  //Adds complete all functionality
  let todoListId = req.params.todoListId;
  let todoList = findList(+todoListId);

  if (todoList === undefined) {
    next(new Error("Not found."));
  }

  todoList.markAllDone();
  req.flash("success", "Marked all todos as done!");
  res.redirect(`/lists/${todoListId}`);
});

app.post(
  //Lets user add todos to list
  "/lists/:todoListId/todos",
  [
    body("todoTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please enter a todo title.")
      .isLength({ max: 100 })
      .withMessage("Todo title must be between 1 and 100 characters."),
  ],
  (req, res, next) => {
    let todoListId = req.params.todoListId;
    let todoList = findList(+todoListId);
    let errors = validationResult(req);
    let todoTitle = req.body.todoTitle;

    if (todoList === undefined) {
      next(new Error("Not found."));
    } else if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash("error", message.msg));
      res.render("list", {
        todoList: todoList,
        todos: sortTodos(todoList),
        flash: req.flash(),
        todoTitle: todoTitle,
      });
    } else {
      todoList.add(new Todo(todoTitle));
      req.flash("success", `${todoTitle} added!`);
      res.redirect(`/lists/${todoListId}`);
    }
  }
);

app.get("/lists/:todoListId/edit", (req, res, next) => {
  //Renders edit todo page
  let todoListId = req.params.todoListId;
  let todoList = findList(+todoListId);

  if (todoList === undefined) {
    next(new Error("Not found."));
  }

  res.render("edit-list", { todoList });
});

app.post("/lists/:todoListId/destroy", (req, res, next) => {
  //Deletes list
  let todoListId = req.params.todoListId;
  let todoList = findList(+todoListId);

  if (todoList === undefined) {
    next(new Error("Not found."));
  }

  let listIndex = todoLists.indexOf(todoList);
  todoLists.splice(listIndex, 1);

  req.flash("success", `${todoList.title} removed!`);
  res.redirect("/lists");
});

app.post(
  "/lists/:todoListId/edit",
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please enter a list title.")
      .isLength({ max: 100 })
      .withMessage("List title must be between 1 and 100 characters.")
      .custom((title) => {
        let duplicate = todoLists.find((list) => list.title === title);
        return duplicate === undefined;
      })
      .withMessage("List title must be unique."),
  ],
  (req, res, next) => {
    //Changes list title
    let todoListId = req.params.todoListId;
    let todoList = findList(+todoListId);
    let errors = validationResult(req);

    if (todoList === undefined) {
      next(new Error("Not found."));
    } else if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash("error", error.msg));
      res.render("edit-list", {
        flash: req.flash(),
        todoList,
        todoListTitle: req.body.todoListTitle,
      });
    } else {
      todoList.setTitle(req.body.todoListTitle);

      req.flash("success", "Todo name changed.");
      res.redirect(`/lists/${todoListId}`);
    }
  }
);

app.use((err, req, res, _next) => {
  console.log(err); // Writes more extensive information to the console log
  res.status(404).send(err.message);
});

// Listener
app.listen(port, host, () => {
  console.log(`Todos is listening on port ${port} of ${host}!`);
});
