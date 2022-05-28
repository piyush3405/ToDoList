//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



//myFirstDatabase?retryWrites=true&w=majority

mongoose.connect("mongodb+srv://admin-piyush:Test123@cluster0.9fsfm.mongodb.net/todolistDB",{useNewUrlParser:true});

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

const itemSchema={
  name:String
};

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name:"Welcome to your Todolist!"
});

const item2=new Item({
  name:"Hit the + button to add a new item."
});

const item3=new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemSchema]  //itemSchema or itemsSchema doubt
};

const List=mongoose.model("List",listSchema);




app.get("/", function(req, res) {

//const day = date.getDate();
Item.find({},function(err,foundItems){

if(foundItems.length===0){
  Item.insertMany(defaultItems,function(err){
    if(err){
    console.log(err);
  }else{
    console.log("Successfully saved default items to DB");
  }
  });
  res.redirect("/");
}else{
  res.render("list", {listTitle: "Today", newListItems: foundItems});
}

});

//  res.render("list", {listTitle: Today, newListItems: items});

});

app.get("/:customListName",function(req,res){
  const customListName=req.params.customListName;
 List.findOne({name:customListName},function(err,foundList){
   if(!err){
     if(!foundList){
       const list=new List({
         name:customListName,
         items:defaultItems
       });
       list.save();
       res.redirect("/"+customListName);
     }else{
       res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
     }
   }
 });

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });


if(listName==="Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundList){
    foundList.item.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}

//  if (req.body.list === "Work") {
  //  workItems.push(item);
    //res.redirect("/work");
  //} else {
    //items.push(item);
    //res.redirect("/");
  //}
});


app.post("/delete",function(req,res){
const checkedItemId=req.body.checkbox;
Item.findByIdAndRemove(checkedItemId,function(err){
  if(!err){
    console.log("Successfully deleted checked item");
    res.redirect("/");

  }
});
});

//app.get("/work", function(req,res){
  //res.render("list", {listTitle: "Work List", newListItems: workItems});
//});

app.get("/about", function(req, res){
  res.render("about");
});

let port=process.env.PORT;
if(port==null || port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
