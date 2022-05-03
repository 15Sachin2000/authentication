require('dotenv').config();
const express=require('express');
const bp=require('body-parser');
const app=express();
const mongoose=require('mongoose');
const session=require('express-session');
const passport=require('passport');
const passportLocalMongoose=require('passport-local-mongoose');
const findOrCreate=require('mongoose-findorcreate');
app.use(session({
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bp.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect('mongodb://localhost/credit');
const schs=new mongoose.Schema({
    username:String,
    password:String,
    googleId:String
});
schs.plugin(passportLocalMongoose);
schs.plugin(findOrCreate);
const mdl=mongoose.model('register',schs);
passport.use(mdl.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  mdl.findById(id, function(err, user) {
    done(err, user);
  });
});
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    mdl.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
    });
  }
));


  app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));
  app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });
app.get('/',function(req,res){
    res.render('home');
});
app.get('/login',function(req,res){
    res.render('login');
});
app.get('/register',function(req,res){
    res.render('register');
});
app.get('/secrets',function(req,res){
    if(req.isAuthenticated())
    {
        res.render('secrets');
    }
    else
    res.redirect('/login');
})
app.post('/register',function(req,res){
    mdl.register({username:req.body.username},req.body.password,function(err,user){
        if(err)
        {
            console.log(err);
            res.redirect('/register');
        }
        else
        {
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secrets');
            });
        }
    });
});
app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
})
app.post('/login',function(req,res){
    const chk=new mdl({
        username:req.body.username,
        password:req.body.password
    });
    req.login(chk,function(err){
        if(err)
        {
            console.log(err);
            res.redirect('/login');
        }
        else
        {
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secrets');
            });
        }
    });
});
app.listen(3000,function(){
    console.log('server is listening at port 3000');
});