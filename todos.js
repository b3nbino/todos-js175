const express = require("express");
const morgan = require("morgan");
const TodoList = require("./lib/todolist");

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
  todoLists.push(new TodoList(title));
  res.redirect("/lists");
});

// Listener
app.listen(port, host, () => {
  console.log(`Todos is listening on port ${port} of ${host}!`);
});
