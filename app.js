const express = require('express')
const bodyParser= require("body-parser")
const mongoose= require("mongoose")
const _ = require("lodash");

const app = express()

app.set('view engine', 'ejs');  

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))

const ejs = require('ejs');

mongoose.connect("mongodb+srv://aniselachkar:NvBYkUw9hes2UMqM@cluster0.ip6e03r.mongodb.net/todolistDB")


// create a schema for the home page 
const ItemsSchema = new mongoose.Schema({
    name: String,
})
    
// use the home page schema to create a mongoose model
const ItemsModel = mongoose.model ("Item", ItemsSchema)

// create documents in the hope page schema 
const item1= new ItemsModel({
    name:"Welcome to your to do list"
  })
  
const item2= new ItemsModel({
    name:"Hit the +  button to add an item"
  })

const item3= new ItemsModel({
    name:"<-- Hit this to delete an item"
  })

const defaultItems= [item1, item2, item3]

// create scheme for the custom pages 
const ListSchema = new mongoose.Schema({
    name: String,
    items: [ItemsSchema]
})

// use the list schema to create a model 
const listModel = mongoose.model ("List", ListSchema)





app.get('/', function(req, res) {  

ItemsModel.find({},function(err, foundItems){

        if (foundItems.length == 0){

        // save the documents
        ItemsModel.insertMany(defaultItems, function(err){
            if(err){
              console.log(err)
            } else {
              console.log("initial documents saved into collection")
            }
          })   
          res.redirect("/")                
    }
            else{
        
            res.render('index', {listTitle:"Today", newListItems: foundItems})
            }


      })

});

    
app.get("/:customListName", function(req, res){
    const customListName = _.lowerCase(req.params.customListName);

    listModel.findOne({name:customListName}, function(err,foundList){
        if (err) {
            console.log(err)
        }
        else{
        if (!foundList){
            const list = new listModel({
                name: customListName,
                items: defaultItems
                });
            list.save()
            res.redirect("/"+customListName)
        }
        else{
            res.render('index', {listTitle:foundList.name, newListItems: foundList.items})

        }
        }
    })
       



});


app.post("/", (req, res) => {

    const listName= req.body.list

    const item= new ItemsModel({
    name:req.body.newItem})

    if(listName=="Today"){
        item.save()
        res.redirect('/')}
    else{
        listModel.findOne({name: listName}, function(err,foundList){
            foundList.items.push(item)
            foundList.save()
            res.redirect("/"+listName)
        })
    }

        })
  


    app.post("/delete", (req, res) => {
        const checkedItemId= req.body.deletedItem
        const listName= req.body.listName

        if(listName=="Today"){
            ItemsModel.findByIdAndRemove(checkedItemId, function(err){
                if(err){
                console.log(err)
                }
                else{
            res.redirect('/')
                }
            })
        }
        else{
        listModel.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+listName)}
        })}})

                


        let port = process.env.PORT;
        if (port == null || port == "") {
          port = 3000;
        }
        app.listen(port);


app.listen(port, () => {
  console.log(`server started`)
})