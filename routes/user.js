const express = require('express');
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../routes/auth');
const router = express.Router();


router.post('/signup',(req, res, next)=>{

    User.findOne({username:req.body.username})
    .then((user) =>{
    
        if (user != null){
            let err = new Error('Username already exits');
            err.status = 401;
            return next(err);
    
        }
                bcrypt.hash(req.body.password, 10, function(err,hash){
            if(err){
                throw new Error('Could not encrypt password ');
            }
            User.create({ 
                firstName:req.body.firstName,
                lastName:req.body.lastName,
                phoneNumber: req.body.phoneNumber, 
                username: req.body.username,
                password: hash,
                image:req.body.image
            }).then((user) =>{
                let token = jwt.sign({userId: user._id}, process.env.SECRET);
                res.json({status: "Signup Success!", token: token});
            })
        }).catch(next);
    })
    });


    router.post('/login', (req, res, next) => {
        User.findOne({ username: req.body.username })
            .then((user) => {
                if (user == null) {
                    let err = new Error('User not found!');
                    err.status = 401;
                    return next(err);
                } else {
                    bcrypt.compare(req.body.password, user.password)
                        .then((isMatch) => {
                            if (!isMatch) {
                                let err = new Error('Password does not match!');
                                err.status = 401;
                                return next(err);
                            }
                            let token = jwt.sign({ _id: user._id }, process.env.SECRET);
                            res.json({ status: 'Login success!', token: token });
                        }).catch(next);
                }
            }).catch(next);
    })


    router.get('/me', auth.verifyUser, (req, res, next)=>{
        res.json({firstName: req.user.firstName, lastName: req.user.lastName,phoneNumber: req.user.phoneNumber, username: req.user.username, image:user.image })
        })
    
    module.exports = router;