const masterLoket = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}


class Controller{

    static register(req,res){
        const {nama_loket,status_loket}= req.body

        masterLoket.create({id:uuid_v4(),nama_loket,status_loket})
        .then(hasil=>{
            res.status(200).json({ status: 200, message: "sukses",data:hasil})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static update(req,res){
        const {id,nama_loket,status_loket}= req.body

        masterLoket.update({id:uuid_v4(),nama_loket,status_loket},{where:{
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
        masterLoket.findAll()
        .then(hasil=>{
            res.status(200).json({ status: 200, message: "sukses",data:hasil})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static detailsById(req,res){
        const{id}=req.params
        masterLoket.findAll({where:{
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
        masterLoket.destroy({where:{
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