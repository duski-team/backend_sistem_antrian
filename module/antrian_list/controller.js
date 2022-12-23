const antrian_list = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}

class Controller{

    static async register(req,res){
        const{tanggal_antrian,is_master,poli_layanan,initial,antrian_no,is_cancel,is_process,status_antrian,antrian_list_id,jadwal_dokter_id,poli_id,master_loket_id}=req.body

        let nomer_antrian=''

        if(antrian_no){
            nomer_antrian=antrian_no
        }
        else{
            let nomernya = await sq.query(`select count(*) from antrian_list al where date(al.tanggal_antrian) = '${tanggal_antrian}'and poli_id =${poli_id} and initial = '${initial}' and is_master=1`,s)
            nomer_antrian=+nomernya[0].count+1
        }

        const sequence = await sq.query(`select count(*) from antrian_list al where date(tanggal_antrian) = '${tanggal_antrian}' and poli_id =${poli_id} `,s)
        // res.json('oke')

        console.log(nomer_antrian,sequence[0].count);

        antrian_list.create({id:uuid_v4(),tanggal_antrian,is_master,poli_layanan,initial,antrian_no:nomer_antrian,sequence:+sequence[0].count+1,is_cancel,is_process,status_antrian,antrian_list_id,jadwal_dokter_id,poli_id,master_loket_id})
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