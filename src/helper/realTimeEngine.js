const moment = require('moment');
const { sq } = require("../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const booking = require('../module/booking/model');
const sepModel = require('../module/print/model');
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
            const { id, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, id_antrian_list, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id,kode_booking,taskid } = asd

            const t = await sq.transaction();

            try {
                await antrian_list.update({ tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, id_antrian_list, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id }, { where: { id }, transaction: t })
                if(kode_booking && taskid){
                    let waktu = moment(new Date()).format('x')
                    let x = {kodebooking:kode_booking,taskid,waktu}
                    let kirim = await axios.post(purworejo + "/update-antrean",x, config)
                    console.log(x);
                    console.log(kirim.data.data);
                }
                if (status_antrian == 0) {
                    let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')
                    let isi = ''
                    if (poli_id) {
                        isi += `  and poli_id = ${poli_id} `
                    }
                    let sisa = await sq.query(`select count(*)as total from antrian_list al where date(tanggal_antrian) = '${tgl}' ${isi} and poli_layanan = ${poli_layanan} and status_antrian in (0,1)`, s);

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
                    if (status_antrian == 2 && booking_id) {
                        await booking.update({ status_booking: 2 }, { where: { id: booking_id }, transaction: t })
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
            const { id_antrian_list, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id,kode_booking } = asd

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

                let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].total, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id,kode_booking }, { transaction: t })
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
            const { id_antrian_list, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id,kode_booking,taskid } = asd

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
                if(kode_booking && taskid){
                    let waktu = moment(new Date()).format('x')
                    let x = {kodebooking:kode_booking,taskid,waktu}
                    let kirim = await axios.post(purworejo + "/update-antrean",x, config)
                    console.log(x);
                    console.log(kirim.data.data);
                }

                let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].nomor, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id,kode_booking }, { transaction: t })
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
            const { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan, initial, jadwal_dokter_id, booking_id, master_loket_id, jenis_pasien, pasien_baru, tanggal_periksa, kode_dokter, nama_dokter, jam_praktek, jenis_kunjungan, nomor_referensi, estimasi_dilayani, keterangan } = asd

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
                    // console.log(kirimRajal, 'KIRIM RAJAL');

                    let kode_booking = moment().format("YYYYMMDD") + `${initial}${no}`
                    let nomor_antrean = `${initial}-${no}`
                    let kirim = await axios.get(purworejo + "/get-poli", config)
                    let poli = kirim.data.data
                    let kode_poli = ''
                    let nama_poli = ''
                    for (let i = 0; i < poli.length; i++) {
                        if (idPoli == poli[i].id) {
                            kode_poli = poli[i].kdPoliBpjs
                            nama_poli = poli[i].nama
                        }
                    }

                    let nik = ''
                    let no_hp = ''
                    if (jenis_pasien == 'JKN') {
                        let tgl = moment().format("YYYY-MM-DD")
                        let kirim = await axios.get(purworejo + `/get-pasien-bpjs?noPeserta=${noBpjs}&tgl=${tgl}`, config)

                        nik = kirim.data.data.peserta.nik
                        no_hp = kirim.data.data.peserta.mr.noTelepon
                    }

                    let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian: tgl, is_master: 1, poli_layanan: 1, initial, antrian_no: no, sequence: sequence_no[0].total, booking_id, jadwal_dokter_id, poli_id: idPoli, master_loket_id, no_rm: noRm, kode_booking }, { transaction: t })
                    hasil.dataValues.sisa_antrian = +sisa[0].total

                    let kirim2 = await axios.post(purworejo + "/create-antrean", { kodebooking: kode_booking, jenispasien: jenis_pasien, nomorkartu: noBpjs, nik, nohp: no_hp, kodepoli: kode_poli, namapoli: nama_poli, pasienbaru: pasien_baru, norm: noRm, tanggalperiksa: tanggal_periksa, kodedokter: kode_dokter, namadokter: nama_dokter, jampraktek: jam_praktek, jeniskunjungan: jenis_kunjungan, nomorreferensi: nomor_referensi, nomorantrean: nomor_antrean, angkaantrean: no, estimasidilayani: estimasi_dilayani, sisakuotajkn: 0, kuotajkn: 0, sisakuotanonjkn: 0, kuotanonjkn: 0, keterangan }, config)

                    let kirim3 = await axios.post(purworejo + "/update-antrean", { kodebooking: kode_booking, waktu: estimasi_dilayani, taskid: 3 })

                    await t.commit();
                    io.emit("refresh_register_APM_mandiri", hasil);
                }
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

        // socket.on('registerAPMBPJS', async (asd) => {
        //     const { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan, initial, jadwal_dokter_id, booking_id, master_loket_id, noSuratKontrol } = asd

        //     const t = await sq.transaction();

        //     try {
        //         let cekBooking = []
        //         let tgl = moment().format('YYYY-MM-DD')
        //         let sequence_no = await sq.query(`select count(*)+1 as total from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_id = ${idPoli}`, s);
        //         let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan = 1 and al.status_antrian in (0,1) and al.poli_id = ${idPoli}`, s);

        //         if (booking_id) {
        //             cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tanggal_antrian) = '${tgl}'`, s)
        //         }
        //         if (cekBooking.length > 0) {
        //             cekBooking[0].sisa_antrian = sisa[0].total - 1
        //             io.emit("refresh_register_APM_mandiri", cekBooking[0]);
        //         } else {

        //             let antrian_no = await sq.query(`select al.antrian_no from antrian_list al where date(al.tanggal_antrian) = '${tgl}'and al.initial = '${initial}' order by al.antrian_no desc limit 1`, s)
        //             let no = antrian_no.length == 0 ? 1 : +antrian_no[0].antrian_no + 1
        //             // let kirimRajal = await axios.post(purworejo + "/reg-rajal", { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, noSuratKontrol, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan }, config)
        //             // let idDaftar = kirimRajal.data.data.idDaftar
        //             // let kirimSEP = await axios.post(purworejo + "/create-sep-apm", { idDaftar }, config)  //SEP

        //             let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian: tgl, is_master: 1, poli_layanan: 1, initial, antrian_no: no, sequence: sequence_no[0].total, booking_id, jadwal_dokter_id, poli_id: idPoli, master_loket_id }, { transaction: t })
        //             hasil.dataValues.sisa_antrian = +sisa[0].total
        //             // let RAJAL = kirimRajal.data.data
        //             // console.log(RAJAL, 'KIRIM RAJAL');
        //             // let SEP = kirimSEP.data.data.sep
        //             // console.log(SEP, "SEP");
        //             // let SEPPESERTA = kirimSEP.data.data.sep.data.sep.peserta
        //             // console.log(SEPPESERTA, "SEP PESERTA");
        //             // let SEPINFORMASI = kirimSEP.data.data.sep.data.sep.informasi
        //             // console.log(SEPINFORMASI, "SEP INFORMASI");
        //             // let SEPPESERTA1 = kirimSEP.data.data.sep.data.peserta
        //             // console.log(SEPPESERTA1, "SEP PESERTA1");
        //             // let SEPINFORMASI1 = kirimSEP.data.data.sep.data.informasi
        //             // console.log(SEPINFORMASI1, "SEP INFORMASI1");

        //             await t.commit();
        //             // io.emit("refresh_register_APM_mandiri", {RAJAL,SEP,SEPPESERTA,SEPINFORMASI});
        //             io.emit("refresh_register_APM_mandiri", hasil);
        //         }

        //     } catch (error) {
        //         await t.rollback();
        //         if (error.name = "AxiosError") {
        //             let respon_error = error.response.data
        //             console.log(respon_error);
        //             socket.emit("error", respon_error);
        //         }
        //         else {
        //             console.log(error);
        //             socket.emit("error", error);
        //         }
        //     }
        // })

        socket.on('registerAPMBPJS', async (asd) => {
            const { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan, initial, jadwal_dokter_id, booking_id, master_loket_id, noSuratKontrol, jenis_pasien, pasien_baru, tanggal_periksa, kode_dokter, nama_dokter, jam_praktek, jenis_kunjungan, nomor_referensi, estimasi_dilayani, keterangan } = asd

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

                    let kirim = await axios.get(purworejo + "/get-poli", config)
                    let poli = kirim.data.data
                    let no = antrian_no.length == 0 ? 1 : +antrian_no[0].antrian_no + 1
                    let kode_booking = moment().format("YYYYMMDD") + `${initial}${no}`
                    let nomor_antrean = `${initial}-${no}`
                    let kode_poli = ''
                    let nama_poli = ''
                    let nik = ''
                    let no_hp = ''
                    for (let i = 0; i < poli.length; i++) {
                        if (idPoli == poli[i].id) {
                            kode_poli = poli[i].kdPoliBpjs
                            nama_poli = poli[i].nama
                        }
                    }
                    if (jenis_pasien == 'JKN') {
                        let tgl = moment().format("YYYY-MM-DD")
                        let kirim = await axios.get(purworejo + `/get-pasien-bpjs?noPeserta=${noBpjs}&tgl=${tgl}`, config)

                        nik = kirim.data.data.peserta.nik
                        no_hp = kirim.data.data.peserta.mr.noTelepon
                    }

                    // let kirimRajal = await axios.post(purworejo + "/reg-rajal", { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, noSuratKontrol, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan }, config)
                    // let idDaftar = kirimRajal.data.data.idDaftar

                    // let kirimSEP = await axios.post(purworejo + "/create-sep-apm", { idDaftar }, config)  //SEP
                    // let sep = kirimSEP.data.data.sep.data.sep
                    let sep
                    let hasilSEP = await sepModel.create({id:uuid_v4(),no_rm:noRm,kode_booking,no_sep:sep.noSep,data:sep},{transaction:t})

                    let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian: tgl, is_master: 1, poli_layanan: 1, initial, antrian_no: no, sequence: sequence_no[0].total, booking_id, jadwal_dokter_id, poli_id: idPoli, master_loket_id,no_rm: noRm, kode_booking }, { transaction: t })

                    let kirim2 = await axios.post(purworejo + "/create-antrean", { kodebooking: kode_booking, jenispasien: jenis_pasien, nomorkartu: noBpjs, nik, nohp: no_hp, kodepoli: kode_poli, namapoli: nama_poli, pasienbaru: pasien_baru, norm: noRm, tanggalperiksa: tanggal_periksa, kodedokter: kode_dokter, namadokter: nama_dokter, jampraktek: jam_praktek, jeniskunjungan: jenis_kunjungan, nomorreferensi: nomor_referensi, nomorantrean: nomor_antrean, angkaantrean: no, estimasidilayani: estimasi_dilayani, sisakuotajkn: 0, kuotajkn: 0, sisakuotanonjkn: 0, kuotanonjkn: 0, keterangan }, config)
                    
                    let kirim3 = await axios.post(purworejo + "/update-antrean", { kodebooking: kode_booking, waktu: estimasi_dilayani, taskid: 3 })
                    
                    hasil.dataValues.sisa_antrian = +sisa[0].total

                    await t.commit();
                    // let RAJAL = kirimRajal.data.data
                    // console.log(RAJAL, 'KIRIM RAJAL');
                    // let SEP = kirimSEP.data.data.sep
                    // console.log(SEP, "SEP");
                    io.emit("refresh_register_APM_mandiri", {hasil,hasilSEP});
                }

            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", error);
                // if (error.name = "AxiosError") {
                //     let respon_error = error.response.data
                //     console.log(respon_error);
                //     socket.emit("error", respon_error);
                // }
                // else {
                //     console.log(error);
                //     socket.emit("error", error);
                // }
            }
        })

        socket.on('registerAntreanBPJSLoket', async (asd) => {
            const { jenis_pasien, nomor_kartu, poli_id, pasien_baru, no_rm, tanggal_periksa, kode_dokter, nama_dokter, jam_praktek, jenis_kunjungan, nomor_referensi, nomor_antrean, angka_antrean, estimasi_dilayani, keterangan, id_antrian_list } = asd

            const t = await sq.transaction();

            try {
                let tanggal = moment().format("YYYYMMDD")
                let kode_booking = tanggal + nomor_antrean
                let kirim = await axios.get(purworejo + "/get-poli", config)
                let poli = kirim.data.data
                let kode_poli = ''
                let nama_poli = ''
                for (let i = 0; i < poli.length; i++) {
                    if (poli_id == poli[i].id) {
                        kode_poli = poli[i].kdPoliBpjs
                        nama_poli = poli[i].nama
                    }
                }

                let nik = ''
                let no_hp = ''
                if (jenis_pasien == 'JKN') {
                    let tgl = moment().format("YYYY-MM-DD")
                    let kirim = await axios.get(purworejo + `/get-pasien-bpjs?noPeserta=${nomor_kartu}&tgl=${tgl}`, config)

                    nik = kirim.data.data.peserta.nik
                    no_hp = kirim.data.data.peserta.mr.noTelepon
                }

                let kirim2 = await axios.post(purworejo + "/create-antrean", { kodebooking: kode_booking, jenispasien: jenis_pasien, nomorkartu: nomor_kartu, nik, nohp: no_hp, kodepoli: kode_poli, namapoli: nama_poli, pasienbaru: pasien_baru, norm: no_rm, tanggalperiksa: tanggal_periksa, kodedokter: kode_dokter, namadokter: nama_dokter, jampraktek: jam_praktek, jeniskunjungan: jenis_kunjungan, nomorreferensi: nomor_referensi, nomorantrean: nomor_antrean, angkaantrean: angka_antrean, estimasidilayani: estimasi_dilayani, sisakuotajkn: 0, kuotajkn: 0, sisakuotanonjkn: 0, kuotanonjkn: 0, keterangan }, config)

                let antrian = await antrian_list.update({ no_rm, kode_booking }, { where: { id: id_antrian_list } })

                let kirim3 = await axios.post(purworejo + "/update-antrean", { kodebooking: kode_booking, waktu: estimasi_dilayani, taskid: 3 })
                io.emit("refresh_register_antrean_BPJS_loket", kirim2.data);
            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", error);
                // if (error.name = "AxiosError") {
                //     let respon_error = error.response.data
                //     console.log(respon_error);
                //     socket.emit("error", respon_error);
                // }
                // else {
                //     console.log(error);
                //     socket.emit("error", error);
                // }
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