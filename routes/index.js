const express = require('express');
const router = express.Router();
const octokit = require('@octokit/rest')()
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const db = require('../db/model');

const saltRounds = 17;

router.use(bodyParser.urlencoded({ extended: true }))
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

router.use(cors());

function allowUser(req,res,next) { // allow specific user only midleware
    if(!req.body.token) return res.status(403).send({ success: false, message: 'No token' });
    if(!req.body._id) return res.status(403).send({ success: false, message: 'No id' });
    db.AuthToken.findOne({ token: req.body.token }, (err, data) => {
        if(!data) return res.send({success: false,message: "Wrong Token"})
        else {
            
            db.User_Details.findOne({_id: data.id}).then(function(data) {

                if (!data) {
                    res.status(403).send({success: false,message: 'You cannot access other student information'})
                }

                if (data.id == req.params._id || data.id == req.body._id) {
                    console.log("equal!")
                    next();   
                }
                else {
                  console.log("not equal")
                  res.status(403).send({success: false,message: 'You cannot access other student information'})  
                } 
            })
        }
    });
}

router.post('/login', (req, res) => { // login 

        console.log("Logging in...")
        console.log(req.body)

        db.AuthToken.findOne({ username: req.body.username }).then(function(data) {
            if(!data) {
                db.User_Details.findOne({username: req.body.username}).then(function(user){
                    if(!user) return res.send({success: false,message: 'Authentication failed. User not found.'})
                    
                    else {
                        bcrypt.compare(req.body.password,user.password).then(function(data) {
                            if(data) {

                                const payload = {
                                    user: user._id
                                };
                                
                                var token = jwt.sign(payload, "abcdef", {
                                    expiresIn: 60*60*24
                                });

                                db.AuthToken.create({
                                    token: token,
                                    id: user._id,
                                    username: user.data
                                }).then(function(data) {
                                    console.log("Success")
                                    res.send({
                                    success: true,
                                    message: 'token created',
                                    token: token,
                                    _id: user._id
                                })
                            }).catch(function(err){
                                    res.send({success: false,error: err})
                                });

                            } else {
                                res.send({success: false,message: 'Authentication failed. Wrong password.'})
                            }
                        })
                    }

                })
            } else {
            	console.log("data")
                db.User_Details.findOne({_id: data.id}).then(function(user) {
                    bcrypt.compare(req.body.password,user.password).then(function(check) {
                        if(check) {
                          db.AuthToken.findOne({username: req.body.username}).then(function(data) {
                            console.log("Success")
                            res.send({
                            	token: data.token , 
                            	success: true,
                                _id: user._id
                              })
                          })
                        } else {
                            res.send({success: false,message:'Wrong Password'})
                        }
                    })
                })
            }
        }).catch(function(err){
           res.send({success: false,error: err}) 
        })

});

router.post('/logout' , (req,res) => { // logout
    
    db.AuthToken.findOne({token: req.body.token}).then(function(data) {
        if(!data) {
            res.send({ message: 'illegal token' })
        } else {
            data.remove(function(err, user) {
                if (err) {
                    return console.error(err);
                } else {
                    res.send({ success: true, message: "User logged out" });
                }
            });
        }
    }).catch(function(err) {
        console.error(err);
        res.send({success: false,message: 'error'})
    })

});


router.post('/register',(req,res) => { // register a user

	if(!req.body.password) {
        return res.send({success: false,message: 'Password cannot be empty'});
    }

    db.User_Details.findOne({username: req.body.username}).then(function(data) {

        if(data) {
            res.status(400).send({success: false, message: "Username already exists" });
        }

        else {
            
            bcrypt.hash(req.body.password,saltRounds).then(function(hash) {

                db.User_Details.create({

                	username: req.body.username,
					first_name: req.body.first_name,
					last_name: req.body.last_name,
					password: hash

                }).then(function(data) {
                                const payload = {
                                    user: data.username
                                };
                                
                                var token = jwt.sign(payload, "abcdef", {
                                    expiresIn: 60*60*24
                                });

                                db.AuthToken.create({
                                    token: token,
                                    id: data._id,
                                    username: data.username
                                }).then(function(data1) {
                                    res.send({
                                    success: true,
                                    message: 'user created',
                                    token: token,
                                    _id: data._id
                                });
                            }).catch(function(err){
                            	console.log(err);
			                    res.send({ success: false });
                            })

                    
                    }).catch(function(err) {
                    console.log(err);
                    res.send({ success: false });
                })

            });
        }


    })

});


router.get('/', function(req, res, next) {
  res.send({success: true })
});

router.post('/getGists',async (req,res) => {
	const result = await octokit.gists.getPublic()
	res.send({success: true,data: result})
});

router.post('/star',allowUser, (req,res) => {
    console.log(req.body)
	db.Gists.create({
		uid: req.body.uid,
		gist: req.body.gist_url,
        owner: req.body.owner,
        desc: req.body.desc,
        filename: req.body.filename,
        language: req.body.language
	}).then(function(data){
		res.send({success: true})
	}).catch(function(err){
		res.send({success: false,message: err})
	})
});

router.post('/mybucket', allowUser , (req,res) => {

    if(!req.body.uid) {
        console.log("NO UID")
        return res.status(403).send({success: false,message: 'No UID'})
    }
	db.Gists.find({uid: req.body.uid}).then(function(data){
		res.send({success: true,stars: data})
	}).catch(function(err){
		res.send({success: false,error: err})
	})
});

router.post('*',(req,res) => {
	res.send({message: 'Not Found',success: false})
});

router.get('*',(req,res) => {
	res.send({message: 'Not Found',success: false})
});

module.exports = router;
