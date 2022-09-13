const router = require("express").Router();

const users = require("../module/users/route");
const panggilan = require('../module/pannggilan/route')

router.use("/users", users);
router.use("/panggilan", panggilan);


module.exports = router;
