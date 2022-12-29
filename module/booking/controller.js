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
let sha1 = require('sha1');

class Controller {

    static registerDenganRM(req, res) {
        const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, tanggal_antrian, poli_layanan, initial, jadwal_dokter_id, poli_id } = req.body

        let k = sha1("registerDenganRM");
        let kode_booking = k.substring(k.length - 6).toUpperCase();
        
        booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, kode_booking })
            .then(async hasil => {
                let nomernya = await sq.query(`select count(*) from antrian_list al where date(al.tanggal_antrian) = '${tanggal_antrian}'and poli_id =${poli_id} and initial = '${initial}' and is_master=1`, s)
                let nomer_antrian = +nomernya[0].count + 1


                const sequence = await sq.query(`select count(*) from antrian_list al where date(tanggal_antrian) = '${tanggal_antrian}' and poli_id =${poli_id} `, s)
                // res.json('oke')

                console.log(nomer_antrian, sequence[0].count);

                antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master: 1, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].count + 1, jadwal_dokter_id, poli_id, booking_id: hasil.id })
                    .then(hasil => {
                        res.status(200).json({ status: 200, message: "sukses", data: hasil })
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(500).json({ status: 500, message: "gagal", data: error })
                    })
            })
    }

    static async registerTanpaRM(req, res) {
        const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, tanggal_antrian, poli_layanan, initial, jadwal_dokter_id, poli_id } = req.body

        const t = await sq.transaction();

        try {
            let k = sha1("registerTanpaRM");
            let kode_booking = k.substring(k.length - 6).toUpperCase();

            let data_booking = await booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, kode_booking }, { transaction: t })
            let nomernya = await sq.query(`select count(*) from antrian_list al where date(al.tanggal_antrian) = '${tanggal_antrian}'and poli_id =${poli_id} and initial = '${initial}' and is_master = 1`, s)
            let nomer_antrian = +nomernya[0].count + 1
            const sequence = await sq.query(`select count(*) from antrian_list al where date(tanggal_antrian) = '${tanggal_antrian}' and poli_id =${poli_id} `, s)

            let data_antrian = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master: 1, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].count + 1, jadwal_dokter_id, poli_id, booking_id: data_booking.id }, { transaction: t })
            await t.commit();
            res.status(200).json({ status: 200, message: "sukses", data: data_booking })
        } catch (error) {
            await t.rollback();
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static update(req, res) {
        const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, id } = req.body

        booking.update({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm }, {
            where: {
                id
            }
        })
            .then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            })
            .catch(error => {
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

                    let kirim = await axios.get(purworejo+"/get-dokter",config)
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
}

module.exports = Controller