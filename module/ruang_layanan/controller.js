const ruang_layanan = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const users = require('./model');
const { QueryTypes } = require('sequelize');


const s = {type:QueryTypes.SELECT}


class Controller{

    static register(req,res){
        const{nama_ruangan,status_ruangan,master_layanan_id}=req.body
        ruang_layanan.findAll({where:{
            nama_ruangan
        }})
        .then(hasil1=>{
            if(hasil1.length){
                res.status(200).json({ status: 200, message: "data sudah ada" });
            }
            else{
                ruang_layanan.create({id:uuid_v4(),nama_ruangan,status_ruangan,master_layanan_id})
                .then(hasil2=>{
                res.status(200).json({ status: 200, message: "sukses",data:hasil2})
                })
            }
        })
    }

    static update(req,res){
        const{id,nama_ruangan,status_ruangan,master_layanan_id}= req.body
        ruang_layanan.update({nama_ruangan,status_ruangan,master_layanan_id},{
            where:{
                id
            }
        })
        .then(hasil=>{
            res.status(200).json({ status: 200, message: "sukses"})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static async list(req,res){

        try {
            let data =await sq.query(`select rl.id as ruang_layanan_id,* from ruang_layanan rl join master_layanan ml on ml.id = rl.master_layanan_id where rl."deletedAt" isnull`,s)
            res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

    }

    static async detailsById(req,res){  
        const {id}=req.params
        try {
            let data =await sq.query(`select rl.id as ruang_layanan_id,* from ruang_layanan rl join master_layanan ml on ml.id = rl.master_layanan_id where rl."deletedAt" isnull and rl.id = '${id}'`,s)
            res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

    }

    static delete(req,res){
        const{id}=req.body
        ruang_layanan.destroy({where:{
            id
        }})
        .then(hasil=>{
            res.status(200).json({ status: 200, message: "sukses"})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })

    }

}

module.exports=Controller