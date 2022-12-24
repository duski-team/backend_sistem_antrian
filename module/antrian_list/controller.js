const antrian_list = require('./model');
const {sq} = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = {type:QueryTypes.SELECT}

class Controller{

    static async registerLoket(req,res){
        const{tanggal_antrian,is_master,poli_layanan,initial,status_antrian,poli_id,master_loket_id,jenis_antrian_id}=req.body

        try {
            const antrian_no = await sq.query(`select count(*)+1 as nomor from antrian_list al where date(al.tanggal_antrian) = '${tanggal_antrian}' and initial = '${initial}'`,s)

            let hasil = await antrian_list.create({id:uuid_v4(),tanggal_antrian,is_master,poli_layanan,initial,antrian_no:antrian_no[0].nomor,sequence:antrian_no[0].nomor,status_antrian,master_loket_id,poli_id,jenis_antrian_id})

            res.status(200).json({ status: 200, message: "sukses",data:hasil})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
    }

    static async registerMandiri(req,res){
        const{tanggal_antrian,is_master,poli_layanan,initial,antrian_no,is_cancel,is_process,status_antrian,antrian_list_id,jadwal_dokter_id,poli_id,master_loket_id,jenis_antrian_id}= req.body

        try {
            let nomer_antrian=''

            if(antrian_no){
                nomer_antrian=antrian_no
            }
            else{
                let nomernya = await sq.query(`select count(*) from antrian_list al where date(al.tanggal_antrian) = '${tanggal_antrian}'and poli_id =${poli_id} and initial = '${initial}' and is_master=1`,s)
                nomer_antrian=+nomernya[0].count+1
            }

            const sequence = await sq.query(`select count(*) from antrian_list al where date(tanggal_antrian) = '${tanggal_antrian}' and poli_id =${poli_id} `,s);

            // console.log(nomer_antrian,sequence[0].count);

            await antrian_list.create({id:uuid_v4(),tanggal_antrian,is_master,poli_layanan,initial,antrian_no:nomer_antrian,sequence:+sequence[0].count+1,is_cancel,is_process,status_antrian,antrian_list_id,jadwal_dokter_id,poli_id,master_loket_id,jenis_antrian_id})

            res.status(200).json({ status: 200, message: "sukses",data:hasil})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
    }
    
    static async update(req,res){
        const{id,tanggal_antrian,is_master,poli_layanan,initial,antrian_no,is_cancel,is_process,status_antrian,antrian_list_id,jadwal_dokter_id,poli_id,master_loket_id,jenis_antrian_id}= req.body

        try {
            await antrian_list.update({tanggal_antrian,is_master,poli_layanan,initial,antrian_no:nomer_antrian,sequence:+sequence[0].count+1,is_cancel,is_process,status_antrian,antrian_list_id,jadwal_dokter_id,poli_id,master_loket_id,jenis_antrian_id},{where:{id}})

            res.status(200).json({ status: 200, message: "sukses",data:hasil})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
    }

    static delete(req,res){
        const {id} = req.body

        antrian_list.destroy({where:{id}}).then(data=>{
            res.status(200).json({ status: 200, message: "sukses"})
        }).catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static async list(req,res){

        try {
            let isi = ''
            if(tanggal_antrian){
                isi+=`and date(al.tanggal_antrian)='${tanggal_antrian}' `
            }
            if(poli_layanan){
                isi+=`and al.poli_layanan = '${poli_layanan}' `
            }
            if(initial){
                isi+=`and al.initial = '${initial}' `
            }
            if(is_cancel){
                isi+=`and al.is_cancel = ${is_cancel} `
            }
            if(is_cancel){
                isi+=`and al.is_cancel = ${is_cancel} `
            }
            let data =  await sq.query(`select al.id as antrian_list_id,* from antrian_list al left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id left join master_loket ml on ml.id = al.master_loket_id left join booking b on b.id = al.booking_id where al."deletedAt" isnull ${isi}`)
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
    }

    // static async registerPoli(req,res){
    //     const{tanggal_antrian,is_master,poli_layanan,initial,antrian_no,is_cancel,is_process,status_antrian,antrian_list_id,jadwal_dokter_id,poli_id,master_loket_id}=req.body

    //     let nomer_antrian=''

    //     if(antrian_no){
    //         nomer_antrian=antrian_no
    //     }
    //     else{
    //         let nomernya = await sq.query(`select count(*) from antrian_list al where date(al.tanggal_antrian) = '${tanggal_antrian}'and poli_id =${poli_id} and initial = '${initial}' and is_master=1`,s)
    //         nomer_antrian=+nomernya[0].count+1
    //     }

    //     const sequence = await sq.query(`select count(*) from antrian_list al where date(tanggal_antrian) = '${tanggal_antrian}' and poli_id =${poli_id} `,s)
    //     // res.json('oke')

    //     console.log(nomer_antrian,sequence[0].count);

    //     antrian_list.create({id:uuid_v4(),tanggal_antrian,is_master,poli_layanan,initial,antrian_no:nomer_antrian,sequence:+sequence[0].count+1,is_cancel,is_process,status_antrian,antrian_list_id,jadwal_dokter_id,poli_id,master_loket_id})
    //     .then(hasil=>{
    //         res.status(200).json({ status: 200, message: "sukses",data:hasil})
    //     })
    //     .catch(error=>{
    //         console.log(error);
    //         res.status(500).json({ status: 500, message: "gagal", data: error})
    //     })
    // }
}
module.exports=Controller