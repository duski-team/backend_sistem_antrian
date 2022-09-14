const master_dokter = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}


class Controller{

    static register(req,res){
        const{nama_dokter,tempat_lahir_dokter,tanggal_lahir_dokter,agama_dokter,no_hp_dokter,email_dokter,NIK_dokter,NPWP_dokter,edu_bachelor,edu_diploma,edu_doctor,keahlian_khusus,norek_bank,master_kualifikasi_id,master_specialist_id,master_bank_id,kj_str_number,kj_BPJS,tanggal_surat,tanggal_kadaluarsa_surat,jk_dokter}=req.body
        let f1=""
        let f2=""
        if (req.files) {
            if (req.files.file1) {
               f1 = req.files.file1[0].filename;
            }
            if (req.files.file2) {
              f2 = req.files.file2[0].filename;
            }
          }
                master_dokter.create({id:uuid_v4(),nama_dokter,tempat_lahir_dokter,tanggal_lahir_dokter,agama_dokter,no_hp_dokter,email_dokter,NIK_dokter,NPWP_dokter,edu_bachelor,edu_diploma,edu_doctor,keahlian_khusus,norek_bank,master_kualifikasi_id,master_specialist_id,master_bank_id,kj_str_number,kj_BPJS,tanggal_surat,jk_dokter,tanggal_kadaluarsa_surat,foto_dokter:f1,tanda_tangan:f2})
                .then(hasil2=>{
                res.status(200).json({ status: 200, message: "sukses",data:hasil2})
                })
                .catch(error=>{
                    console.log(error);
                    res.status(500).json({ status: 500, message: "gagal", data: error})
                })
     
    }

    static update(req,res){
        const{id,nama_dokter,tempat_lahir_dokter,tanggal_lahir_dokter,agama_dokter,no_hp_dokter,email_dokter,NIK_dokter,NPWP_dokter,edu_bachelor,edu_diploma,edu_doctor,keahlian_khusus,norek_bank,master_kualifikasi_id,master_specialist_id,master_bank_id,kj_str_number,kj_BPJS,tanggal_surat,tanggal_kadaluarsa_surat,jk_dokter}= req.body

        let f1=""
        let f2=""

        if (req.files) {
            if (req.files.file1) {
               f1 = req.files.file1[0].filename;
               master_dokter.update({foto_dokter:f1},{
                where:{id}
               })
            }
            if (req.files.file2) {
              f2 = req.files.file2[0].filename;
              master_dokter.update({tanda_tangan:f2},{
                where:{id}
               })
            }
          }

        master_dokter.update({nama_dokter,tempat_lahir_dokter,tanggal_lahir_dokter,agama_dokter,no_hp_dokter,email_dokter,NIK_dokter,NPWP_dokter,edu_bachelor,edu_diploma,edu_doctor,keahlian_khusus,norek_bank,master_kualifikasi_id,master_specialist_id,master_bank_id,kj_str_number,kj_BPJS,tanggal_surat,tanggal_kadaluarsa_surat,jk_dokter},{
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
            let data =await sq.query(`select *,md.id as master_dokter_id from master_dokter md 
            left join master_bank mb on mb.id=md.master_bank_id 
            left join master_kualifikasi mk on mk.id = md.master_kualifikasi_id 
            left join master_specialist ms on ms.id = md.master_specialist_id 
            where md."deletedAt" isnull `,s)
            res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

    }

    static async detailsById(req,res){  
        const {id}=req.params
        try {
            let data =await sq.query(`select *,md.id as master_dokter_id from master_dokter md 
            left join master_bank mb on mb.id=md.master_bank_id 
            left join master_kualifikasi mk on mk.id = md.master_kualifikasi_id 
            left join master_specialist ms on ms.id = md.master_specialist_id 
            where md."deletedAt" isnull and  md.id = '${id}'`,s)
            res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

    }

    static delete(req,res){
        const{id}=req.body
        master_dokter.destroy({where:{
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