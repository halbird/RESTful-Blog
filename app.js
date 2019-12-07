const dotenv = require('dotenv');
dotenv.config();

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");


// App configuration    
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false)
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());



// Mongoose, schema and model configuration
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);


// Create a test blog
    // Blog.create({
    //     title: "Test Blog",
    //     image: "https://media.mnn.com/assets/images/2019/02/labradoodle.jpg.653x0_q80_crop-smart.jpg",
    //     body: "This is a test blog about doooooodles"
    // });

// RESTful routes

// INDEX /blogs get
app.get("/", function(req, res){
    res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else{
            res.render("index", {blogs: blogs});
        }
    });
});


// NEW /blogs/new get
app.get("/blogs/new", function(req, res){
    res.render("new");
});


// CREATE /blogs post
app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            console.log(err);
            res.redirect("new");
        } else {
            res.redirect("/blogs"); // usually redirects to the show page actually
        }
    });
});


// SHOW /blogs/:id get
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err);
            res.redirect("/blogs");
        } else{
            res.render("show", {blog: foundBlog});
        }
    });
});


// EDIT /blogs/:id/edit get
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err);
            res.redirect("/blogs");
        } else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE /blogs/:id put
app.put("/blogs/:id", function(req, res){
    // find blog with that ID and update it, arguments: id, newData, callback
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});


// DESTROY /blogs/:id delete
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});






app.listen(process.env.PORT, function(){
    console.log(`blog server started on port ${process.env.PORT}`);
});
