const purworejo = 'http://103.121.123.87/rsudapi/reg'
const token = 'agAW4AUAgjOtCMwIxcKnGjkDj6jj64vr'
const axios = require('axios')
const config = {
    headers: { Authorization: `Bearer ${token}`,'Content-Type': 'application/json' }
};
const antrian_list= require('../antrian_list/model')
const { v4: uuid_v4 } = require("uuid");
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}

class Controller{

    static async register(req,res){
        const{noRm,idPoli,idDokter,noTelp,idCaraMasuk,ketCaraMasuk,penanggungjawabNama,penanggungjawabHubungan,idJaminan,noBpjs,kelompokBpjs,kelasBpjs,diagAwal,noRujukan,asalRujukan,tglRujukan,idFaskes,namaFaskes,tujuanKunjungan,flagProcedure,kdPenunjang,assesmentPelayanan,initial,jadwal_dokter_id}=req.body
        console.log(req.body);

        try {
            let countantrian = await sq.query(`select count(*)  from antrian_list al  where al."deletedAt" isnull and jadwal_dokter_id ='${jadwal_dokter_id}' and al.is_master = 1`,s)
            let countsequence = await sq.query(`select count(*)  from antrian_list al  where al."deletedAt" isnull and jadwal_dokter_id ='${jadwal_dokter_id}' and al.is_master = 1`,s)
            let antrian_no= +countantrian[0].count +1
            let sequence_no= +countsequence[0].count +1
            let curdate= moment().format('YYYY-MM-DD')
            let kirim = await axios.post(purworejo+"/reg-rajal",{noRm,idPoli,idDokter,noTelp,idCaraMasuk,ketCaraMasuk,penanggungjawabNama,penanggungjawabHubungan,idJaminan,noBpjs,kelompokBpjs,kelasBpjs,diagAwal,noRujukan,asalRujukan,tglRujukan,idFaskes,namaFaskes,tujuanKunjungan,flagProcedure,kdPenunjang,assesmentPelayanan},config)

            await antrian_list.create({id:uuid_v4(),tanggal_antrian:curdate,is_master:1,poli_layanan:1,initial,antrian_no,sequence:sequence_no})

            res.status(200).json({ status: 200, message: "sukses"})

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error}) 
        }
    }

}


module.exports=Controller