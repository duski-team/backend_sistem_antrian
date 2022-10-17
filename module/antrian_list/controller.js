const antrian_list = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}

class Controller{

    static register(req,res){
        const{tanggal_antrian,is_master,poli_layanan,initial,antrian_no,sequence,is_cancel,is_process,status_antrian,antrian_list_id,jadwal_dokter_id}=req.body

        antrian_list.create({id:uuid_v4(),tanggal_antrian,is_master,poli_layanan,initial,antrian_no,sequence,is_cancel,is_process,status_antrian,antrian_list_id,jadwal_dokter_id})
        .then(hasil=>{
            res.status(200).json({ status: 200, message: "sukses",data:hasil})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }
}
module.exports=Controller