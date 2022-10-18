const antrian_loket = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}


class Controller{

    static async register(req,res){
        const{tanggal_antrian_loket,jenis_antrian_id}=req.body
        try {
            let data=await sq.query(`select count(*) from antrian_loket al where al.tanggal_antrian_loket ='${tanggal_antrian_loket}' and jenis_antrian_id ='${jenis_antrian_id}' `,s)
            antrian_loket.create({id:uuid_v4(),tanggal_antrian_loket,jenis_antrian_id,nomor_antrian_loket:data[0].count})
            .then(hasil=>{
                res.status(200).json({ status: 200, message: "sukses",data:hasil})
            })
            .catch(error=>{
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error})
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

       
    }
    

    static update(req,res){
        const{id,status_antrian,master_loket_id}=req.body
        antrian_loket.update({master_loket_id,status_antrian},{where:{
            id
        }})  .then(hasil=>{
            res.status(200).json({ status: 200, message: "sukses"})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })

    }

}


module.exports=Controller