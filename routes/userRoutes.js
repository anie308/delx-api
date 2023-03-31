const { createUser, loginUser } = require('../controllers/userController');
const { authValidator, loginValidator } = require('../middlewares/validtors');

const router = require('express').Router();

router.post('/signup', authValidator, createUser);
router.post('/signin', loginValidator, loginUser);

module.exports =  router;