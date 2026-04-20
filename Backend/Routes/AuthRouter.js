const { signup, login ,logout, getProfile} = require("../Controllers/AuthController");
const ensureAuthenticated = require("../Middlewares/Auth");
const { signupValidation, loginValidation } = require("../Middlewares/AuthValidation");

const router = require("express").Router();

//  Logout route
router.post("/logout", logout);
router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);
router.get('/getProfile', ensureAuthenticated, getProfile);

module.exports = router;