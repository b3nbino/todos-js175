const express = require("express");
const morgan = require("morgan");
const TodoList = require("./lib/todolist");
const express_validator = require("express-validator");
let body = express_validator.body;

const app = express();
const host = "localhost";
const port = 3000;

let todoLists = require("./lib/seed-data");

function sortTodoLists(list) {
  function titleSort(listA, listB) {
    let titleA = listA.title.toLowerCase();
    let titleB = listB.title.toLowerCase();

    if (titleA < titleB) {
      return -1;
    } else if (titleA > titleB) {
      return 1;
    } else {
      return 0;
    }
  }

  let doneList = list.filter((currList) => currList.isDone());
  let undoneList = list.filter((currList) => !currList.isDone());

  doneList = doneList.sort(titleSort);
  undoneList = undoneList.sort(titleSort);

  return undoneList.concat(doneList);
}

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.redirect("/lists");
});

app.get("/lists", (req, res) => {
  res.render("lists", { todoLists: sortTodoLists(todoLists) });
});

app.get("/lists/new", (req, res) => {
  res.render("new-list");
});

app.post("/lists", (req, res) => {
  let title = req.body.todoListTitle.trim();

  if (title.length === 0) {
    res.render("new-list", {
      errorMessage: "Please enter a list title.",
    });
  } else if (title.length > 100) {
    res.render("new-list", {
      errorMessage: "Title length cannot exceed 100 characters.",
      todoListTitle: title,
    });
  } else if (todoLists.some((list) => list.getTitle() === title)) {
    res.render("new-list", {
      errorMessage: "Duplicate title. Please enter a unique title.",
      todoListTitle: title,
    });
  } else {
    todoLists.push(new TodoList(title));
    res.redirect("/lists");
  }
});

// Listener
app.listen(port, host, () => {
  console.log(`Todos is listening on port ${port} of ${host}!`);
});
