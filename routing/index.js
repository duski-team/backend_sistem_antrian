const router = require("express").Router();


router.use("/users",require("../module/users/route"))
router.use("/panggilan",require('../module/panggilan/route'))
router.use("/master_layanan",require('../module/master_layanan/route'))
router.use("/ruang_layanan",require('../module/ruang_layanan/route'))
router.use("/master_specialist",require('../module/master_specialist/route'))
router.use("/master_kualifikasi",require('../module/master_kualifikasi/route'))
router.use("/master_poliklinik",require('../module/master_poliklinik/route'))
router.use("/master_bank",require('../module/master_bank/route'))
router.use("/master_dokter",require('../module/master_dokter/route'))
router.use("/jadwal_dokter",require('../module/jadwal_dokter/route'))
router.use("/booking",require('../module/booking/route'))
router.use('/antrian_list',require('../module/antrian_list/route'))
router.use("/jenis_antrian",require('../module/jenis_antrian/route'))
router.use("/master_loket",require('../module/master_loket/route'))
router.use("/antrian_loket",require('../module/antrian_loket/route'))


module.exports = router;
