const booking = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const antrian_list = require('../antrian_list/model')
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
        const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, flag_layanan, jadwal_dokter_id } = req.body

        try {
            let k = sha1(uuid_v4());
            let kode_booking = k.substring(k.length - 6).toUpperCase();
            let cekKuota = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`, s)
            let cekJumlah = await sq.query(`select count(*) as "jumlah_booking" from booking b where b."deletedAt" isnull and b.jadwal_dokter_id = '${jadwal_dokter_id}' and date(b.tanggal_booking) = '${tanggal_booking}'`, s)

            if (cekJumlah[0].jumlah_booking > cekKuota[0].kuota) {
                res.status(200).json({ status: 200, message: "kuota penuh" })
            } else {
                let data_booking = await booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, kode_booking, rm_id, flag_layanan, jadwal_dokter_id })
                res.status(200).json({ status: 200, message: "sukses", data: data_booking })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async registerTanpaRM(req, res) {
        const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, jadwal_dokter_id, flag_layanan } = req.body

        try {
            let k = sha1(uuid_v4());
            let kode_booking = k.substring(k.length - 6).toUpperCase();
            let cekKuota = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`, s)
            let cekJumlah = await sq.query(`select count(*) as "jumlah_booking" from booking b where b."deletedAt" isnull and b.jadwal_dokter_id = '${jadwal_dokter_id}' and date(b.tanggal_booking) = '${tanggal_booking}'`, s)

            if (cekJumlah[0].jumlah_booking > cekKuota[0].kuota) {
                res.status(200).json({ status: 200, message: "kuota penuh" })
            } else {
                let data_booking = await booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, kode_booking, rm_id, flag_layanan, jadwal_dokter_id })
                res.status(200).json({ status: 200, message: "sukses", data: data_booking })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static update(req, res) {
        const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, id } = req.body

        booking.update({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm }, { where: { id } }).then(hasil => {
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
            let data = await sq.query(`select u.id as "user_id", m.id as "member_id", b.id as "booking_id", m.user_id as "user_id_member", * from users u left join "member" m on m.user_id = u.id left join booking b on b.no_rm = m.no_rm_pasien left join antrian_list al on al.booking_id = b.id left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id where u."deletedAt" isnull and u.id = '${user_id}'`, s)

            for (let i = 0; i < data.length; i++) {
                let data_pasien = await axios.get(purworejo + "/get-pasien?no=" + data[i].no_rm_pasien, config)
                if (data_pasien.data.data[0].noRm == data[i].no_rm_pasien) {

                    let kirim = await axios.get(purworejo + "/get-dokter", config)
                    let data_dokter = kirim.data.data
                    for (let j = 0; j < data_dokter.length; j++) {
                        if (data_dokter[j].id == data[i].dokter_id) {
                            data[i].nama_dokter = data_dokter[j].nama
                        }
                    }

                    data[i].profil = data_pasien.data.data[0]
                }
            }

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsBookingByKodeBooking(req, res) {
        let { kode_booking } = req.params
        try {
            let data = await sq.query(`select b.id as "booking_id", * from booking b join antrian_list al on al.booking_id = b.id where b."deletedAt" isnull and b.kode_booking = '${kode_booking}'`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller