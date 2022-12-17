const jadwal_dokter = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}

const purworejo = 'http://103.121.123.87/rsudapi/reg'
const token = 'agAW4AUAgjOtCMwIxcKnGjkDj6jj64vr'
const axios = require('axios');
const moment = require('moment');
const config = {
    headers: { Authorization: `Bearer ${token}`,'Content-Type': 'application/json' }
};

class Controller{

    static register(req,res){
        const{waktu_mulai,waktu_selesai,kode_jadwal,kuota,master_poliklinik_id,master_dokter_id,master_layanan_id}=req.body
                jadwal_dokter.create({id:uuid_v4(),waktu_mulai,waktu_selesai,kode_jadwal,kuota,master_poliklinik_id,master_dokter_id,master_layanan_id})
                .then(hasil2=>{
                res.status(200).json({ status: 200, message: "sukses",data:hasil2})
                })
                .catch(error=>{
                    console.log(error);
                    res.status(500).json({ status: 500, message: "gagal", data: error})
                })
    }

    static update(req,res){
        const{id,waktu_mulai,waktu_selesai,kode_jadwal,kuota,master_poliklinik_id,master_dokter_id,master_layanan_id}= req.body
        jadwal_dokter.update({waktu_mulai,waktu_selesai,kode_jadwal,kuota,master_poliklinik_id,master_dokter_id,master_layanan_id},{
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
        const{waktu_mulai,waktu_selesai,kode_jadwal,master_poliklinik_id,master_dokter_id,master_layanan_id,halaman,jumlah}=req.body
        

        try {
            let isi = '';
            let offset = (+halaman -1) * jumlah;
            let offset2 = +halaman * jumlah;
            let sisa = true;

            if(waktu_mulai){
                isi+=`and jd.waktu_mulai >= '${waktu_mulai}'`
            }
            if(waktu_selesai){
                isi+=`and jd.waktu_selesai <= '${waktu_selesai}'`
            }
            if(kode_jadwal){
                isi+=`and jd.kode_jadwal ilike '%${kode_jadwal}%'`
            }
            if(master_poliklinik_id){
                isi +=`and jd.master_poliklinik_id ='${master_poliklinik_id}'`
            }
            if(master_dokter_id){
                isi+=`and jd.master_dokter_id='${master_dokter_id}'`
            }
            if(master_layanan_id){
                isi+=`and jd.master_layanan_id='${master_layanan_id}'`
            }

            let data =await sq.query(`select jd.id as jadwal_dokter_id,* from jadwal_dokter jd 
            join master_poliklinik mp on mp.id = jd.master_poliklinik_id 
            join master_dokter md on md.id = jd.master_dokter_id 
            join master_layanan ml on ml.id = jd.master_layanan_id 
            where jd."deletedAt" isnull ${isi} order by jd.waktu_mulai desc limit ${jumlah} offset ${offset}`,s)

            let data2 =await sq.query(`select jd.id as jadwal_dokter_id,* from jadwal_dokter jd 
            join master_poliklinik mp on mp.id = jd.master_poliklinik_id 
            join master_dokter md on md.id = jd.master_dokter_id 
            join master_layanan ml on ml.id = jd.master_layanan_id 
            where jd."deletedAt" isnull ${isi} order by jd.waktu_mulai desc limit ${jumlah} offset ${offset2}`,s)

            let  jml = await sq.query(`select count (*) as total from jadwal_dokter jd 
            join master_poliklinik mp on mp.id = jd.master_poliklinik_id 
            join master_dokter md on md.id = jd.master_dokter_id 
            join master_layanan ml on ml.id = jd.master_layanan_id 
            where jd."deletedAt" isnull ${isi}`)

            if(data2.length==0){
                sisa = false
            }

            res.status(200).json({status:200,message:"sukses",data,count:jml[0].total,sisa,jumlah,halaman});  
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }

    }

    static delete(req,res){
        const{id}=req.body
        jadwal_dokter.destroy({where:{
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

    static async syncJadwal(req,res){
        let curdate= moment().format('YYYY-MM-DD')
        // let curdate= moment().add(1,'d').format('YYYY-MM-DD')
        try {
            let kirim = await axios.get(purworejo+"/get-jadwal-per-tgl?tgl="+curdate,config)
            let datanya = kirim.data.data
            let  bulknya=[]
            // console.log(kirim.data.data);
            for (let i = 0; i < datanya.length; i++) {
                let awal = moment(datanya[i].dariJam, ["h:mm A"]).format("HH:mm:ss");
                let akhir = moment(datanya[i].sampaiJam, ["h:mm A"]).format("HH:mm:ss");
                if(datanya[i].isCuti==0){
                    // console.log(curdate+" "+awal);
                    bulknya.push({
                        id:uuid_v4(),
                        waktu_mulai:curdate+" "+awal,
                        waktu_selesai:curdate+" "+akhir,
                        kuota:datanya[i].kuota,
                        kuota_mobile:datanya[i].kuotaOnline,
                        dokter_id:datanya[i].idDokter,
                        poli_id:datanya[i].idPoli
                    })
                }
                
            }
            await jadwal_dokter.bulkCreate(bulknya)
            res.status(200).json({ status: 200, message: "sukses",data:bulknya})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
    }

    static async listDokterByTanggalPoli(req,res){
        const{poli_id,tanggal}=req.body
        try {
            // let tanggal= moment().format('YYYY-MM-DD')
            let data1 = await axios.get(purworejo+"/get-dokter",config)
            let dokternya = data1.data.data
            let data2 = await sq.query(`select * from jadwal_dokter jd where jd."deletedAt" isnull and date(jd.waktu_mulai)='${tanggal}'`,s)
            let jadwalnya = data2

            // console.log(jadwalnya.length);
            let hasilnya =[]

            for(let i=0;i<jadwalnya.length;i++){
                if(poli_id==jadwalnya[i].poli_id){
                    for(let j=0;j<dokternya.length;j++){
                        if(jadwalnya[i].dokter_id== dokternya[j].id){
                            let ada = false
                            for(let k=0;k<hasilnya.length;k++){
                                if(dokternya[j].id==hasilnya[k].id){
                                    ada ==true
                                }
                            }
                            if(ada==false){
                                hasilnya.push(dokternya[j])
                            }
                        }
                    }
                }
               
            }

            res.status(200).json({ status: 200, message: "sukses",data:hasilnya})

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
    }


    static async listJadwalByDokterTanggalPoli(req,res){
        const{dokter_id,poli_id,tanggal}=req.body
        try {

            let data =await sq.query(`select * from jadwal_dokter jd where jd."deletedAt" isnull and jd.dokter_id = '${dokter_id}' and poli_id = '${poli_id}' and date(waktu_mulai)='${tanggal}'`,s)
            let kirim = await axios.get(purworejo+"/get-poli",config)
            let polinya = kirim.data.data
            let kirim2 = await axios.get(purworejo+"/get-dokter",config)
            let dokternya = kirim2.data.data

            for(let i=0;i<data.length;i++){
                for(let j=0;j<polinya.length;j++){
                    if(data[i].poli_id==polinya[j].id){
                        data[i].nama_poli=polinya[j].nama
                    }
                }
            }

            for(let i=0;i<data.length;i++){
                for(let j=0;j<dokternya.length;j++){
                    if(data[i].dokter_id==dokternya[j].id){
                        data[i].nama_dokter=dokternya[j].nama
                    }
                }
            }
            res.status(200).json({ status: 200, message: "sukses",data:data})
            
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
    }



}

module.exports=Controller