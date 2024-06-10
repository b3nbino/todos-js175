const express = require("express");
const morgan = require("morgan");

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

app.get("/", (req, res) => {
  res.render("lists", { todoLists: sortTodoLists(todoLists) });
});

// Listener
app.listen(port, host, () => {
  console.log(`Todos is listening on port ${port} of ${host}!`);
});
