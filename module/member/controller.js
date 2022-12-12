const member = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}

const purworejo = 'http://103.121.123.87/rsudapi/reg'
const token = 'agAW4AUAgjOtCMwIxcKnGjkDj6jj64vr'
const axios = require('axios');
const config = {
    headers: { Authorization: `Bearer ${token}`,'Content-Type': 'application/json' }
};

class Controller{

    static register(req,res){
        const{no_rm_pasien}= req.body

        member.findAll({where:{
            no_rm_pasien
        }})
        .then(async hasilnya=>{
            if(hasilnya.length){
                res.status(200).json({ status: 200, message: "gagal, pasien tersebut sudah terdaftar"})
            }
            else{
               await member.create({id:uuid_v4(),no_rm_pasien,user_id:req.dataUsers.id})
                .then(data=>{
                    res.status(200).json({ status: 200, message: "sukses", data})
                })
                .catch(error=>{
                console.log(error)
                    res.status(500).json({ status: 500, message: "gagal", data: error})
                })
            }
        })

        
    }

    static async cekPasien(req,res){
        const{NIK}=req.params
        try {
            let kirim = await axios.get(purworejo+"/get-pasien?no="+NIK,config)
            res.status(200).json({ status: 200, message: "sukses",data:kirim.data})
        } catch (error) {
            console.log(error.response.status);
            if(error.response.status=404){
                res.status(200).json({ status: 200, message: "data pasien tidak ada"})
            }
            else{
                res.status(500).json({ status: 500, message: "gagal", data: error.code})
            }
            
        }
    }

    static update(req,res){
        const{no_rm_pasien,user_id,id}= req.body
        member.update({no_rm_pasien,user_id},{where:{
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

    static async listMember(req,res){
        //butuh IN pada query
    }

}

module.exports=Controller