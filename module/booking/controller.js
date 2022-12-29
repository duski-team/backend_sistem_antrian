const booking = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const antrian_list = require('../antrian_list/model')
var QRCode = require('qrcode')


class Controller {

    static registerDenganRM(req, res) {
        const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm, tanggal_antrian, poli_layanan, initial, jadwal_dokter_id, poli_id } = req.body

        booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, no_rm })
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
            let data_booking = await booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking }, { transaction: t })
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
            let data = await sq.query(`select m.id as "member_id", b.id as "booking_id", * from "member" m join users u on u.id = m.user_id left join booking b on b.no_rm = m.no_rm_pasien where m."deletedAt" isnull and u."deletedAt" isnull and u.id = '${user_id}'`, s)

            let hasil = []
            let data_user = {
                user_id: data[0].user_id,
                username: data[0].username,
                password: data[0].password,
                role: data[0].role,
                user_status: data[0].user_status,
                otp_time: data[0].otp_time,
                kode_otp: data[0].kode_otp,
                data_member: []
            }
            for (let i = 0; i < data.length; i++) {
                let dm = {
                    member_id: data[i].member_id,
                    no_rm_pasien: data[i].no_rm_pasien,
                    data_booking: []
                }
                if (data[i].no_rm_pasien == data[i].no_rm) {
                    dm.data_booking.push({
                        booking_id: data[i].booking_id,
                        tanggal_booking: data[i].tanggal_booking,
                        jenis_booking: data[i].jenis_booking,
                        NIK: data[i].NIK, 
                        nama_booking: data[i].nama_booking,
                        no_hp_booking: data[i].no_hp_booking,
                        no_rujukan: data[i].no_rujukan,
                        no_kontrol: data[i].no_kontrol,
                        is_verified: data[i].is_verified,
                        is_registered: data[i].is_registered,
                        status_booking: data[i].status_booking,
                        no_rm: data[i].no_rm
                    })
                }
                data_user.data_member.push(dm)
            }
            hasil.push(data_user)
            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller