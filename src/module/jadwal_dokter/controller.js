const jadwal_dokter = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const axios = require('axios');
const moment = require('moment');
const cron = require('node-cron');
moment.locale('id')
const purworejo = process.env.HOST_PURWOREJO
const config = require("../../helper/config").config
const { createClient } = require("redis")
const client = createClient({ url: `redis://${process.env.HOST_REDIS}:${process.env.PORT_REDIS}`, legacyMode: true });
const ClusterCronJob = require('cron-cluster')(client, { key: "leaderKey" }).CronJob;
client.connect().catch(console.error)


// function syncJadwal() {
//     var job = new ClusterCronJob('*/2 * * * * *', function () {
//         console.log(moment().format(), "berhasil");
//         // console.log("tessssssssssssssssss");
//     },
//       null,
//       true,
//      "Asia/Jakarta"
//     )
//     job.start()
// }

function syncJadwal() {
    var job = new ClusterCronJob('0 1 * * *', async function () {
        try {
            // let curdate = moment().format('YYYY-MM-DD')
            let curdate= moment().add(2,'d').format('YYYY-MM-DD')
            let cekJadwal = await sq.query(`select * from jadwal_dokter jd where jd."deletedAt" isnull and date(waktu_mulai) = '${curdate}' and date(waktu_selesai) = '${curdate}'`,s);
            if(cekJadwal.length>0){
                console.log("data sudah ada");
            }else{
                let kirim = await axios.get(purworejo + "/get-jadwal-per-tgl?tgl=" + curdate, config)
                let datanya = kirim.data.data
                let bulknya = []
                // console.log(kirim.data.data);
                for (let i = 0; i < datanya.length; i++) {
                    let awal = moment(datanya[i].dariJam, ["h:mm A"]).format("HH:mm:ss");
                    let akhir = moment(datanya[i].sampaiJam, ["h:mm A"]).format("HH:mm:ss");
                    if (datanya[i].isCuti == 0) {
                        // console.log(curdate+" "+awal);
                        bulknya.push({
                            id: uuid_v4(),
                            waktu_mulai: curdate + " " + awal,
                            waktu_selesai: curdate + " " + akhir,
                            kuota: datanya[i].kuota,
                            kuota_mobile: datanya[i].kuotaOnline,
                            dokter_id: datanya[i].idDokter,
                            poli_id: datanya[i].idPoli
                        })
                    }
                }
                await jadwal_dokter.bulkCreate(bulknya)
                console.log("berhasil");
            }
        } catch (error) {
            console.log(error);
        }
    },
      null,
      true,
     "Asia/Jakarta"
    )
    job.start()
}
syncJadwal()

class Controller {

