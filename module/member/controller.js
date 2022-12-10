const member = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}

class Controller{

    static register(req,res){
        const{pasien_id,user_id}= req.body
        member.create({id:uuid_v4(),pasien_id,user_id})
        .then(data=>{
            res.status(200).json({ status: 200, message: "sukses", data})
        })
        .catch(error=>{
	    console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static cekPasien(req,res){

    }

}

module.exports=Controller