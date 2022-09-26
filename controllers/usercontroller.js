

const fs = require('fs')
const User = require('../models/userModels')
const catchAsync = require('../utils/catchAsync')

const path = require('path');
const queryController = require('./Querycontroller')
const usersPath = path.join(__dirname, '..', 'resources', 'users.json');
const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));



exports.getAllUser = catchAsync( async(req, res)=>{

    const users = await User.find()
    res.status(200).json({
        status: 'success',
        users: {
            users
        }
    })
})


function validateUser(arr, obj) {
    return new Promise((resolve, reject) => {
        resolve(arr.find((arrObj) => arrObj.email === obj.email));
    });
}

exports.createUser= async(req, res)=>{
    const newUser = req.body
    if (newUser.email && newUser.password){
        console.log(users)
        const user = await queryController.validateUser(users, newUser.email)
        if (user){
            res.status(400).json({
                status: 'fail',
                message: 'Already a user!',
            });
        }
        else{
            if (users.length < 1) {
                newUser['id'] = 1;
            } else {
                newUser['id'] = users[users.length - 1].id + 1;
            }
            newUser["role"] = "reader"
            users.push(newUser);
            try {
                queryController.writeTofile(usersPath, users);
            } catch (err) {
                res.status(500).json({
                    status: 'fail',
                    message: err,
                });
            }
            res.status(201).json({
                status: 'success',
                message: {
                    newUser
                },
            });
        }
        
    }
    else{
        res.status(400).json({
            status: 'fail',
            message:  'email or password not provided!'
        })
    }
}


exports.getUserById = async(req, res) =>{
    const id = +req.params.id
    const user = await queryController.findUser(users, id)
    if (user){
        res.status(200).json({
            status: 'fail',
            user: {
                user
            }
        })
    }
    else{
        res.status(404).json({
            status: 'fail',
            message: `User with id ${id} doesn't exist!`
        })
    }
}

exports.Auth = async(req, res) => {
    const loginDetails = req.body
    if (loginDetails.email && loginDetails.password){
        const user = await queryController.AuthenticateUser(users, loginDetails)
        if (user){
            res.status(200).json({
                status: 'success',
                message: {
                    user
                }
            })
        }
        else{
            res.status(400).json({
                status: 'fail',
                message: 'Incorrect email or password!'
            });
        }
    }
    else{
        res.status(400).json({
            status: 'fail',
            message: 'please provide email or password!'
        });
    }
}

