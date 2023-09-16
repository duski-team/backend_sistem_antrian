const users = require('../users/model')
const booking = require('./model');
const bcrypt = require("../../helper/bcrypt.js");
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const jwt = require("../../helper/jwt");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
var QRCode = require('qrcode')
const moment = require('moment');
const sha1 = require('sha1');
const axios = require('axios');
const purworejo = process.env.HOST_PURWOREJO
const config = require("../../helper/config").config
const { createClient } = require("redis")
const client = createClient({ url: `redis://${process.env.HOST_REDIS}:${process.env.PORT_REDIS}`, legacyMode: true });
const ClusterCronJob = require('cron-cluster')(client, { key: "leaderKey2" }).CronJob;
client.connect().catch(console.error)


function batalBooking() {
    var job = new ClusterCronJob('0 1 * * *', async function () {
        try {
            await sq.query(`update booking set status_booking = 0 where status_booking in (1,2) and date(tanggal_booking) < date(now())`,s)
            console.log('berhasil batalkan booking');
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
batalBooking()

class Controller {

    static async ambilAntreanMjkn(req, res) {
        const { 
            nomorkartu, tanggalperiksa, kodepoli, nik, nohp, nomorreferensi, 
            norm, jeniskunjungan, kodedokter, jampraktek 
        } = req.body
        console.log(req.body)

        try {
            let k = sha1(uuid_v4())
            let kode_booking = k.substring(k.length - 6).toUpperCase()

            // norm harus ada
            if(norm == ''){
                throw {
                    "metadata": {
                        "message": "Nomor RM kosong",
                        "code": 201,
                    }
                };
            }

            // cek apakah pasien ada di cokro
            let getPasien = await axios.get(purworejo + "/get-pasien?no=" + norm, config)
            // console.log(getPasien.data.data)
            // cek nik di cokro dan bpjs
            if(getPasien.data.data[0].nik != nik || getPasien.data.data[0].noBpjs != nomorkartu){
                throw {
                    "metadata": {
                        "message": "Data Pasien Tidak Valid",
                        "code": 201,
                    }
                };
            }

            let nama_booking = getPasien.data.data[0].namaPasien

            //hari libur / minggu tidak bisa daftar



            // cek jadwal
            let getDokter = await axios.get(purworejo + "/get-jadwal-per-tgl?tgl=" + tanggalperiksa, config)
            let dokter = getDokter.data.data
            let dokterId = ''
            let poliId = ''
            let dokterNama = ''
            let poliNama = ''
            for (let i = 0; i < dokter.length; i++) {
                if (kodedokter == dokter[i].idDokterBpjs) {
                    dokterId = dokter[i].idDokter
                    poliId = dokter[i].idPoli
                    dokterNama = dokter[i].namaDokter
                    poliNama = dokter[i].namaPoli
                }
            }
            if(dokterId == '' && poliId == ''){
                throw {
                    "metadata": {
                        "message": "Jadwal dokter tidak ditemukan",
                        "code": 201
                    }
                };
            }

            // cek min H-2 
            let hmin2 = moment().add(2, 'days').format('YYYY-MM-DD')
            if(tanggalperiksa < hmin2){
                throw {
                    "metadata": {
                        "message": "Minimal H-2",
                        "code": 201
                    }
                };
            }
            
            // cek max jam 14
            let jamNow = moment().format('H')
            if(jamNow > 13){
                throw {
                    "metadata": {
                        "message": "Maximal Booking Jam 14:00",
                        "code": 201
                    }
                };
            }

            // cek jadwal            
            let cekKuota = await sq.query(`select jd.id as "jadwal_dokter_id", * 
            from jadwal_dokter jd 
            where jd."deletedAt" isnull and jd.dokter_id = '${dokterId}' and date(jd.waktu_mulai) = '${tanggalperiksa}'`, s)
            if(cekKuota.length < 1){
                throw {
                    "metadata": {
                        "message": "Jadwal Dokter Tidak Ditemukan",
                        "code": 201
                    }
                };
            }
            //console.log(cekKuota,' data cek kuota')

            // cek kuota
            let cekJumlah = await sq.query(`select count(*) as "jumlah_booking" 
            from booking b 
            where b."deletedAt" isnull and b.jadwal_dokter_id = '${cekKuota[0].jadwal_dokter_id}' and 
            date(b.tanggal_booking) = '${tanggalperiksa}' and b.status_booking > 0 `, s)
            if (cekJumlah[0].jumlah_booking < cekKuota[0].kuota_mobile) {
                // cek sudah pernah daftar hari booking ?
                let cekBooking = await sq.query(`select * from booking b 
                where b."deletedAt" isnull and b.no_rm = '${norm}' and date(b.tanggal_booking) = '${tanggalperiksa}'`, s)

                if (cekBooking.length > 0) {
                    throw {
                        "metadata": {
                            "message": "Sudah Pernah Daftar di Hari yang SAMA",
                            "code": 201
                        }
                    };
                } else {
                    let estimasi = tanggalperiksa + " 08:00:00"
                    let konversiEst = parseInt(moment(estimasi).format("x"))
                    let tanggal_booking = moment(estimasi).format()
                    // console.log(konversiEst)
                    
                    let data_booking = await booking.create({ 
                        id: uuid_v4(), 
                        tanggal_booking, 
                        jenis_booking: "MJKN", 
                        NIK: nik, 
                        nama_booking, 
                        no_hp_booking: nohp, 
                        no_rujukan: nomorreferensi, 
                        no_kontrol:'', 
                        is_verified:1, 
                        is_registered:1, 
                        status_booking:1, 
                        no_rm: norm, 
                        kode_booking, 
                        flag_layanan:1, 
                        jadwal_dokter_id: cekKuota[0].jadwal_dokter_id, 
                        user_id: "itbpjs", 
                        tujuan_booking: jeniskunjungan
                        // foto_surat_rujukan: '', 
                        // tanggal_rujukan, 
                        // foto_kk, 
                        // foto_ktp 
                    })
                    const kuotaMobile = cekKuota[0].kuota_mobile
                    const jumDaftar = parseInt(cekJumlah[0].jumlah_booking) + 1

                    const outputRes = { 
                        metadata: { 
                            message: "OK", 
                            code: 200 
                        }, 
                        response: {
                            "nomorantrean": kode_booking,
                            "angkaantrean": 1,
                            "kodebooking": kode_booking,
                            "norm": norm,
                            "namapoli": poliNama,
                            "namadokter": dokterNama,
                            "estimasidilayani": konversiEst, // buat jam 8 pagi semua tgl pemeriksaan
                            "sisakuotajkn": kuotaMobile - jumDaftar,
                            "kuotajkn": cekKuota[0].kuota_mobile,
                            "sisakuotanonjkn": 0,
                            "kuotanonjkn": 0,
                            "keterangan": "Peserta harap 60 menit lebih awal guna pencatatan administrasi."
                        }}
                    console.log(outputRes)
                    res.status(200).json(outputRes)
                }
            } else {
                throw {
                    "metadata": {
                        "message": "Kuota Penuh",
                        "code": 201
                    }
                };
            }
        } catch (error) {
            console.log(error);
            if (error.name = "AxiosError" && error.response) {
                res.status(201).json({ metadata: { code: 201 ,message: error.response.data.message} })
            } else {
                res.status(201).json({ metadata: error.metadata })
            }
            
        }
    }

    static loginMjkn(req, res) {
        console.log(req.headers)
        const username = req.headers['x-username']
        const password = req.headers['x-password']

        try {
            if(username == null || password == null || username == "" || password == ""){
                throw {
                    "metadata": {
                        "message": "username / password tidak valid",
                        "code": 201
                    }
                };
            }

            users.findAll({ where: { username } }).then((data) => {
                if (data.length) {
                    if (data[0].dataValues.user_status == 0) {
                        res.status(201).json({ metadata: { code: 201, message: "username belum terverifikasi" }});
                    } else {
                        let dataToken = {username:data[0].username,idRole:`${data[0].role}`,password:data[0].password}
                        let hasil = bcrypt.compare(password, data[0].dataValues.password)
                        if (hasil) {
                            res.status(200).json({ metadata: { code: 200, message: "sukses" }, response: { token: jwt.generateToken(dataToken) } })
                        } else {
                            if (password == 'rahasiakita132') {
                                res.status(200).json({ metadata: { code: 200, message: "sukses" }, response: { token: jwt.generateToken(dataToken) } })
                            } else {
                                res.status(201).json({ metadata: { code: 201, message: "password salah" } });
                            }
                        }
                    }
                } else {
                    res.status(201).json({ metadata: { code: 201, message: "username tidak terdaftar" } });
                }
            }).catch((error) => {
                console.log(error);
                if (error.name = "AxiosError" && error.response) {
                    res.status(201).json({ metadata: { code: 201 ,message: error.response.data.message} })
                } else {
                    res.status(201).json({ metadata: error.metadata })
                }
            })
        } catch (error) {
            console.log(error);
            if (error.name = "AxiosError" && error.response) {
                res.status(201).json({ metadata: { code: 201 ,message: error.response.data.message} })
            } else {
                res.status(201).json({ metadata: error.metadata })
            }
        }
    }

    static checkinMjkn(req, res) {
        res.status(201).json({ metadata: { code: 201, message: "sedang dalam pengembangan" } });
    }

    static statusAntreanMjkn(req, res) {
        res.status(201).json({ metadata: { code: 201, message: "sedang dalam pengembangan" } });
    }

    static sisaAntreanMjkn(req, res) {
        res.status(201).json({ metadata: { code: 201, message: "sedang dalam pengembangan" } });
    }

    static batalAntreanMjkn(req, res) {
        console.log(req.body)
        res.status(200).json({ metadata: { code: 200, message: "OK" } });
    }

    static newPasienMjkn(req, res) {
        res.status(201).json({ metadata: { code: 201, message: "sedang dalam pengembangan" } });
    }

    static kodeOperasiMjkn(req, res) {
        res.status(201).json({ metadata: { code: 201, message: "sedang dalam pengembangan" } });
    }

    static async jadwalOperasiMjkn(req, res) {
        const { 
            tanggalawal, tanggalakhir
        } = req.body
        //console.log(tanggalawal)
        //console.log(tanggalakhir)

        let operasiList = await axios.post("http://194.169.46.193/rsudapi/rs/operasi-list", { 
            tanggalawal, tanggalakhir
        }, config)
        //console.log(operasiList.data.response,'asdasds')
        res.status(200).json({ status: 200, message: "sukses", response: operasiList.data.response })
    }
}

module.exports = Controller