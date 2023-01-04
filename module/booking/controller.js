const booking = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
var QRCode = require('qrcode')

const purworejo = 'http://103.121.123.87/rsudapi/reg'
const token = 'agAW4AUAgjOtCMwIxcKnGjkDj6jj64vr'
const axios = require('axios');
const config = {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
};
const sha1 = require('sha1');

class Controller {

    static async registerDenganRM(req, res) {
        const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, flag_layanan, jadwal_dokter_id, user_id } = req.body

        try {
            let k = sha1(uuid_v4());
            let kode_booking = k.substring(k.length - 6).toUpperCase();
            let cekKuota = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`, s)
            let cekJumlah = await sq.query(`select count(*) as "jumlah_booking" from booking b where b."deletedAt" isnull and b.jadwal_dokter_id = '${jadwal_dokter_id}' and date(b.tanggal_booking) = '${tanggal_booking}'`, s)

            if (cekJumlah[0].jumlah_booking < cekKuota[0].kuota_mobile) {
                let data_booking = await booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, kode_booking, flag_layanan, jadwal_dokter_id, user_id })
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
        const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, jadwal_dokter_id, flag_layanan, user_id } = req.body

        try {
            let k = sha1(uuid_v4());
            let kode_booking = k.substring(k.length - 6).toUpperCase();
            let cekKuota = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`, s)
            let cekJumlah = await sq.query(`select count(*) as "jumlah_booking" from booking b where b."deletedAt" isnull and b.jadwal_dokter_id = '${jadwal_dokter_id}' and date(b.tanggal_booking) = '${tanggal_booking}'`, s)

            if (cekJumlah[0].jumlah_booking < cekKuota[0].kuota_mobile) {
                let data_booking = await booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, kode_booking, flag_layanan, jadwal_dokter_id, user_id })
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
        const { id, tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, user_id } = req.body

        booking.update({ tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, user_id }, { where: { id } }).then(hasil => {
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

            let data = await sq.query(`select * from booking b where b."deletedAt" isnull ${isi} order by b.id desc limit ${jumlah} offset ${offset}`, s)
            let data2 = await sq.query(`select * from booking b where b."deletedAt" isnull ${isi} order by b.id desc limit ${jumlah} offset ${offset2}`, s)

            let jml = await sq.query(`select count(*) from booking b where b."deletedAt" isnull ${isi} `, s)

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

            let data = await QRCode.toDataURL(text, { errorCorrectionLevel: 'H' })

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
            where b."deletedAt" isnull and u."deletedAt" isnull and b.user_id = '${user_id}'`, s)
            let kirim = await axios.get(purworejo + "/get-dokter", config)
            let data_dokter = kirim.data.data

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data_dokter.length; j++) {
                    if (data_dokter[j].id == data[i].dokter_id) {
                        data[i].nama_dokter = data_dokter[j].nama
                    }
                }
                if(data[i].no_rm){
                    let data_pasien = await axios.get(purworejo + "/get-pasien?no=" + data[i].no_rm, config)
                    data[i].profil = data_pasien.data.data[0]
                }
            }

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
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
            let data = await sq.query(`select b.* , al.id as "antrian_list_id", al.tanggal_antrian ,al.is_master ,al.poli_layanan ,al.initial ,al.antrian_no ,al."sequence" ,al.is_cancel ,al.is_process ,al.status_antrian ,al.booking_id ,al.poli_id ,al.master_loket_id ,al.jenis_antrian_id from booking b left join antrian_list al on al.booking_id = b.id where b."deletedAt" isnull and b.kode_booking = '${kode_booking}'`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listAllBooking(req, res) {
        try {
            let data = await sq.query(`select b.id as "booking_id", * from booking b left join jadwal_dokter jd on jd.id = b.jadwal_dokter_id left join users u on u.id = b.user_id where b."deletedAt" isnull `, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller