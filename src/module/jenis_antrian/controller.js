const jenis_antrian = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}


class Controller{

    static register(req,res){
        const {nama_jenis_antrian,kode_jenis_antrian,status_jenis_antrian}= req.body

        jenis_antrian.create({id:uuid_v4(),nama_jenis_antrian,kode_jenis_antrian,status_jenis_antrian})
        .then(hasil=>{
            res.status(200).json({ status: 200, message: "sukses",data:hasil})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static update(req,res){
        const {id,nama_jenis_antrian,kode_jenis_antrian,status_jenis_antrian}= req.body

        jenis_antrian.update({id:uuid_v4(),nama_jenis_antrian,kode_jenis_antrian,status_jenis_antrian},{where:{
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

    static list(req,res){
        
        jenis_antrian.findAll().then(hasil=>{
            res.status(200).json({ status: 200, message: "sukses",data:hasil})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static detailsById(req,res){
        const{id}=req.params
        jenis_antrian.findAll({where:{
            id
        }})
        .then(hasil=>{
            res.status(200).json({ status: 200, message: "sukses",data:hasil})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static delete(req,res){
        const{id}=req.body
        jenis_antrian.destroy({where:{
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