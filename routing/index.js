const router = require("express").Router();


router.use("/users",require("../module/users/route"))
router.use("/panggilan",require('../module/panggilan/route'))
router.use("/master_layanan",require('../module/master_layanan/route'))
router.use("/ruang_layanan",require('../module/ruang_layanan/route'))
router.use("/master_specialist",require('../module/master_specialist/route'))
router.use("/master_kualifikasi",require('../module/master_kualifikasi/route'))
router.use("/master_poliklinik",require('../module/master_poliklinik/route'))

module.exports = router;
