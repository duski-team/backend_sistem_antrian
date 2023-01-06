const antrian_list = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');

class Controller {

    static async registerLoket(req, res) {
        const { tanggal_antrian, poli_layanan, initial, status_antrian, poli_id, master_loket_id, jenis_antrian_id,booking_id } = req.body

        try {
            let cekBooking = []
            let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')
            let sequence = await sq.query(`select count(*)+1 as nomor from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan =2`, s);
            let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_layanan = 2 and al.status_antrian in (0,1)`, s);

            if(booking_id){
                cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tanggal_antrian) = '${tgl}'`, s)
            }

            if(cekBooking.length>0){
                cekBooking[0].sisa_antrian = sisa[0].total-1
                res.status(200).json({ status: 200, message: "sukses", data: cekBooking })
            }else{
                // let antrian_no = await sq.query(`select count(*)+1 as nomor from antrian_list al where date(al.tanggal_antrian) = '${tgl}'and al.initial = '${initial}'`, s)
                let antrian_no = await sq.query(`select al.antrian_no from antrian_list al where date(al.tanggal_antrian) = '${tgl}'and al.initial = '${initial}' order by al.antrian_no desc limit 1`, s)
                let no = antrian_no.length == 0 ? 1 : +antrian_no[0].antrian_no + 1
                let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master: 1, poli_layanan, initial, antrian_no: no, sequence: sequence[0].nomor, status_antrian, master_loket_id, poli_id, jenis_antrian_id,booking_id })
                hasil.dataValues.sisa_antrian = +sisa[0].total

                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async registerAntrian(req, res) {
        const { id_antrian_list, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id,booking_id } = req.body

        const t = await sq.transaction();

        try {
            let nomer_antrian = antrian_no
            let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')

            if (!antrian_no) {
                // let nomernya = await sq.query(`select count(*)+1 as nomor from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and initial = '${initial}'`, s)
                let nomernya = await sq.query(`select al.antrian_no from antrian_list al where date(al.tanggal_antrian) = '${tgl}'and al.initial = '${initial}' order by al.antrian_no desc limit 1`, s)
                nomer_antrian =  nomernya.length == 0 ? 1 : +nomernya[0].antrian_no + 1
            }

            let sequence = await sq.query(`select count(*)+1 as total from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_id =${poli_id}`, s);
            let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and al.poli_id = '${poli_id}' and status_antrian in (0,1)`,s)

            if (id_antrian_list) {
                await antrian_list.update({ status_antrian: 2 }, { where: { id: id_antrian_list },transaction:t })
            }
            
            let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].total, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id,booking_id },{transaction:t})
            hasil.dataValues.sisa_antrian = +sisa[0].total
            await t.commit();

            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async update(req, res) {
        const { id, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id,booking_id } = req.body

        try {
            let hasil = await antrian_list.update({ tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id,booking_id }, { where: { id }, returning: true })

            res.status(200).json({ status: 200, message: "sukses", data: hasil[1] })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body

        antrian_list.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const { tanggal_antrian, poli_layanan, initial, is_cancel, is_process, status_antrian, jadwal_dokter_id, booking_id, poli_id, master_loket_id, jenis_antrian_id } = req.body;

        try {
            let isi = ''

            if (tanggal_antrian) {
                isi += ` and date(al.tanggal_antrian)='${tanggal_antrian}' `
            }
            if (poli_layanan) {
                isi += ` and al.poli_layanan = '${poli_layanan}' `
            }
            if (initial) {
                isi += ` and al.initial = '${initial}' `
            }
            if (is_cancel) {
                isi += ` and al.is_cancel = ${is_cancel} `
            }
            if (is_process) {
                isi += ` and al.is_process = '${is_process}' `
            }
            if (status_antrian) {
                isi += ` and al.status_antrian = ${status_antrian} `
            }
            if (jadwal_dokter_id) {
                isi += ` and al.jadwal_dokter_id = '${jadwal_dokter_id}' `
            }
            if (booking_id) {
                isi += ` and al.booking_id = '${booking_id}' `
            }
            if (poli_id) {
                isi += ` and al.poli_id = '${poli_id}' `
            }
            if (master_loket_id) {
                isi += ` and al.master_loket_id = '${master_loket_id}' `
            }
            if (jenis_antrian_id) {
                isi += ` and al.jenis_antrian_id = '${jenis_antrian_id}' `
            }

            let data = await sq.query(`select al.id as "antrian_list_id", al.*, jd.waktu_mulai ,jd.waktu_selesai ,jd.kode_jadwal ,jd.kuota ,jd.kuota_mobile ,jd.dokter_id ,ml.nama_loket ,
            b.tanggal_booking ,b.nama_booking ,b.no_rujukan ,b.no_rm , ja.nama_jenis_antrian ,ja.kode_jenis_antrian  from antrian_list al left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id left join master_loket ml on ml.id = al.master_loket_id left join booking b on b.id = al.booking_id left join jenis_antrian ja on ja.id = al.jenis_antrian_id where al."deletedAt" isnull ${isi} order by al."sequence"`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listHalaman(req, res) {
        const { halaman, jumlah, tanggal_antrian, poli_layanan, initial, is_cancel, is_process, status_antrian, jadwal_dokter_id, booking_id, poli_id, master_loket_id, jenis_antrian_id } = req.body;

        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;

            if (tanggal_antrian) {
                isi += `and date(al.tanggal_antrian)='${tanggal_antrian}' `
            }
            if (poli_layanan) {
                isi += `and al.poli_layanan = '${poli_layanan}' `
            }
            if (initial) {
                isi += `and al.initial = '${initial}' `
            }
            if (is_cancel) {
                isi += `and al.is_cancel = ${is_cancel} `
            }
            if (is_process) {
                isi += `and al.is_process = '${is_process}' `
            }
            if (status_antrian) {
                isi += `and al.status_antrian = ${status_antrian} `
            }
            if (jadwal_dokter_id) {
                isi += `and al.jadwal_dokter_id = '${jadwal_dokter_id}' `
            }
            if (booking_id) {
                isi += `and al.booking_id = '${booking_id}' `
            }
            if (poli_id) {
                isi += `and al.poli_id = '${poli_id}' `
            }
            if (master_loket_id) {
                isi += `and al.master_loket_id = '${master_loket_id}' `
            }
            if (jenis_antrian_id) {
                isi += `and al.jenis_antrian_id = '${jenis_antrian_id}' `
            }

            let data = await sq.query(`select al.id as antrian_list_id,* from antrian_list al left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id left join master_loket ml on ml.id = al.master_loket_id left join booking b on b.id = al.booking_id left join jenis_antrian ja on ja.id = al.jenis_antrian_id where al."deletedAt" isnull ${isi} order by al."sequence" limit ${jumlah} offset ${offset}`, s)
            let jml = await sq.query(`select count(*) as total from antrian_list al left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id left join master_loket ml on ml.id = al.master_loket_id left join booking b on b.id = al.booking_id left join jenis_antrian ja on ja.id = al.jenis_antrian_id where al."deletedAt" isnull ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
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
module.exports = Controller