const router = require("express").Router();


router.use("/users",require("../module/users/route"))
router.use("/panggilan",require('../module/pannggilan/route'))
router.use("/master_layanan",require('../module/master_layanan/route'))
router.use("/ruang_layanan",require('../module/ruang_layanan/route'))


module.exports = router;
