const master_bank = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}


class Controller{

    static register(req,res){
        const{nama_bank}=req.body
        master_bank.findAll({where:{
            nama_bank
        }})
        .then(hasil1=>{
            if(hasil1.length){
                res.status(200).json({ status: 200, message: "data sudah ada" });
            }
            else{
                master_bank.create({id:uuid_v4(),nama_bank})
                .then(hasil2=>{
                res.status(200).json({ status: 200, message: "sukses",data:hasil2})
                })
            }
        })
    }

    static update(req,res){
        const{id,nama_bank}= req.body
        master_bank.update({nama_bank},{
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
            let data =await sq.query(`select * from master_bank ml where ml."deletedAt" isnull`,s)
            res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

    }

    static async detailsById(req,res){  
        const {id}=req.params
        try {
            let data =await sq.query(`select * from master_bank ml where ml."deletedAt" isnull and ml.id = '${id}'`,s)
            res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

    }

    static delete(req,res){
        const{id}=req.body
        master_bank.destroy({where:{
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