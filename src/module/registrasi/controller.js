const axios = require('axios')
const antrian_list = require('../antrian_list/model')
const { v4: uuid_v4 } = require("uuid");
const { sq } = require("../../config/connection");
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }

const purworejo = process.env.HOST_PURWOREJO
const config = require("../../helper/config").config
class Controller {

    static async register(req, res) {
        const { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan, initial, jadwal_dokter_id } = req.body
        console.log(req.body);

        try {
            let countantrian = await sq.query(`select count(*)  from antrian_list al  where al."deletedAt" isnull and jadwal_dokter_id ='${jadwal_dokter_id}' and al.is_master = 1`, s)
            let countsequence = await sq.query(`select count(*)  from antrian_list al  where al."deletedAt" isnull and jadwal_dokter_id ='${jadwal_dokter_id}' and al.is_master = 1`, s)
            let antrian_no = +countantrian[0].count + 1
            let sequence_no = +countsequence[0].count + 1
            let curdate = moment().format('YYYY-MM-DD')
            let kirim = await axios.post(purworejo + "/reg-rajal", { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan }, config)

            await antrian_list.create({ id: uuid_v4(), tanggal_antrian: curdate, is_master: 1, poli_layanan: 1, initial, antrian_no, sequence: sequence_no })

            res.status(200).json({ status: 200, message: "sukses" })

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async registerAPM(req, res) {
        const { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan, initial, jadwal_dokter_id,booking_id } = req.body

        const t = await sq.transaction();
        try {
            let cekBooking = []
            let tgl = moment().format('YYYY-MM-DD')
            let sequence_no = await sq.query(`select count(*)+1 as total from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_id = ${idPoli}`, s);
            let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan = 1 and al.status_antrian in (0,1) and al.poli_id = ${idPoli}`, s);

            if(booking_id){
                cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tanggal_antrian) = '${tgl}'`, s)
            }
            if(cekBooking.length>0){
                cekBooking[0].sisa_antrian = sisa[0].total-1
                res.status(200).json({ status: 200, message: "sukses", data: cekBooking })
            }else{
                let antrian_no = await sq.query(`select (count(*) -(select count(*) from antrian_list al2 where al2."deletedAt" isnull and al2.poli_layanan = 2 and al2.initial = '${initial}' and date(al2.tanggal_antrian)= '${tgl}' and al2.status_antrian = 2)) + 1 as total 
                from antrian_list al where al."deletedAt" isnull and al.initial = '${initial}' and date(al.tanggal_antrian) = '${tgl}' `, s)
                let kirimRajal = await axios.post(purworejo + "/reg-rajal", { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan }, config)

                let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian: tgl, is_master: 1, poli_layanan: 1, initial, antrian_no:antrian_no[0].total, sequence: sequence_no[0].total,booking_id,jadwal_dokter_id,poli_id:idPoli },{transaction:t})
                hasil.dataValues.sisa_antrian = +sisa[0].total

                await t.commit();
                res.status(200).json({ status: 200, message: "sukses",data:hasil })
            }
        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async registerAPMBPJS(req, res) {
        const { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan, initial, jadwal_dokter_id,booking_id } = req.body
        
        const t = await sq.transaction();
        try {
            let cekBooking = []
            let tgl = moment().format('YYYY-MM-DD')
            let sequence_no = await sq.query(`select count(*)+1 as total from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_id = ${idPoli}`, s);
            let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan = 1 and al.status_antrian in (0,1) and al.poli_id = ${idPoli}`, s);

            if(booking_id){
                cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tanggal_antrian) = '${tgl}'`, s)
            }
            if(cekBooking.length>0){
                cekBooking[0].sisa_antrian = sisa[0].total-1
                res.status(200).json({ status: 200, message: "sukses", data: cekBooking })
            }else{
                let antrian_no = await sq.query(`select (count(*) -(select count(*) from antrian_list al2 where al2."deletedAt" isnull and al2.poli_layanan = 2 and al2.initial = '${initial}' and date(al2.tanggal_antrian)= '${tgl}' and al2.status_antrian = 2)) + 1 as total 
                from antrian_list al where al."deletedAt" isnull and al.initial = '${initial}' and date(al.tanggal_antrian) = '${tgl}' `, s)
                let kirimRajal = await axios.post(purworejo + "/reg-rajal", { noRm, idPoli, idDokter, noTelp, idCaraMasuk, ketCaraMasuk, penanggungjawabNama, penanggungjawabHubungan, idJaminan, noBpjs, kelompokBpjs, kelasBpjs, diagAwal, noRujukan, asalRujukan, tglRujukan, idFaskes, namaFaskes, tujuanKunjungan, flagProcedure, kdPenunjang, assesmentPelayanan }, config)
                let idDaftar = kirimRajal.data.data.idDaftar
                await axios.post(purworejo + "/create-sep-apm", { idDaftar }, config)  //SEP
                let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian: tgl, is_master: 1, poli_layanan: 1, initial, antrian_no:antrian_no[0].total, sequence: sequence_no[0].total,booking_id,jadwal_dokter_id,poli_id:idPoli })
                hasil.dataValues.sisa_antrian = +sisa[0].total

                await t.commit();
                res.status(200).json({ status: 200, message: "sukses",data:hasil })
            }
        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async registerSEP(req, res) {
        const { idDaftar } = req.body

        try {
            let kirim = await axios.post(purworejo + "/create-sep-apm", { idDaftar }, config)

            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}


module.exports = Controller