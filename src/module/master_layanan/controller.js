const master_layanan = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const users = require('./model');
const { QueryTypes } = require('sequelize');


const s = {type:QueryTypes.SELECT}


class Controller{

    static register(req,res){
        const{nama_layanan,kode}=req.body
        master_layanan.findAll({where:{
            nama_layanan
        }})
        .then(hasil1=>{
            if(hasil1.length){
                res.status(200).json({ status: 200, message: "data sudah ada" });
            }
            else{
                master_layanan.create({id:uuid_v4(),nama_layanan,kode})
                .then(hasil2=>{
                res.status(200).json({ status: 200, message: "sukses",data:hasil2})
                })
            }
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static update(req,res){
        const{id,nama_layanan,kode}= req.body
        master_layanan.update({nama_layanan,kode},{
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
            let data =await sq.query(`select * from master_layanan ml where ml."deletedAt" isnull`,s)
            res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

    }

    static async detailsById(req,res){  
        const {id}=req.params
        try {
            let data =await sq.query(`select * from master_layanan ml where ml."deletedAt" isnull and ml.id = '${id}'`,s)
            res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

    }

    static delete(req,res){
        const{id}=req.body
        master_layanan.destroy({where:{
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