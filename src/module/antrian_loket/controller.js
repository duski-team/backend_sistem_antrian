const antrian_loket = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}


class Controller{

    static async register(req,res){
        const{tanggal_antrian_loket,jenis_antrian_id}=req.body
        try {
            let data=await sq.query(`select count(*) from antrian_loket al where al.tanggal_antrian_loket ='${tanggal_antrian_loket}' and jenis_antrian_id ='${jenis_antrian_id}' `,s)
            antrian_loket.create({id:uuid_v4(),tanggal_antrian_loket,jenis_antrian_id,nomor_antrian_loket:+data[0].count+1})
            .then(hasil=>{
                res.status(200).json({ status: 200, message: "sukses",data:hasil})
            })
            .catch(error=>{
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error})
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

       
    }
    

    static update(req,res){
        const{id,status_antrian,master_loket_id}=req.body
        antrian_loket.update({master_loket_id,status_antrian},{where:{
            id
        },
        returning:true,
        plain:true
    
    })  .then(async hasil=>{
        let data = await sq.query(`select al.id as antrian_loket_id,* from antrian_loket al join jenis_antrian ja on ja.id = al.jenis_antrian_id left join master_loket ml on ml.id = al.master_loket_id where al."deletedAt" isnull and al.id = '${id}'`,s)
            res.status(200).json({ status: 200, message: "sukses",hasil:data[0]})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })

    }

    static async list(req,res){
        const{tanggal_awal,tanggal_akhir,jenis_antrian_id,halaman,jumlah,status_antrian}=req.body
        let isi = '';
        let offset = (+halaman -1) * jumlah;
        // let offset2 = +halaman * jumlah;
        // let sisa = true;
        
        try {

            if(tanggal_awal){
                isi+= ` and al.tanggal_antrian_loket >= '${tanggal_awal}'`
            }
            if(tanggal_akhir){
                isi+= ` and al.tanggal_antrian_loket <= '${tanggal_akhir}'`
            }
            if(jenis_antrian_id){
                isi+= ` and al.jenis_antrian_id = '${jenis_antrian_id}'`
            }
            if(status_antrian){
                isi+= ` and al.status_antrian = ${status_antrian}`
            }



            let data = await sq.query(`select al.id as antrian_loket_id,* from antrian_loket al join jenis_antrian ja on ja.id = al.jenis_antrian_id left join master_loket ml on ml.id = al.master_loket_id where al."deletedAt" isnull ${isi} order by al."nomor_antrian_loket" asc limit ${jumlah} offset ${offset} `,s)

            let jml = await sq.query(`select count(*) from antrian_loket al join jenis_antrian ja on ja.id = al.jenis_antrian_id where al."deletedAt" isnull ${isi} `,s)

            res.status(200).json({ status: 200, message: "sukses",data,jml:jml[0].count})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
    }

    static async detailsById(req,res){
        try {
            const{id}=req.params
            let data = await sq.query(`select al.id as antrian_loket_id,* from antrian_loket al join jenis_antrian ja on ja.id = al.jenis_antrian_id where al."deletedAt" isnull and al.id='${id}'  `,s)
            res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
    }


}


module.exports=Controller