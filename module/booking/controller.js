const booking = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}


class Controller{

    static register(req,res){
        const{tanggal_booking,jenis_booking,rm_id,NIK,nama_booking,no_hp_booking,no_rujukan,no_kontrol,is_verified,is_registered,status_booking}=req.body

        booking.create({id:uuid_v4(),tanggal_booking,jenis_booking,rm_id,NIK,nama_booking,no_hp_booking,no_rujukan,no_kontrol,is_verified,is_registered,status_booking})
        .then(data=>{
            res.status(200).json({ status: 200, message: "sukses", data})
        })
        .catch(error=>{
	    console.log(req.body)
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

}

module.exports=Controller