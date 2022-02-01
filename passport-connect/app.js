//jshint esversion:6
// require('dotenv').config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const session = require('express-session');
// const passport = require("passport");
// const passportLocalMongoose = require('passport-local-mongoose');

// const app = express();

// app.use(express.static('public'));
// app.set('view engine', 'ejs');
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(session({
//     secret: "Maxfiy so'z",
//     resave: false,
//     saveUninitialized: false
// }))

// app.use(passport.initialize());
// app.use(passport.session());



// mongoose.connect("mongodb://localhost:27017/securityDB", { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.set("useCreateIndex", true);

// const userSchema = new mongoose.Schema({
//     username: String,
//     password: String
// });

// userSchema.plugin(passportLocalMongoose);

// const User = mongoose.model("User", userSchema);


// passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());



// app.get("/", function (req, res) {
//     res.render("home");
// })

// app.get("/register", function (req, res) {
//     res.render("register");
// })

// app.get("/secrets", (req, res) => {
//     if (req.isAuthenticated()) {
//         res.render("secrets");
//     } else {
//         res.redirect("/register")
//     }
// })

// app.post("/register", function (req, res) {

//     User.register({ username: req.body.username }, req.body.password, (err, user) => {
//         if (err) {
//             console.log(err);
//             res.redirect("/register");
//         } else {
//             passport.authenticate("local")(req, res, () => {
//                 res.redirect("/secrets");
//             })
//         }
//     })

// })

// app.get("/login", function (req, res) {
//     res.render("login");
// })

// app.post("/login", function (req, res) {

//     const user = new User({
//         username: req.body.username,
//         password: req.body.password
//     })

//     req.login(user, (err) => {
//         if (err) {
//             console.log(err);
//             res.redirect("/register");
//         } else {
//             passport.authenticate("local")(req, res, () => {
//                 res.redirect("/secrets");
//             })
//         }
//     })

// })

// app.get("/logout", (req, res)=>{
//     req.logOut();
//     res.redirect("/");
// })











// app.listen(3000, function (err) {
//     console.log("Server is running on 3000")
// })

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app = express();

app.set("view engine" , "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(session({
    secret: "Maxfiy so'z",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/securityDB", {useNewUrlParser : true, useUnifiedTopology : true});


const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    googleId : String,
    secret   : String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: "769022528960-gbotcta64qvu7346a5tinle9qehh5363.apps.googleusercontent.com",
    clientSecret: "GGtrw02g91F-TVTElqDYywEO",
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get("/", (req,res)=>{
    res.render("home");
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });



app.get("/secrets", (req,res)=>{
    
    User.find({"secret" : {$ne : null}}, (err, foundUsers)=>{
        console.log(foundUsers);
        res.render("secrets", {usersWithSecrets : foundUsers});

    })

})

app.get("/register", (req,res)=>{
    res.render("register");
})

app.post("/register", (req,res)=>{

    User.register({username : req.body.username}, req.body.password, (err, user)=>{
        if(err){
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/secrets");
            })
        }
    })


})



app.get("/login", (req,res)=>{
    res.render("login");
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));


app.post("/login", (req,res)=>{
    const user = new User({
        username : req.body.username,
        password : req.body.password
    })

    req.login(user, (err)=>{
        if(err){
            console.log(err);
        } else {
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/secrets");
            })
        }
    })


})


app.get("/logout", (req,res)=>{
    req.logOut();
    res.redirect("/");
})

app.get("/submit", (req,res)=>{
    if(req.isAuthenticated()){
        res.render("submit");
    } else {
        res.redirect("/login");
    }
})

app.post("/submit", (req,res)=>{
    const submittedSecret = req.body.secret;
    User.findById(req.user.id, (err, foundUser)=>{
        if(err){
            console.log(err);
        }
        if(foundUser){
            foundUser.secret = submittedSecret ;
            foundUser.save();
            res.redirect("/secrets");
        }
    })
})



app.listen(3000 , (err)=>{
    if(err){
        console.log(err);
    } else {
        console.log("Server 3000-portda ishga tushdi !!!");
    }
})




























