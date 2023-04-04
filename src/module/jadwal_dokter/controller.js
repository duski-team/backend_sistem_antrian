const jadwal_dokter = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const axios = require('axios');
const moment = require('moment');
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
            let curdate= moment().add(3,'d').format('YYYY-MM-DD')
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
                            poli_id: datanya[i].idPoli,
                            kode_jadwal: `${moment(curdate).format("YYMMDD")}${datanya[i].idJadwal}`
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
        const { waktu_mulai, waktu_selesai, kode_jadwal, kuota, kuota_mobile, dokter_id, poli_id } = req.body

        jadwal_dokter.create({ id: uuid_v4(), waktu_mulai, waktu_selesai, kode_jadwal, kuota, kuota_mobile, dokter_id, poli_id }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, waktu_mulai, waktu_selesai, kode_jadwal, kuota, kuota_mobile, dokter_id, poli_id } = req.body

        jadwal_dokter.update({ waktu_mulai, waktu_selesai, kode_jadwal, kuota, kuota_mobile, dokter_id, poli_id }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const {tanggal,dokter_id,poli_id} = req.body

        try {
            let isi = ''
            if(tanggal){
                isi+=`and date(jd.waktu_mulai) = '${tanggal}' `
            }
            if(dokter_id){
                isi+=`and jd.dokter_id = '${dokter_id}' `
            }
            if(poli_id){
                isi+=`and jd.poli_id = '${poli_id}' `
            }

            let data = await sq.query(`select jd.id as jadwal_dokter_id,* from jadwal_dokter jd where jd."deletedAt" isnull ${isi} order by jd.waktu_mulai desc`,s)
            let dataPoli = await axios.get(purworejo + "/get-poli", config)
            let dataDokter = await axios.get(purworejo + "/get-dokter", config)
            let poli = dataPoli.data.data
            let dokter = dataDokter.data.data
            
            for (let i = 0; i < data.length; i++) {
                data[i].nama_poli = ""
                data[i].kode_poli_bpjs = ""
                data[i].kode_antrean = ""
                data[i].nama_dokter = ""
                data[i].id_dokter_bpjs = ""
                for (let j = 0; j < poli.length; j++) {
                    if(data[i].poli_id == poli[j].id){
                        data[i].nama_poli = poli[j].nama
                        data[i].kode_poli_bpjs = poli[j].kdPoliBpjs
                        data[i].kode_antrean = poli[j].kdAntrean
                    }
                }
                for (let j = 0; j < dokter.length; j++) {
                    if(data[i].dokter_id == dokter[j].id){
                        data[i].nama_dokter = dokter[j].nama
                        data[i].id_dokter_bpjs = dokter[j].idDokterBpjs
                    }
                }
            }

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
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
            let curdate= moment().add(4,'d').format('YYYY-MM-DD')
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
                            poli_id: datanya[i].idPoli,
                            kode_jadwal: `${moment().format("YYMMDD")}${datanya[i].idJadwal}`
                        })
                    }
                }
                // await jadwal_dokter.bulkCreate(bulknya)
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
                data[i].kuota_terbooking = kuota[0].total
                data[i].sisa_kuota = +data[i].kuota_mobile - +kuota[0].total
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
    
    static async syncJadwalDokter (req,res){
        try {
            let h0= moment().add(0,'d').format('YYYY-MM-DD')
            let h1= moment().add(1,'d').format('YYYY-MM-DD')
            let h2= moment().add(2,'d').format('YYYY-MM-DD')
            let h3= moment().add(3,'d').format('YYYY-MM-DD')
            let cekH0 = await sq.query(`select * from jadwal_dokter jd where jd."deletedAt" isnull and date(waktu_mulai) = '${h0}'`, s);
            let cekH1 = await sq.query(`select * from jadwal_dokter jd where jd."deletedAt" isnull and date(waktu_mulai) = '${h1}'`, s);
            let cekH2 = await sq.query(`select * from jadwal_dokter jd where jd."deletedAt" isnull and date(waktu_mulai) = '${h2}'`, s);
            let cekH3 = await sq.query(`select * from jadwal_dokter jd where jd."deletedAt" isnull and date(waktu_mulai) = '${h3}'`, s);
            let hasil = []

            if(cekH0.length>0){
                let kirim = await axios.get(purworejo + "/get-jadwal-per-tgl?tgl=" + h0, config)
                let data = kirim.data.data
                for (let i = 0; i < data.length; i++) {
                    let awal = moment(data[i].dariJam, ["h:mm A"]).format("HH:mm:ss");
                    let akhir = moment(data[i].sampaiJam, ["h:mm A"]).format("HH:mm:ss");
                    let x = {}
                    x.id = uuid_v4();
                    x.waktu_mulai= h0 + " " + awal
                    x.waktu_selesai= h0 + " " + akhir
                    x.kode_jadwal= `${moment(h0).format("YYMMDD")}${data[i].idJadwal}`
                    x.kuota= data[i].kuota
                    x.kuota_mobile= data[i].kuotaOnline
                    x.dokter_id= data[i].idDokter
                    x.poli_id= data[i].idPoli
                    for (let j = 0; j < cekH0.length; j++) {
                        if(cekH0[j].kode_jadwal == x.kode_jadwal){
                            x.id = cekH0[j].id
                        }
                    }
                    hasil.push(x)
                }
                // console.log(data);
                // console.log("=================H0=================");
                // console.log(cekH0);
            }
            if(cekH1.length>0){
                let kirim = await axios.get(purworejo + "/get-jadwal-per-tgl?tgl=" + h1, config)
                let data = kirim.data.data
                for (let i = 0; i < data.length; i++) {
                    let awal = moment(data[i].dariJam, ["h:mm A"]).format("HH:mm:ss");
                    let akhir = moment(data[i].sampaiJam, ["h:mm A"]).format("HH:mm:ss");
                    let x = {}
                    x.id = uuid_v4();
                    x.waktu_mulai= h1 + " " + awal
                    x.waktu_selesai= h1 + " " + akhir
                    x.kode_jadwal= `${moment(h1).format("YYMMDD")}${data[i].idJadwal}`
                    x.kuota= data[i].kuota
                    x.kuota_mobile= data[i].kuotaOnline
                    x.dokter_id= data[i].idDokter
                    x.poli_id= data[i].idPoli
                    for (let j = 0; j < cekH1.length; j++) {
                        if(cekH1[j].kode_jadwal == x.kode_jadwal){
                            x.id = cekH1[j].id
                        }
                    }
                    hasil.push(x)
                }
                // console.log(data);
                // console.log("================H1==================");
                // console.log(cekH1);

            }
            if(cekH2.length>0){
                let kirim = await axios.get(purworejo + "/get-jadwal-per-tgl?tgl=" + h2, config)
                let data = kirim.data.data
                for (let i = 0; i < data.length; i++) {
                    let awal = moment(data[i].dariJam, ["h:mm A"]).format("HH:mm:ss");
                    let akhir = moment(data[i].sampaiJam, ["h:mm A"]).format("HH:mm:ss");
                    let x = {}
                    x.id = uuid_v4();
                    x.waktu_mulai= h2 + " " + awal
                    x.waktu_selesai= h2 + " " + akhir
                    x.kode_jadwal= `${moment(h2).format("YYMMDD")}${data[i].idJadwal}`
                    x.kuota= data[i].kuota
                    x.kuota_mobile= data[i].kuotaOnline
                    x.dokter_id= data[i].idDokter
                    x.poli_id= data[i].idPoli
                    for (let j = 0; j < cekH2.length; j++) {
                        if(cekH2[j].kode_jadwal == x.kode_jadwal){
                            x.id = cekH2[j].id
                        }
                    }
                    hasil.push(x)
                }
                // console.log(data);
                // console.log("===============H2===================");
                // console.log(cekH2);
                // console.log(cekH2.length);
            }
            if(cekH3.length > 0){
                let kirim = await axios.get(purworejo + "/get-jadwal-per-tgl?tgl=" + h3, config)
                let data = kirim.data.data
                for (let i = 0; i < data.length; i++) {
                    let awal = moment(data[i].dariJam, ["h:mm A"]).format("HH:mm:ss");
                    let akhir = moment(data[i].sampaiJam, ["h:mm A"]).format("HH:mm:ss");
                    let x = {}
                    x.id = uuid_v4();
                    x.waktu_mulai= h3 + " " + awal
                    x.waktu_selesai= h3 + " " + akhir
                    x.kode_jadwal= `${moment(h3).format("YYMMDD")}${data[i].idJadwal}`
                    x.kuota= data[i].kuota
                    x.kuota_mobile= data[i].kuotaOnline
                    x.dokter_id= data[i].idDokter
                    x.poli_id= data[i].idPoli
                    for (let j = 0; j < cekH3.length; j++) {
                        if(cekH3[j].kode_jadwal == x.kode_jadwal){
                            x.id = cekH3[j].id
                        }
                    }
                    hasil.push(x)
                }
                // console.log(data);
                // console.log("===============H3===================");
                // console.log(cekH3);
                // console.log(cekH3.length);
            }

            // await jadwal_dokter.bulkCreate(hasil,{updateOnDuplicate:['waktu_mulai','waktu_selesai','kode_jadwal','kuota','kuota_mobile','dokter_id','poli_id','updatedAt']})
            res.status(200).json({ status: 200, message: "sukses",total:hasil.length,data:hasil })
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err })
        }
    }
}

module.exports = Controller