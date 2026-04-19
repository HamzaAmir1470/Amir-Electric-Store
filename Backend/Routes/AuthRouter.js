const { signup, login ,logout} = require("../Controllers/AuthController");
const { signupValidation, loginValidation } = require("../Middlewares/AuthValidation");

const router = require("express").Router();

//  Logout route
router.post("/logout", logout);
router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);

module.exports = router;