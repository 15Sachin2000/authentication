require('dotenv').config();
const express=require('express');
const bp=require('body-parser');
const app=express();
const mongoose=require('mongoose');
const encrypt=require('mongoose-encryption');
const md5=require('md5');
mongoose.connect('mongodb://localhost/credit');
const schs=new mongoose.Schema({
    email:String,
    password:String
});
//console.log(process.env);
//schs.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});
const mdl=mongoose.model('register',schs);
app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bp.urlencoded({extended:true}));
app.get('/',function(req,res){
    res.render('home');
});
app.get('/login',function(req,res){
    res.render('login');
});
app.get('/register',function(req,res){
    res.render('register');
});
app.post('/register',function(req,res){
  //  console.log(req.body);
    const em=req.body.username;
    const pa=md5(req.body.password);
    const dt=new mdl({
        email:em,
        password:pa
    });
    dt.save();
    res.redirect('/');
});
app.post('/login',function(req,res){
    const a=req.body.username;
    const b=md5(req.body.password);
    mdl.findOne({email:a},function(err,result){
        if(err)
        console.log(err);
        else{
            if(result)
            {
                if(result.password===b)
                res.render('secrets');
                else
                res.redirect('/login');
            }
            else
            res.redirect('/login');
        }
    });
    
});
app.listen(3000,function(){
    console.log('server is listening at port 3000');
});