const router = require("express").Router();

const users = require("../module/users/route");
router.use("/users", users);


module.exports = router;
