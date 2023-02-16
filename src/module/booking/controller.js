const booking = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
var QRCode = require('qrcode')
const moment = require('moment');
const sha1 = require('sha1');
const axios = require('axios');

const purworejo = process.env.HOST_PURWOREJO
const config = require("../../helper/config").config

function batalBooking() {
    var job = new ClusterCronJob('0 1 * * *', async function () {
        try {
            let cek_booking = await sq.query(`update booking set status_booking = 0 where b."deletedAt" isnull and b.status_booking in (1,2) and date(b.tanggal_booking) < date(now())`,s)
            console.log('berhasil');
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

    static async registerDenganRM(req, res) {
        const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, flag_layanan, jadwal_dokter_id, user_id, tujuan_booking } = req.body

        try {
            let foto_surat_rujukan = ""
            if (req.files) {
                if (req.files.file1) {
                    foto_surat_rujukan = req.files.file1[0].filename
                }
            }
            let k = sha1(uuid_v4());
            let kode_booking = k.substring(k.length - 6).toUpperCase();
            let cekKuota = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`, s)
            let cekJumlah = await sq.query(`select count(*) as "jumlah_booking" from booking b where b."deletedAt" isnull and b.jadwal_dokter_id = '${jadwal_dokter_id}' and date(b.tanggal_booking) = '${tanggal_booking}' and b.status_booking > 0 `, s)

            if (cekJumlah[0].jumlah_booking < cekKuota[0].kuota_mobile) {
                let data_booking = await booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, kode_booking, flag_layanan, jadwal_dokter_id, user_id, tujuan_booking, foto_surat_rujukan })
                res.status(200).json({ status: 200, message: "sukses", data: data_booking })
            } else {
                res.status(200).json({ status: 200, message: "kuota penuh" })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async registerTanpaRM(req, res) {
        const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, jadwal_dokter_id, flag_layanan, user_id, tujuan_booking } = req.body

        try {
            let k = sha1(uuid_v4());
            let kode_booking = k.substring(k.length - 6).toUpperCase();
            let cekKuota = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`, s)
            let cekJumlah = await sq.query(`select count(*) as "jumlah_booking" from booking b where b."deletedAt" isnull and b.jadwal_dokter_id = '${jadwal_dokter_id}' and date(b.tanggal_booking) = '${tanggal_booking}' and b.status_booking > 0 `, s)

            if (cekJumlah[0].jumlah_booking < cekKuota[0].kuota_mobile) {
                let data_booking = await booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, kode_booking, flag_layanan, jadwal_dokter_id, user_id, tujuan_booking })
                res.status(200).json({ status: 200, message: "sukses", data: data_booking })
            } else {
                res.status(200).json({ status: 200, message: "kuota penuh" })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static update(req, res) {
        const { id, tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, user_id, tujuan_booking } = req.body

        booking.update({ tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, user_id, tujuan_booking }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })

    }

    static async list(req, res) {
        const { tanggal_awal, tanggal_akhir, halaman, jumlah } = req.body

        try {
            let isi = '';
            let offset = (+halaman - 1) * jumlah;
            let offset2 = +halaman * jumlah;
            let sisa = true;

            if (tanggal_awal) {
                isi += ` and b.tanggal_booking >= ${tanggal_awal} `
            }
            if (tanggal_akhir) {
                isi += ` and b.tanggal_booking <= ${tanggal_akhir} `
            }

            let data = await sq.query(`select b.id as "booking_id", * from booking b join jadwal_dokter jd on jd.id = b.jadwal_dokter_id where b."deletedAt" isnull and jd."deletedAt" isnull ${isi} order by b.id desc limit ${jumlah} offset ${offset}`, s)
            let data2 = await sq.query(`select b.id as "booking_id", * from booking b join jadwal_dokter jd on jd.id = b.jadwal_dokter_id where b."deletedAt" isnull and jd."deletedAt" isnull ${isi} order by b.id desc limit ${jumlah} offset ${offset2}`, s)

            let dataPoli = await axios.get(purworejo + "/get-poli", config)
            let dataDokter = await axios.get(purworejo + "/get-dokter", config)
            let poli = dataPoli.data.data
            let dokter = dataDokter.data.data

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < poli.length; j++) {
                    if (data[i].poli_id == poli[j].id) {
                        data[i].nama_poli = poli[j].nama
                    }
                }
                for (let k = 0; k < dokter.length; k++) {
                    if (data[i].dokter_id == dokter[k].id) {
                        data[i].nama_dokter = dokter[k].nama
                    }
                }
            }

            let jml = await sq.query(`select count(*) as "total" from booking b where b."deletedAt" isnull ${isi} `, s)

            if (data2.length == 0) {
                sisa = false
            }

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, sisa, jumlah, halaman });
        } catch (error) {
            console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async qr(req, res) {
        try {
            let text = req.query.text

            let data = await QRCode.toDataURL(text, { errorCorrectionLevel: 'H', scale: 10 })

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listBookingByUserId(req, res) {
        let { user_id } = req.body
        try {
            let data = await sq.query(`select b.id as booking_id,u.username,u."role",jd.dokter_id,jd.poli_id,b.*,m.id as member_id
            from booking b 
            join users u on u.id = b.user_id 
            join jadwal_dokter jd on jd.id = b.jadwal_dokter_id 
            left join "member" m on m.no_rm_pasien = b.no_rm 
            where b."deletedAt" isnull and u."deletedAt" isnull and b.user_id = '${user_id}' order by b."createdAt" desc`, s)
            let kirim = await axios.get(purworejo + "/get-dokter", config)
            let data_dokter = kirim.data.data
            let kirim2 = await axios.get(purworejo + "/get-poli", config)
            let poli = kirim2.data.data

            // console.log(data);

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data_dokter.length; j++) {
                    if (data_dokter[j].id == data[i].dokter_id) {
                        data[i].nama_dokter = data_dokter[j].nama
                    }
                }
                for (let k = 0; k < poli.length; k++) {
                    if (poli[k].id == data[i].poli_id) {
                        data[i].nama_poli = poli[k].nama
                    }
                }
                if (data[i].no_rm) {
                    let data_pasien = await axios.get(purworejo + "/get-pasien?no=" + data[i].no_rm, config)
                    data[i].profil = data_pasien.data.data[0]
                }
            }

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            if (error.name = "AxiosError") {
                // console.log(error.response.data);
                let respon_error = error.response.data
                res.status(201).json({ status: respon_error.code, message: respon_error.message })
            } else {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            }
        }
    }

    static async detailsBookingByKodeBooking(req, res) {
        let { kode_booking } = req.params
        try {
            let data = await sq.query(`select b.id as booking_id,b.* , al.id as "antrian_list_id", al.tanggal_antrian ,al.is_master ,al.poli_layanan ,al.initial ,al.antrian_no ,al."sequence" ,al.is_cancel ,al.is_process ,al.status_antrian,al.poli_id as "antrian_list_poli_id" ,al.master_loket_id ,al.jenis_antrian_id, jd.* from booking b join jadwal_dokter jd on jd.id = b.jadwal_dokter_id left join antrian_list al on al.booking_id = b.id where b."deletedAt" isnull and b.kode_booking = '${kode_booking}'`, s)

            if (data.length == 0) {
                res.status(200).json({ status: 200, message: "data tidak ada" })
            } else {
                let kirim = await axios.get(purworejo + "/get-pasien?no=" + data[0].no_rm, config)

                data[0].no_bpjs = kirim.data.data[0].noBpjs

                res.status(200).json({ status: 200, message: "sukses", data })
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listAllBooking(req, res) {
        let { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, kode_booking, flag_layanan, jadwal_dokter_id, user_id, poli_id } = req.body
        try {
            let tgl = moment().format('YYYY-MM-DD')
            let isi = ''
            if (tanggal_booking) {
                isi += ` and b.tanggal_booking = '${tanggal_booking}' `
            }
            if (jenis_booking) {
                isi += ` and b.jenis_booking = '${jenis_booking}' `
            }
            if (NIK) {
                isi += ` and b.NIK = '${NIK}' `
            }
            if (nama_booking) {
                isi += ` and b.nama_booking = '${nama_booking}' `
            }
            if (no_hp_booking) {
                isi += ` and b.no_hp_booking = '${no_hp_booking}' `
            }
            if (no_rujukan) {
                isi += ` and b.no_rujukan = '${no_rujukan}' `
            }
            if (no_kontrol) {
                isi += ` and b.no_kontrol = '${no_kontrol}' `
            }
            if (is_verified) {
                isi += ` and b.is_verified = '${is_verified}' `
            }
            if (is_registered) {
                isi += ` and b.is_registered = '${is_registered}' `
            }
            if (status_booking) {
                isi += ` and b.status_booking = '${status_booking}' `
            }
            if (no_rm) {
                isi += ` and b.no_rm = '${no_rm}' `
            }
            if (kode_booking) {
                isi += ` and b.kode_booking = '${kode_booking}' `
            }
            if (flag_layanan) {
                isi += ` and b.flag_layanan = '${flag_layanan}' `
            }
            if (jadwal_dokter_id) {
                isi += ` and b.jadwal_dokter_id = '${jadwal_dokter_id}' `
            }
            if (user_id) {
                isi += ` and b.user_id = '${user_id}' `
            }
            if (poli_id) {
                isi += ` and jd.poli_id = '${poli_id}' `
            }

            let data = await sq.query(`select b.id as "booking_id", * from booking b left join jadwal_dokter jd on jd.id = b.jadwal_dokter_id left join users u on u.id = b.user_id where b."deletedAt" isnull and date(b.tanggal_booking) >= '${tgl}' and '${tgl}' <= date(b.tanggal_booking) ${isi}`, s)

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
                for (let l = 0; l < dokternya.length; l++) {
                    if (data[i].dokter_id == dokternya[l].id) {
                        data[i].nama_dokter = dokternya[l].nama
                    }
                }
            }

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listBookingByTujuanBooking(req, res) {
        const { tujuan_booking } = req.body

        try {
            let data = await sq.query(`select b.id as "booking_id", * from booking b left join jadwal_dokter jd on jd.id = b.jadwal_dokter_id left join users u on u.id = b.user_id where b."deletedAt" isnull and b.tujuan_booking = ${tujuan_booking}`, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async cekSisaKuota(req, res) {
        try {
            let kirim = await axios.get(purworejo + "/get-poli", config)
            let data_poli = kirim.data.data
            let tanggal = moment().format("YYYY-MM-DD")
            let kuota_antrian = await sq.query(`select al.poli_id, count(*) as total_kuota_terbooking from antrian_list al where al."deletedAt" isnull and al.poli_layanan in (1,2) and date(al.tanggal_antrian) = '${tanggal}' and al.status_antrian < 2 group by al.poli_id `, s)
            let kuota_booking = await sq.query(`select jd.poli_id ,jd.kuota ,jd.kuota_mobile ,count(*) as "jumlah_booking" from booking b join jadwal_dokter jd on jd.id = b.jadwal_dokter_id where b."deletedAt" isnull and jd."deletedAt" isnull and b.status_booking in (1,2,9) and date(jd.waktu_mulai) = '${tanggal}' group by jd.poli_id ,jd.kuota ,jd.kuota_mobile`,s)
            let jadwal = await sq.query(`select * from jadwal_dokter jd where date(jd.waktu_mulai) = '${tanggal}'`, s)
            for (let i = 0; i < data_poli.length; i++) {
                data_poli[i].sisaKuota = 0
                data_poli[i].kuota_terbooking = 0
                if (data_poli[i].kuota == '999') {
                    data_poli[i].sisaKuota = data_poli[i].kuota 
                }
                for (let j = 0; j < jadwal.length; j++) {
                    if (data_poli[i].id == jadwal[j].poli_id) {
                        data_poli[i].kuota = `${jadwal[j].kuota}`
                        data_poli[i].kuotaOnline = `${jadwal[j].kuota_mobile}`
                        let total_kuota = jadwal[j].kuota + jadwal[j].kuota_mobile
                        data_poli[i].sisaKuota = total_kuota
                        for (let l = 0; l < kuota_antrian.length; l++) {
                            if (kuota_antrian[l].poli_id == jadwal[j].poli_id) {
                                data_poli[i].kuota_terbooking = parseInt(kuota_antrian[l].total_kuota_terbooking)
                                data_poli[i].sisaKuota = parseInt(total_kuota) - parseInt(kuota_antrian[l].total_kuota_terbooking)
                            }
                        }
                        for (let m = 0; m < kuota_booking.length; m++) {
                            if (kuota_booking[m].poli_id == jadwal[j].poli_id) {
                                data_poli[i].kuota_terbooking += parseInt(kuota_booking[m].jumlah_booking) 
                                data_poli[i].sisaKuota = parseInt(total_kuota) - parseInt(kuota_booking[m].jumlah_booking)
                            }
                        }
                    }
                }
            }
            res.status(200).json({ status: 200, message: "sukses", data: data_poli });
        } catch (error) {
            console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async cekSisaKuotaPerPoli(req, res) {
        const { poli_id } = req.body
        try {
            let kirim = await axios.get(purworejo + "/get-poli", config)
            let data_poli = kirim.data.data
            let tanggal = moment().format("YYYY-MM-DD")
            let kuota_antrian = await sq.query(`select al.poli_id, count(*) as total_kuota_terbooking from antrian_list al where al."deletedAt" isnull and al.poli_layanan in (1,2) and date(al.tanggal_antrian) = '${tanggal}' and al.status_antrian < 2 and al.poli_id = '${poli_id}' group by al.poli_id `, s)
            let kuota_booking = await sq.query(`select jd.poli_id ,jd.kuota ,jd.kuota_mobile ,count(*) as "jumlah_booking" from booking b join jadwal_dokter jd on jd.id = b.jadwal_dokter_id where b."deletedAt" isnull and jd."deletedAt" isnull and b.status_booking in (1,2,9) and date(jd.waktu_mulai) = '${tanggal}' and jd.poli_id = '${poli_id}' group by jd.poli_id ,jd.kuota ,jd.kuota_mobile`,s)
            let jadwal = await sq.query(`select * from jadwal_dokter jd where jd."deletedAt" isnull and date(jd.waktu_mulai) = '${tanggal}'`, s)

            let hasil = []
            for (let i = 0; i < data_poli.length; i++) {
                if (data_poli[i].id == poli_id) {
                    hasil.push(data_poli[i])
                    for (let j = 0; j < jadwal.length; j++) {
                        if (jadwal[j].poli_id == poli_id) {
                            data_poli[i].kuota = `${jadwal[j].kuota}`
                            data_poli[i].kuotaOnline = `${jadwal[j].kuota_mobile}`
                            data_poli[i].kuota_terbooking = 0
                            let total_kuota = jadwal[j].kuota + jadwal[j].kuota_mobile
                            data_poli[i].sisaKuota = total_kuota
                            for (let k = 0; k < kuota_antrian.length; k++) {
                                if (kuota_antrian[k].poli_id == poli_id) {
                                    data_poli[i].kuota_terbooking = parseInt(kuota_antrian[k].total_kuota_terbooking)
                                    data_poli[i].sisaKuota = parseInt(total_kuota) - parseInt(kuota_antrian[k].total_kuota_terbooking)
                                }
                            }
                            for (let m = 0; m < kuota_booking.length; m++) {
                                if (kuota_booking[m].poli_id == poli_id) {
                                    data_poli[i].kuota_terbooking += parseInt(kuota_booking[m].jumlah_booking) 
                                    data_poli[i].sisaKuota = parseInt(total_kuota) - parseInt(kuota_booking[m].jumlah_booking)
                                }
                            }
                        }
                    }
                }
            }
            res.status(200).json({ status: 200, message: "sukses", data: hasil });
        } catch (error) {
            console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller