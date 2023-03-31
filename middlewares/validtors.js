const {check, validationResult} = require('express-validator')


exports.authValidator = [
    check('firstname').trim().not().isEmpty().withMessage('Firstname is required'),
    check('lastname').trim().not().isEmpty().withMessage('Lastname is required'),
    check('email').trim().not().isEmpty().isEmail().withMessage('Email is not valid'),
    check('password').trim().not().isEmpty().withMessage('Password is required'),
]

exports.loginValidator = [
    check('email').trim().not().isEmpty().isEmail().withMessage('Email is not valid'),
    check('password').trim().not().isEmpty().withMessage('Password is requred')
]

exports.categoryValidator = [
    check('name').trim().not().isEmpty().withMessage('Name is required'),
    check('slug').trim().not().isEmpty().withMessage('Slug is required'),
]

exports.validate =(req, res, next)=>{
    const error = validationResult(req).array( )
    if(error.length){
     return res.status(401).json({error: error[0].msg})
    }
    next() // if no error, go to next middleware
}
