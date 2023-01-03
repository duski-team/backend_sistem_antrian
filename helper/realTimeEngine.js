const moment = require('moment');
const { sq } = require("../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const booking = require('../module/booking/model');
const antrian_list = require('../module/antrian_list/model')
const { Server } = require("socket.io")
const sha1 = require('sha1');
const purworejo = 'http://103.121.123.87/rsudapi/reg'
const token = 'agAW4AUAgjOtCMwIxcKnGjkDj6jj64vr'
const axios = require('axios')
const config = {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
};

const koneksi_socket = koneksi_socket => {
    const io = new Server(koneksi_socket, { cors: "*" })

    io.on('connection', function (socket) {
        // console.log(socket.id);
        console.log('ada yang connect');
        socket.on('disconnect', () => {
            console.log('ada yang disconnect');
        });

        socket.on('panggil', async (asd, room_id) => {
            const { id, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, id_antrian_list, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id } = asd
            try {
                let data = await antrian_list.update({ tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, id_antrian_list, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id }, { where: { id } })

                if (status_antrian == 0) {
                    let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')
                    let sisa = await sq.query(`select count(*)as total from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_id = ${poli_id} and status_antrian in (0,1)`, s);
                    if (jadwal_dokter_id) {
                        let jadwal_dokter = await sq.query(`select * from jadwal_dokter jd where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`, s)
                        let kirim = await axios.get(purworejo + "/get-dokter", config)
                        let data_dokter = kirim.data.data
                        for (let i = 0; i < data_dokter.length; i++) {
                            if (data_dokter[i].id == jadwal_dokter[0].dokter_id) {
                                asd.nama_dokter = data_dokter[i].nama
                            }
                        }
                    }
                    asd.sisa_antrian = sisa[0].total
                    io.to(room_id).emit("refresh_layar", asd);
                } else {
                    io.emit("refresh_admin", asd);
                }
            } catch (error) {
                console.log(error);
                socket.emit("error", error);
            }
        })

        socket.on('registerTanpaRM', async (asd) => {
            const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, jadwal_dokter_id, flag_layanan } = asd

            try {
                let k = sha1(uuid_v4());
                let kode_booking = k.substring(k.length - 6).toUpperCase();
                let cekKuota = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`, s)
                let cekJumlah = await sq.query(`select count(*) as "jumlah_booking" from booking b where b."deletedAt" isnull and b.jadwal_dokter_id = '${jadwal_dokter_id}' and date(b.tanggal_booking) = '${tanggal_booking}'`, s)

                if (cekJumlah[0].jumlah_booking < cekKuota[0].kuota_mobile) {
                    let data_booking = await booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, kode_booking, flag_layanan, jadwal_dokter_id })
                    io.emit("refresh_mobile", data_booking)
                } else {
                    io.emit("kuota_penuh")
                }
            } catch (error) {
                console.log(error);
                socket.emit("error", error);
            }
        })

        socket.on('registerTanpaRMMobile', async (asd) => {
            const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, jadwal_dokter_id, flag_layanan } = asd

            try {
                let k = sha1(uuid_v4());
                let kode_booking = k.substring(k.length - 6).toUpperCase();
                let cekKuota = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`, s)
                let cekJumlah = await sq.query(`select count(*) as "jumlah_booking" from booking b where b."deletedAt" isnull and b.jadwal_dokter_id = '${jadwal_dokter_id}' and date(b.tanggal_booking) = '${tanggal_booking}'`, s)

                if (cekJumlah[0].jumlah_booking < cekKuota[0].kuota_mobile) {
                    let data_booking = await booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, kode_booking, flag_layanan, jadwal_dokter_id })
                    io.emit("refresh_mobile", data_booking)
                } else {
                    io.emit("kuota_penuh")
                }
            } catch (error) {
                console.log(error);
                socket.emit("error", error);
            }
        })

        socket.on('registerAntrianLoket', async (asd) => {
            const { tanggal_antrian, poli_layanan, initial, status_antrian, poli_id, master_loket_id, jenis_antrian_id, booking_id } = asd

            try {
                if (booking_id) {
                    let cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}'`, s)
                    if (cekBooking.length > 0) {
                        console.log('data sudah ada');
                        io.emit("data_sudah_ada", cekBooking);
                    } else {
                        let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')
                        let antrian_no = await sq.query(`select count(*)+1 as nomor from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.initial = '${initial}'`, s);
                        let sequence = await sq.query(`select count(*)+1 as nomor from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan = ${poli_layanan}`, s);
                        let sisa = await sq.query(`select count(*)as total from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_layanan = ${poli_layanan} and status_antrian in (0,1)`, s);
                        let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master: 1, poli_layanan, initial, antrian_no: antrian_no[0].nomor, sequence: sequence[0].nomor, status_antrian, master_loket_id, poli_id, jenis_antrian_id, booking_id })
                        hasil.dataValues.sisa_antrian = sisa[0].total

                        io.emit("refresh_antrian_loket", hasil);
                    }
                } else {
                    let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')
                    let antrian_no = await sq.query(`select count(*)+1 as nomor from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.initial = '${initial}'`, s);
                    let sequence = await sq.query(`select count(*)+1 as nomor from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan = ${poli_layanan}`, s);
                    let sisa = await sq.query(`select count(*)as total from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_layanan = ${poli_layanan} and status_antrian in (0,1)`, s);
                    let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master: 1, poli_layanan, initial, antrian_no: antrian_no[0].nomor, sequence: sequence[0].nomor, status_antrian, master_loket_id, poli_id, jenis_antrian_id, booking_id })
                    hasil.dataValues.sisa_antrian = sisa[0].total

                    io.emit("refresh_antrian_loket", hasil);
                }
            } catch (error) {
                console.log(error);
                socket.emit("error", error);
            }
        })

        socket.on('registerMandiri', async (asd) => {
            const { id_antrian_list, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id } = asd

            const t = await sq.transaction();

            try {
                let nomer_antrian = ''
                let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')

                if (antrian_no) {
                    nomer_antrian = antrian_no
                }
                else {
                    let nomernya = await sq.query(`select count(*) from antrian_list al where date(al.tanggal_antrian) = '${tgl}'and poli_id =${poli_id} and initial = '${initial}' and is_master=1`, s)
                    nomer_antrian = +nomernya[0].count + 1
                }

                let sequence = await sq.query(`select count(*) from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_id =${poli_id} and initial = '${initial}'`, s);
                let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_id = '${poli_id}' and initial = '${initial}' and status_antrian in (0,1)`, s);

                // console.log(nomer_antrian,sequence[0].count);

                if (id_antrian_list) {
                    await antrian_list.update({ status_antrian: 2 }, { where: { id: id_antrian_list }, transaction: t })
                }

                let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].count + 1, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id }, { transaction: t })
                hasil.dataValues.sisa_antrian = sisa[0].total
                await t.commit();

                io.emit("refresh_register_mandiri", hasil);

            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", error);
            }
        })

        socket.on('registerAPMMandiri', async (asd) => {
            const { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan, initial, jadwal_dokter_id, booking_id, master_loket_id } = asd

            try {
                let countantrian = await sq.query(`select count(*)  from antrian_list al  where al."deletedAt" isnull and jadwal_dokter_id ='${jadwal_dokter_id}' and al.is_master = 1`, s)
                let countsequence = await sq.query(`select count(*)  from antrian_list al  where al."deletedAt" isnull and jadwal_dokter_id ='${jadwal_dokter_id}'`, s)
                let antrian_no = +countantrian[0].count + 1
                let sequence_no = +countsequence[0].count + 1
                let curdate = moment().format('YYYY-MM-DD')
                let kirim = await axios.post(purworejo + "/reg-rajal", { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan }, config)

                let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian: curdate, is_master: 1, poli_layanan: 1, initial, antrian_no, sequence: sequence_no, jadwal_dokter_id, booking_id, poli_id: idPoli, master_loket_id })

                // let kirim = await axios.get(purworejo + "/get-poli", config)
                // let polinya = kirim.data.data
                // for (let i = 0; i < polinya.length; i++) {
                //     if (polinya[i].id == asd.idPoli) {
                //         hasil.dataValues.nama_poli = polinya[i].nama
                //     }
                // }
                // console.log(hasil);

                io.emit("refresh_register_APM_mandiri", hasil);

            } catch (error) {
                // console.log(error);
                if (error.name = "AxiosError") {
                    let respon_error = error.response.data
                    socket.emit("error", respon_error);
                } else {
                    socket.emit("error", error);
                }
            }
        })

        socket.on('joinRoom', (room_id) => {
            socket.join(room_id);
            console.log(`join ${room_id}`);
        })

        socket.on('leaveRoom', (room_id) => {
            socket.leave(room_id);
            console.log(`leave ${room_id}`);
        })
    });
}

module.exports = { koneksi_socket }