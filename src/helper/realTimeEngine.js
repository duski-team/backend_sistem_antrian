const moment = require('moment');
const { sq } = require("../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const booking = require('../module/booking/model');
const antrian_list = require('../module/antrian_list/model')
const { Server } = require("socket.io")
const axios = require('axios')
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const purworejo = process.env.HOST_PURWOREJO
const config = require("./config").config

const koneksi_socket = koneksi_socket => {
    const io = new Server(koneksi_socket, { cors: "*" })
    const pubClient = createClient({ url: `redis://${process.env.HOST_REDIS}:${process.env.PORT_REDIS}` });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
      });

    io.on('connection', function (socket) {
        // console.log(socket.id);
        console.log('ada yang connect');

        socket.on('panggil', async (asd, room_id) => {
            const { id, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, id_antrian_list, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id,booking_id } = asd

            const t = await sq.transaction();

            try {
                await antrian_list.update({ tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, id_antrian_list, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id }, { where: { id },transaction:t})
    
                if (status_antrian == 0) {
                    let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')
                    let isi = ''
                    if (poli_id) {
                        isi += `  and poli_id = ${poli_id} `
                    }
                    let sisa = await sq.query(`select count(*)as total from antrian_list al where date(tanggal_antrian) = '${tgl}' ${isi} and poli_layanan = ${poli_layanan} and status_antrian in (0,1)`, s);
                    console.log(sisa);
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
                    let x = `${room_id}`
                    await t.commit();
                    io.to(x).emit("refresh_layar", asd);
                    io.emit("refresh_admin", asd);
                } else {
                    if(status_antrian == 2 && booking_id){
                        await booking.update({status_booking:2},{where:{id:booking_id},transaction:t})
                    }
                    await t.commit();
                    io.emit("refresh_admin", asd);
                }
            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", error);
            }
        })

        socket.on('registerAntrianLoket', async (asd) => {
            const { tanggal_antrian, poli_layanan, initial, status_antrian, poli_id, master_loket_id, jenis_antrian_id, booking_id } = asd

            try {
                let cekBooking = []
                let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')
                
                let sequence = await sq.query(`select count(*)+1 as nomor from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan =2`, s);
                let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan = 2 and al.status_antrian in (0,1)`, s);

                if (booking_id) {
                    cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tanggal_antrian) = '${tgl}'`, s)
                }

                if (cekBooking.length > 0) {
                    cekBooking[0].sisa_antrian = sisa[0].total - 1
                    io.emit("refresh_antrian_loket", cekBooking[0]);
                } else {
                    let antrian_no = await sq.query(`select al.antrian_no from antrian_list al where date(al.tanggal_antrian) = '${tgl}'and al.initial = '${initial}' order by al.antrian_no desc limit 1`, s)
                    let no = antrian_no.length == 0 ? 1 : +antrian_no[0].antrian_no + 1
                    let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master: 1, poli_layanan, initial, antrian_no: no, sequence: sequence[0].nomor, status_antrian, master_loket_id, poli_id, jenis_antrian_id, booking_id })
                    hasil.dataValues.sisa_antrian = +sisa[0].total

                    io.emit("refresh_antrian_loket", hasil);
                }
            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", error);
            }
        })

        socket.on('registerMandiri', async (asd) => {
            const { id_antrian_list, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id } = asd

            const t = await sq.transaction();

            try {
                let nomer_antrian = antrian_no
                let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')

                if (!antrian_no) {
                    let nomernya = await sq.query(`select al.antrian_no from antrian_list al where date(al.tanggal_antrian) = '${tgl}'and al.initial = '${initial}' order by al.antrian_no desc limit 1`, s)
                    nomer_antrian = nomernya.length == 0 ? 1 : +nomernya[0].antrian_no + 1
                }

                let sequence = await sq.query(`select count(*)+1 as total from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_id =${poli_id}`, s);
                let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_id = '${poli_id}' and status_antrian in (0,1)`, s)

                if (id_antrian_list) {
                    await antrian_list.update({ status_antrian: 2 }, { where: { id: id_antrian_list }, transaction: t })
                }

                let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].total, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id }, { transaction: t })
                hasil.dataValues.sisa_antrian = +sisa[0].total
                await t.commit();

                io.emit("refresh_register_mandiri", hasil);
            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", error);
            }
        })

        socket.on('registerAntrianLayanan', async (asd) => {
            const { id_antrian_list, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id } = asd
            
            // console.log(asd);
            //room_id = poli layanan
            const t = await sq.transaction();

            try {
                let nomer_antrian = antrian_no
                let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')

                if (!antrian_no) {
                    let nomernya = await sq.query(`select al.antrian_no from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.initial = '${initial}' and al.poli_layanan = ${poli_layanan} order by al.antrian_no desc limit 1`, s)
                    // console.log(nomernya);
                    nomer_antrian = nomernya.length == 0 ? 1 : +nomernya[0].antrian_no + 1
                }

                let sequence = await sq.query(`select count(*)+1 as nomor from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan =${poli_layanan}`, s);
                let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan = ${poli_layanan} and al.status_antrian in (0,1)`, s);
                // console.log(antrian_no);
                if (id_antrian_list) {
                    await antrian_list.update({ status_antrian: 2 }, { where: { id: id_antrian_list }, transaction: t })
                }

                let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].nomor, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id }, { transaction: t })
                hasil.dataValues.sisa_antrian = +sisa[0].total
                await t.commit();
                io.emit("refresh_antrian_layanan", asd);
            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", error);
            }
        })

        socket.on('registerAPMMandiri', async (asd) => {
            const { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan, initial, jadwal_dokter_id, booking_id, master_loket_id } = asd

            const t = await sq.transaction();
            
            try {
                let cekBooking = []
                let tgl = moment().format('YYYY-MM-DD')
                let sequence_no = await sq.query(`select count(*)+1 as total from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_id = ${idPoli}`, s);
                let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan = 1 and al.status_antrian in (0,1) and al.poli_id = ${idPoli}`, s);

                if (booking_id) {
                    cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tanggal_antrian) = '${tgl}'`, s)
                }
                if (cekBooking.length > 0) {
                    cekBooking[0].sisa_antrian = sisa[0].total - 1
                    io.emit("refresh_register_APM_mandiri", cekBooking[0]);
                } else {
                    let antrian_no = await sq.query(`select al.antrian_no from antrian_list al where date(al.tanggal_antrian) = '${tgl}'and al.initial = '${initial}' order by al.antrian_no desc limit 1`, s)
                    let no = antrian_no.length == 0 ? 1 : +antrian_no[0].antrian_no + 1
                    // let kirimRajal = await axios.post(purworejo + "/reg-rajal", { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan }, config)

                    let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian: tgl, is_master: 1, poli_layanan: 1, initial, antrian_no: no, sequence: sequence_no[0].total, booking_id, jadwal_dokter_id, poli_id: idPoli, master_loket_id },{transaction:t})
                    hasil.dataValues.sisa_antrian = +sisa[0].total

                    // console.log(kirimRajal, 'KIRIM RAJAL');
                    await t.commit();
                    io.emit("refresh_register_APM_mandiri",hasil);
                }
                // let kirim = await axios.get(purworejo + "/get-poli", config)
                // let polinya = kirim.data.data
                // for (let i = 0; i < polinya.length; i++) {
                //     if (polinya[i].id == asd.idPoli) {
                //         hasil.dataValues.nama_poli = polinya[i].nama
                //     }
                // }
                // console.log(hasil);

            } catch (error) {
                await t.rollback();
                if (error.name = "AxiosError") {
                    let respon_error = error.response.data
                    console.log(respon_error);
                    socket.emit("error", respon_error);
                } 
                else {
                console.log(error);
                socket.emit("error", error);
                }
            }
        })

        socket.on('registerAPMBPJS', async (asd) => {
            const { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan, initial, jadwal_dokter_id, booking_id, master_loket_id,noSuratKontrol } = asd

            const t = await sq.transaction();
            
            try {
                let cekBooking = []
                let tgl = moment().format('YYYY-MM-DD')
                let sequence_no = await sq.query(`select count(*)+1 as total from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_id = ${idPoli}`, s);
                let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan = 1 and al.status_antrian in (0,1) and al.poli_id = ${idPoli}`, s);

                if (booking_id) {
                    cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tanggal_antrian) = '${tgl}'`, s)
                }
                if (cekBooking.length > 0) {
                    cekBooking[0].sisa_antrian = sisa[0].total - 1
                    io.emit("refresh_register_APM_mandiri", cekBooking[0]);
                } else {

                    let antrian_no = await sq.query(`select al.antrian_no from antrian_list al where date(al.tanggal_antrian) = '${tgl}'and al.initial = '${initial}' order by al.antrian_no desc limit 1`, s)
                    let no = antrian_no.length == 0 ? 1 : +antrian_no[0].antrian_no + 1
                    // let kirimRajal = await axios.post(purworejo + "/reg-rajal", { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, noSuratKontrol, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan }, config)
                    // let idDaftar = kirimRajal.data.data.idDaftar
                    // let kirimSEP = await axios.post(purworejo + "/create-sep-apm", { idDaftar }, config)  //SEP

                    let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian: tgl, is_master: 1, poli_layanan: 1, initial, antrian_no: no, sequence: sequence_no[0].total, booking_id, jadwal_dokter_id, poli_id: idPoli, master_loket_id },{transaction:t})
                    hasil.dataValues.sisa_antrian = +sisa[0].total
                    // let RAJAL = kirimRajal.data.data
                    // console.log(RAJAL, 'KIRIM RAJAL');
                    // let SEP = kirimSEP.data.data.sep
                    // console.log(SEP, "SEP");
                    // let SEPPESERTA = kirimSEP.data.data.sep.data.sep.peserta
                    // console.log(SEPPESERTA, "SEP PESERTA");
                    // let SEPINFORMASI = kirimSEP.data.data.sep.data.sep.informasi
                    // console.log(SEPINFORMASI, "SEP INFORMASI");
                    // let SEPPESERTA1 = kirimSEP.data.data.sep.data.peserta
                    // console.log(SEPPESERTA1, "SEP PESERTA1");
                    // let SEPINFORMASI1 = kirimSEP.data.data.sep.data.informasi
                    // console.log(SEPINFORMASI1, "SEP INFORMASI1");
                 
                    
                    await t.commit();
                    // io.emit("refresh_register_APM_mandiri", {RAJAL,SEP,SEPPESERTA,SEPINFORMASI});
                    io.emit("refresh_register_APM_mandiri",hasil);
                }
                // let kirim = await axios.get(purworejo + "/get-poli", config)
                // let polinya = kirim.data.data
                // for (let i = 0; i < polinya.length; i++) {
                //     if (polinya[i].id == asd.idPoli) {
                //         hasil.dataValues.nama_poli = polinya[i].nama
                //     }
                // }
                // console.log(hasil);

            } catch (error) {
                await t.rollback();
                if (error.name = "AxiosError") {
                    let respon_error = error.response.data
                    console.log(respon_error);
                    socket.emit("error", respon_error);
                } 
                else {
                console.log(error);
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

        socket.on('disconnect', () => {
            console.log('ada yang disconnect');
        });
    });
}

module.exports = { koneksi_socket }