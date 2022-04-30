// require('dotenv').config();
const express=require('express');
const bp=require('body-parser');
const app=express();
const mongoose=require('mongoose');
const encrypt=require('mongoose-encryption');
const md5=require('md5');
const bcrypt=require('bcrypt');
const salt=10;
mongoose.connect('mongodb://localhost/credit');
const schs=new mongoose.Schema({
    email:String,
    password:String
});
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
    const em=req.body.username;
    const pa=req.body.password;
    bcrypt.hash(pa,salt,function(err,result){
        if(err)
        console.log(err);
        else{
            const dt=new mdl({
                email:em,
                password:result
            });
            dt.save();
            res.redirect('/');
        }
    });
});
app.post('/login',function(req,res){
    const a=req.body.username;
    const b=req.body.password;
    mdl.findOne({email:a},function(err,result){
        if(err)
        console.log(err);
        else{
            if(result)
            {
                
                    bcrypt.compare(b,result.password,function(err,result){
                        if(err)
                        console.log(err);
                        else if(result==true)
                        res.render('secrets');
                        else
                        res.redirect('/login');
                    });
             
                
            }
            else
            res.redirect('/login');
        }
    });
    
});
app.listen(3000,function(){
    console.log('server is listening at port 3000');
});