    static register(req, res) {
        const { waktu_mulai, waktu_selesai, kode_jadwal, kuota, master_poliklinik_id, master_dokter_id, master_layanan_id } = req.body

        jadwal_dokter.create({ id: uuid_v4(), waktu_mulai, waktu_selesai, kode_jadwal, kuota, master_poliklinik_id, master_dokter_id, master_layanan_id }).then(hasil2 => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, waktu_mulai, waktu_selesai, kode_jadwal, kuota, master_poliklinik_id, master_dokter_id, master_layanan_id } = req.body

        jadwal_dokter.update({ waktu_mulai, waktu_selesai, kode_jadwal, kuota, master_poliklinik_id, master_dokter_id, master_layanan_id }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {


    }

    static delete(req, res) {
        const { id } = req.body

        jadwal_dokter.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async syncJadwal(req, res) {

        try {
            // let curdate = moment().format('YYYY-MM-DD')
            let curdate= moment().add(2,'d').format('YYYY-MM-DD')
            let cekJadwal = await sq.query(`select * from jadwal_dokter jd where jd."deletedAt" isnull and date(waktu_mulai) = '${curdate}' and date(waktu_selesai) = '${curdate}'`, s);
            if (cekJadwal.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada", data: cekJadwal })
            } else {
                let kirim = await axios.get(purworejo + "/get-jadwal-per-tgl?tgl=" + curdate, config)
                let datanya = kirim.data.data
                let bulknya = []
                // console.log(kirim.data.data);
                for (let i = 0; i < datanya.length; i++) {
                    let awal = moment(datanya[i].dariJam, ["h:mm A"]).format("HH:mm:ss");
                    let akhir = moment(datanya[i].sampaiJam, ["h:mm A"]).format("HH:mm:ss");
                    if (datanya[i].isCuti == 0) {
                        // console.log(curdate+" "+awal);
                        bulknya.push({
                            id: uuid_v4(),
                            waktu_mulai: curdate + " " + awal,
                            waktu_selesai: curdate + " " + akhir,
                            kuota: datanya[i].kuota,
                            kuota_mobile: datanya[i].kuotaOnline,
                            dokter_id: datanya[i].idDokter,
                            poli_id: datanya[i].idPoli
                        })
                    }
                }
                await jadwal_dokter.bulkCreate(bulknya)
                res.status(200).json({ status: 200, message: "sukses", data: bulknya })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listDokterByTanggalPoli(req, res) {
        const { poli_id, tanggal } = req.body
        try {
            // let tanggal= moment().format('YYYY-MM-DD')
            let data1 = await axios.get(purworejo + "/get-dokter", config)
            let dokternya = data1.data.data
            let data2 = await sq.query(`select * from jadwal_dokter jd where jd."deletedAt" isnull and date(jd.waktu_mulai)='${tanggal}'`, s)
            let jadwalnya = data2

            // console.log(jadwalnya.length);
            let hasilnya = []

            for (let i = 0; i < jadwalnya.length; i++) {
                if (poli_id == jadwalnya[i].poli_id) {
                    for (let j = 0; j < dokternya.length; j++) {
                        if (jadwalnya[i].dokter_id == dokternya[j].id) {
                            let ada = false
                            for (let k = 0; k < hasilnya.length; k++) {
                                if (dokternya[j].id == hasilnya[k].id) {
                                    ada == true
                                }
                            }
                            if (ada == false) {
                                hasilnya.push(dokternya[j])
                            }
                        }
                    }
                }

            }

            res.status(200).json({ status: 200, message: "sukses", data: hasilnya })

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listJadwalByDokterTanggalPoli(req, res) {
        const { dokter_id, poli_id, tanggal } = req.body
        try {

            let data = await sq.query(`select * from jadwal_dokter jd where jd."deletedAt" isnull and jd.dokter_id = '${dokter_id}' and poli_id = '${poli_id}' and date(waktu_mulai)='${tanggal}'`, s)
            let kuota = await sq.query(`select count(*)as total from booking b 
            join jadwal_dokter jd on jd.id = b.jadwal_dokter_id
            where b."deletedAt" isnull and date(b.tanggal_booking) = '${tanggal}' and b.status_booking > 0 and jd.dokter_id = '${dokter_id}'`, s);

            let kirim = await axios.get(purworejo + "/get-poli", config)
            let polinya = kirim.data.data
            let kirim2 = await axios.get(purworejo + "/get-dokter", config)
            let dokternya = kirim2.data.data

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < polinya.length; j++) {
                    if (data[i].poli_id == polinya[j].id) {
                        data[i].nama_poli = polinya[j].nama
                    }
                }
                for (let k = 0; k < dokternya.length; k++) {
                    if (data[i].dokter_id == dokternya[k].id) {
                        data[i].nama_dokter = dokternya[k].nama
                        data[i].kode_dokter = dokternya[k].idDokterBpjs
                    }
                }
            }
            data[0].kuota_terbooking = kuota[0].total
            data[0].sisa_kuota = +data[0].kuota_mobile - +kuota[0].total

            res.status(200).json({ status: 200, message: "sukses", data: data })

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params
        try {
            let data = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd where jd."deletedAt" isnull and jd.id = '${id}'`, s)
            let kirim = await axios.get(purworejo + "/get-poli", config)
            let polinya = kirim.data.data
            let kirim2 = await axios.get(purworejo + "/get-dokter", config)
            let dokternya = kirim2.data.data

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < polinya.length; j++) {
                    if (data[i].poli_id == polinya[j].id) {
                        data[i].nama_poli = polinya[j].nama
                        data[i].kode_antrean = polinya[j].kdAntrean
                        data[i].kode_poli_bpjs = polinya[j].kdPoliBpjs
                    }
                }
                for (let l = 0; l < dokternya.length; l++) {
                    if (data[i].dokter_id == dokternya[l].id) {
                        data[i].nama_dokter = dokternya[l].nama
                    }
                }
            }

            res.status(200).json({ status: 200, message: "sukses", data })

        } catch (error) {
            if (error.name = "AxiosError") {
                let respon_error = error.response.data
                res.status(201).json({ status: respon_error.code, message: respon_error.message })
            } else {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            }
        }
    }

    static async listJadwalDokterByPoliId(req, res) {
        const { poli_id } = req.body
        try {
            let data = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd where jd."deletedAt" isnull and jd.poli_id ='${poli_id}'`, s)
            let kirim2 = await axios.get(purworejo + "/get-dokter", config)
            let dokternya = kirim2.data.data

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < dokternya.length; j++) {
                    if (data[i].dokter_id == dokternya[j].id) {
                        data[i].nama_dokter = dokternya[j].nama
                    }
                }
            }
            res.status(200).json({ status: 200, message: "sukses", data: data })

        } catch (error) {
            if (error.name = "AxiosError") {
                let respon_error = error.response.data
                res.status(201).json({ status: respon_error.code, message: respon_error.message })
            } else {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            }
        }
    }

}

module.exports = Controller