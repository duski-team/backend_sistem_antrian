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
            const { id, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, id_antrian_list, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id, kode_booking, taskid } = asd

            const t = await sq.transaction();

            try {
                await antrian_list.update({ tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, id_antrian_list, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id }, { where: { id }, transaction: t })
                if (kode_booking && taskid) {
                    let waktu = moment(new Date()).format('x')
                    let x = { kodebooking: kode_booking, taskid, waktu }
                    let kirim = await axios.post(purworejo + "/update-antrean", x, config)
                    console.log(x, "kode booking");
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
                        await booking.update({ status_booking: 9 }, { where: { id: booking_id }, transaction: t })
                    }
                    await t.commit();
                    io.emit("refresh_admin", asd);
                }
            } catch (error) {
                await t.rollback();
                console.log(error);
                if (error.name == "AxiosError") {
                    socket.emit("error", { status: error.response.data.code, message: error.response.data.message });
                } else {
                    socket.emit("error", { status: 500, message: "gagal" });
                }
            }
        })

        socket.on('registerAntrianLoket', async (asd, room_id) => {
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
                socket.emit("error", { status: 500, message: "gagal" });
            }
        })

        socket.on('registerMandiri', async (asd) => {
            const { id_antrian_list, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id, kode_booking } = asd

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

                let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].total, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id, kode_booking }, { transaction: t })
                hasil.dataValues.sisa_antrian = +sisa[0].total
                await t.commit();

                io.emit("refresh_register_mandiri", hasil);
            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", { status: 500, message: "gagal" });
            }
        })

        socket.on('registerAntrianLayanan', async (asd) => {
            const { id_antrian_list, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id, kode_booking, taskid } = asd

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
                if (kode_booking && taskid) {
                    let waktu = moment(new Date()).format('x')
                    let x = { kodebooking: kode_booking, taskid, waktu }
                    let kirim = await axios.post(purworejo + "/update-antrean", x, config)
                    console.log(x, "kode_booking");
                    console.log(kirim.data.data);
                }

                let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].nomor, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, booking_id, kode_booking }, { transaction: t })
                hasil.dataValues.sisa_antrian = +sisa[0].total
                await t.commit();
                io.emit("refresh_antrian_layanan", asd);
            } catch (error) {
                await t.rollback();
                console.log(error);
                if (error.name == "AxiosError") {
                    socket.emit("error", { status: error.response.data.code, message: error.response.data.message });
                } else {
                    socket.emit("error", { status: 500, message: "gagal" });
                }
            }
        })

        socket.on('registerAPMMandiri', async (asd, room_id) => {
            const { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan, initial, jadwal_dokter_id, booking_id, master_loket_id, jenis_pasien, pasien_baru, tanggal_periksa, kode_dokter, nama_dokter, jam_praktek, jenis_kunjungan, estimasi_dilayani, keterangan } = asd

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
                    io.to(room_id).emit("refresh_register_APM_mandiri", { hasil: cekBooking[0], hasilSEP: { status: 500 } });
                } else {
                    let antrian_no = await sq.query(`select al.antrian_no from antrian_list al where date(al.tanggal_antrian) = '${tgl}'and al.initial = '${initial}' order by al.antrian_no desc limit 1`, s)
                    let no = antrian_no.length == 0 ? 1 : +antrian_no[0].antrian_no + 1

                    let kode_booking = moment().format("YYYYMMDDHHmmss") + `${initial}${no}`
                    let tgl_periksa = moment().format("YYYY-MM-DD")
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

                    let kirim4 = await axios.get(purworejo + "/get-pasien?no=" + noRm, config)

                    let nik = kirim4.data.data[0].nik
                    let no_hp = kirim4.data.data[0].noTelp

                    let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian: tgl, is_master: 1, poli_layanan: 1, initial, antrian_no: no, sequence: sequence_no[0].total, booking_id, jadwal_dokter_id, poli_id: idPoli, master_loket_id, no_rm: noRm, kode_booking }, { transaction: t })
                    hasil.dataValues.sisa_antrian = +sisa[0].total

                    let objCreate = { kodebooking: kode_booking, jenispasien: "NON JKN", nomorkartu: "", nik: nik, nohp: no_hp, kodepoli: kode_poli, namapoli: nama_poli, pasienbaru: 0, norm: noRm, tanggalperiksa: tgl_periksa, kodedokter: kode_dokter, namadokter: nama_dokter, jampraktek: jam_praktek, jeniskunjungan: jenis_kunjungan, nomorreferensi: "", nomorantrean: nomor_antrean, angkaantrean: no, estimasidilayani: estimasi_dilayani, sisakuotajkn: 0, kuotajkn: 0, sisakuotanonjkn: 0, kuotanonjkn: 0, keterangan: keterangan }
                    let kirim2 = await axios.post(purworejo + "/create-antrean", objCreate, config)
                    let objUpdate = { kodebooking: kode_booking, waktu: estimasi_dilayani, taskid: 3 }
                    let kirim3 = await axios.post(purworejo + "/update-antrean", objUpdate, config)

                    // console.log(objCreate);
                    // console.log(objUpdate);
                    // console.log(kirim2.data, "CREATE-ANTREAN");
                    // console.log(kirim3.data, "UPDATE-ANTREAN");

                    if (kirim2.data.code == 200 && kirim3.data.code == 200) {
                        let kirimRajal = await axios.post(purworejo + "/reg-rajal", { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan }, config)
                        // console.log(kirimRajal, 'KIRIM RAJAL');
                        await t.commit();
                        io.to(room_id).emit("refresh_register_APM_mandiri", { hasil, hasilSEP: { status: 500 } });
                    } else {
                        io.to(room_id).emit("error", { status: 500, message: kirim2.data.code == 201 ? kirim2.data.message : kirim3.data.message });
                    }
                }
            } catch (error) {
                await t.rollback();
                // console.log(error);
                if (error.name = "AxiosError" && error.response.data) {
                    io.to(room_id).emit("error", { status: error.response.data.code, message: error.response.data.message });
                } else {
                    io.to(room_id).emit("error", { status: 500, message: "gagal" });
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

        socket.on('registerAPMBPJS', async (asd, room_id) => {
            const { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan, initial, jadwal_dokter_id, booking_id, master_loket_id, noSuratKontrol, pasien_baru, kode_dokter, nama_dokter, jam_praktek, jenis_kunjungan, estimasi_dilayani, keterangan } = asd

            const t = await sq.transaction();

            try {
                let cekBooking = []
                let tgl = moment().format('YYYY-MM-DD')
                let sequence_no = await sq.query(`select count(*)+1 as total from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_id = ${idPoli}`, s);
                let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan = 1 and al.status_antrian in (0,1) and al.poli_id = ${idPoli}`, s);

                if (booking_id) {
                    cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tanggal_antrian) = '${tgl}'`, s);
                }
                if (cekBooking.length > 0) {
                    let printSEP = await sq.query(`select s.* from sep s join antrian_list al on al.id = s.antrian_list_id where s."deletedAt" isnull and al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tanggal_antrian)='${tgl}'`, s)
                    printSEP[0].status = 200
                    cekBooking[0].sisa_antrian = sisa[0].total - 1
                    io.to(room_id).emit("refresh_register_APM_mandiri", { hasil: cekBooking[0], hasilSEP: printSEP[0] });
                } else {
                    let antrian_no = await sq.query(`select al.antrian_no from antrian_list al where date(al.tanggal_antrian) = '${tgl}'and al.initial = '${initial}' order by al.antrian_no desc limit 1`, s)

                    let kirim = await axios.get(purworejo + "/get-poli", config)
                    let poli = kirim.data.data
                    let no = antrian_no.length == 0 ? 1 : +antrian_no[0].antrian_no + 1
                    let kode_booking = moment().format("YYYYMMDDHHmmss") + `${initial}${no}`
                    let nomor_antrean = `${initial}-${no}`
                    let kode_poli = ''
                    let nama_poli = ''
                    for (let i = 0; i < poli.length; i++) {
                        if (idPoli == poli[i].id) {
                            kode_poli = poli[i].kdPoliBpjs
                            nama_poli = poli[i].nama
                        }
                    }
                    let kirim4 = await axios.get(purworejo + "/get-pasien?no=" + noRm, config)
                    let poli_tujuan = `${kode_poli}-${nama_poli}`
                    let nik = kirim4.data.data[0].nik
                    let no_hp = kirim4.data.data[0].noTelp
                    let tgl_periksa = moment().format("YYYY-MM-DD")

                    let idAntrian = uuid_v4()
                    let hasil = await antrian_list.create({ id: idAntrian, tanggal_antrian: tgl, is_master: 1, poli_layanan: 1, initial, antrian_no: no, sequence: sequence_no[0].total, booking_id, jadwal_dokter_id, poli_id: idPoli, master_loket_id, no_rm: noRm, kode_booking }, { transaction: t })

                    let objCreate = { kodebooking: kode_booking, jenispasien: "JKN", nomorkartu: noBpjs, nik: nik, nohp: no_hp, kodepoli: kode_poli, namapoli: nama_poli, pasienbaru: pasien_baru, norm: noRm, tanggalperiksa: tgl_periksa, kodedokter: kode_dokter, namadokter: nama_dokter, jampraktek: jam_praktek, jeniskunjungan: jenis_kunjungan, nomorreferensi: noRujukan ? noRujukan : "", nomorantrean: nomor_antrean, angkaantrean: no, estimasidilayani: estimasi_dilayani, sisakuotajkn: 0, kuotajkn: 0, sisakuotanonjkn: 0, kuotanonjkn: 0, keterangan: keterangan }
                    let kirim2 = await axios.post(purworejo + "/create-antrean", objCreate, config)
                    let objUpdate = { kodebooking: kode_booking, waktu: estimasi_dilayani, taskid: 3 }
                    let kirim3 = await axios.post(purworejo + "/update-antrean", objUpdate, config)

                    hasil.dataValues.sisa_antrian = +sisa[0].total
                    

                    // console.log(objCreate);
                    // console.log(objUpdate);
                    // console.log(kirim2.data, "CREATE-ANTREAN");
                    // console.log(kirim3.data, "UPDATE-ANTREAN");

                    // let RAJAL = kirimRajal.data.data
                    // console.log(RAJAL, 'KIRIM RAJAL');
                    // let SEP = kirimSEP.data.data.sep
                    // console.log(JSON.stringify(kirimSEP.data.data));
                    // console.log(SEP, "SEP");

                    if (kirim2.data.code == 200 && kirim3.data.code == 200) {
                        let kirimRajal = await axios.post(purworejo + "/reg-rajal", { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, noSuratKontrol, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan }, config)
                        let idDaftar = kirimRajal.data.data.idDaftar

                        let kirimSEP = await axios.post(purworejo + "/create-sep-apm", { idDaftar }, config)  //SEP
                        let sep = kirimSEP.data.data.sep
                        // let sep = {noSep:01}
                        let hasilSEP = await sepModel.create({ id: uuid_v4(), no_sep: sep.noSep, nama_dokter, data_sep: sep, antrian_list_id: idAntrian, poli_tujuan }, { transaction: t })
                        hasilSEP.dataValues.status = 200
                        await t.commit();
                        io.to(room_id).emit("refresh_register_APM_mandiri", { hasil, hasilSEP });
                    } else {
                        io.to(room_id).emit("error", { status: 500, message: kirim2.data.code == 201 ? kirim2.data.message : kirim3.data.message });
                    }
                }

            } catch (error) {
                await t.rollback();
                console.log(error);
                if (error.name = "AxiosError" && error.response.data) {
                    io.to(room_id).emit("error", { status: error.response.data.code, message: error.response.data.message });
                } else {
                    io.to(room_id).emit("error", { status: 500, message: "gagal" });
                }
            }
        })

        socket.on('registerAntreanBPJSLoket', async (asd) => {
            const { nomor_kartu, poli_id, pasien_baru, no_rm, kode_dokter, nama_dokter, jam_praktek, jenis_kunjungan, nomor_referensi, nomor_antrean, angka_antrean, estimasi_dilayani, keterangan, id_antrian_list, noRujukan } = asd

            const t = await sq.transaction();

            try {
                let tanggal = moment().format("YYYYMMDDHHmmss")
                let kode_booking = tanggal + nomor_antrean.replace("-", "")
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

                let kirim4 = await axios.get(purworejo + "/get-pasien?no=" + no_rm, config)

                let nik = kirim4.data.data[0].nik
                let no_hp = kirim4.data.data[0].noTelp
                let tgl_periksa = moment().format("YYYY-MM-DD")

                let objCreate = { kodebooking: kode_booking, jenispasien: "JKN", nomorkartu: nomor_kartu, nik: nik, nohp: no_hp, kodepoli: kode_poli, namapoli: nama_poli, pasienbaru: pasien_baru, norm: no_rm, tanggalperiksa: tgl_periksa, kodedokter: kode_dokter, namadokter: nama_dokter, jampraktek: jam_praktek, jeniskunjungan: jenis_kunjungan, nomorreferensi: noRujukan, nomorantrean: nomor_antrean, angkaantrean: angka_antrean, estimasidilayani: estimasi_dilayani, sisakuotajkn: 0, kuotajkn: 0, sisakuotanonjkn: 0, kuotanonjkn: 0, keterangan: keterangan }

                let kirim2 = await axios.post(purworejo + "/create-antrean", objCreate, config)
                let antrian = await antrian_list.update({ no_rm, kode_booking }, { where: { id: id_antrian_list } })
                let objUpdate = { kodebooking: kode_booking, waktu: estimasi_dilayani, taskid: 3 }
                let kirim3 = await axios.post(purworejo + "/update-antrean", objUpdate, config)

                // console.log(objCreate);
                // console.log(objUpdate);
                // console.log(kirim2.data, "CREATE-ANTREAN");
                // console.log(kirim3.data, "UPDATE-ANTREAN");
                // io.emit("refresh_register_antrean_BPJS_loket", kirim2.data);

                if (kirim2.data.code == 200 && kirim3.data.code == 200) {
                    io.emit("refresh_register_antrean_BPJS_loket", antrian);
                } else {
                    io.to(room_id).emit("error", { status: 500, message: kirim2.data.code == 201 ? kirim2.data.message : kirim3.data.message });
                }
            } catch (error) {
                await t.rollback();
                console.log(error);
                if (error.name = "AxiosError") {
                    io.to(room_id).emit("error", { status: error.response.data.code, message: error.response.data.message });
                } else {
                    io.to(room_id).emit("error", { status: 500, message: "gagal" });
                }
            }
        })

        socket.on('listKuotaPoli', async (asd) => {
            try {
                let kirim = await axios.get(purworejo + "/get-poli", config)
                let data_poli = kirim.data.data
                let tanggal = moment().format("YYYY-MM-DD")
                let kuota_antrian = await sq.query(`select al.poli_id, count(*) as total_kuota_terbooking from antrian_list al where al."deletedAt" isnull and al.poli_layanan in (1,2) and date(al.tanggal_antrian) = '${tanggal}' and al.status_antrian < 2 group by al.poli_id `, s)
                let kuota_booking = await sq.query(`select jd.poli_id ,jd.kuota ,jd.kuota_mobile ,count(*) as "jumlah_booking" from booking b join jadwal_dokter jd on jd.id = b.jadwal_dokter_id where b."deletedAt" isnull and jd."deletedAt" isnull and b.status_booking in (1,2,9) and date(jd.waktu_mulai) = '${tanggal}' group by jd.poli_id ,jd.kuota ,jd.kuota_mobile`, s)
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
                io.emit("refresh_list_kuota_poli", data_poli);
            } catch (error) {
                console.log(error);
                io.emit("error", { status: 500, message: "gagal" });
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