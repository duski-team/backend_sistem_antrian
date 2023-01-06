const member = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}
const axios = require('axios');

const purworejo = process.env.HOST_PURWOREJO
const config = require("../../helper/config").config

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
        const{no}=req.params
        try {
            let kirim = await axios.get(purworejo+"/get-pasien?no="+no,config)
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

    static deleteMember(req,res){
        const{no_rm_pasien}=req.body
        member.destroy({where:{
            no_rm_pasien,
            user_id:req.dataUsers.id
        }})
        .then(hasil=>{
            res.status(200).json({ status: 200, message: "sukses"})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static async listMemberByUserId(req,res){
        const{user_id}=req.params

        try {
        let data=[]
        let membernya= await sq.query(`select no_rm_pasien from member m where m.user_id='${user_id}' and m."deletedAt" isnull`,s)

        for(let i=0;i<membernya.length;i++){
            let kirim = await axios.get(purworejo+"/get-pasien?no="+membernya[i].no_rm_pasien,config)
            data.push(kirim.data.data[0])
        }

        res.status(200).json({ status: 200, message: "sukses",data:data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

        



    }

}

module.exports=Controller