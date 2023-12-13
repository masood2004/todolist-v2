//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://SyedMasoodHussain:Syed3288@cluster0.wquji70.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("item", itemsSchema); 

const item1 = new Item ({
  name: "Welcome to your TodoList!",
});

const item2 = new Item ({
  name: "Hit the + button to add a new item",
});

const item3 = new Item ({
  name: "<== Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  
  Item.find({})
  .then((foundItems) => {
    
    if (foundItems.length === 0){
      Item.insertMany(defaultItems)
        .then((result) => {
          // Handle the result here
          console.log(result);
        })
        .catch((error) => {
          // Handle any errors
          console.error(error);
        });
        res.redirect("/");
    } 
    
    else{
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

    
  })
  .catch((error) => {
    // Handle any errors
    console.error(error);
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {

    List.findOne({ name: listName })
  .then((foundList) => {
    if (foundList) {
      foundList.items.push(item);
      return foundList.save();
    } else {
      // Handle case when the list is not found
      // For example, you could throw an error
      throw new Error("List not found");
    }
  })
  .then(() => {
    res.redirect("/" + listName);
  })
  .catch((err) => {
    // Handle any errors that occur during the process
    // For example, you could log the error and send an error response
    console.error(err);
    res.status(500).send("Internal Server Error");
  });

    
  }


});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemId)
      .then(() => {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      })
      .catch((err) => {
        // Handle error
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then((foundList) => {
        if (foundList) {
          res.redirect("/" + listName);
        } else {
          // Handle case when list is not found
          // ...
        }
      })
      .catch((err) => {
        // Handle error
      });
  }
  


})

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
  .then((foundList) => {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    
      list.save();
     res.redirect("/" + customListName)
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  })
  .catch((err) => {
    // Handle error
  });



});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
