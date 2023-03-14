const purworejo = process.env.HOST_PURWOREJO
const config = require("./config").config
const axios = require('axios');
const moment = require('moment');
const { sq } = require("../config/connection");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }

function kuota(data) {
    return new Promise(async (resolve, reject) => {
        const {poli_id} = data
        try {
            // console.log(data);
            let kirim = await axios.get(purworejo + "/get-poli", config)
            let dataPoli = kirim.data.data
            let tanggal = moment().format("YYYY-MM-DD")
            let jadwal = await sq.query(`select * from jadwal_dokter jd where date(jd.waktu_mulai) = '${tanggal}'`, s)
            let antrian = await sq.query(`select al.poli_id, (count(*) filter (where al.poli_layanan = 1 ) + count(*) filter (where al.poli_layanan = 2 and al.status_antrian<2) ) as total from antrian_list al where al."deletedAt" isnull and date(al.tanggal_antrian) = '${tanggal}' and al.booking_id isnull group by al.poli_id`, s)
            let booking = await sq.query(`select jd.poli_id ,jd.kuota ,jd.kuota_mobile ,count(*) as "jumlah_booking" from booking b join jadwal_dokter jd on jd.id = b.jadwal_dokter_id where b."deletedAt" isnull and jd."deletedAt" isnull and b.status_booking in (1,2,9) and date(jd.waktu_mulai) = '${tanggal}' group by jd.poli_id ,jd.kuota ,jd.kuota_mobile`,s)
            let hasil = []
    
            for (let i = 0; i < dataPoli.length; i++) {
                dataPoli[i].sisaKuota = 0
                dataPoli[i].kuota_terbooking = 0
                for (let j = 0; j < jadwal.length; j++) {
                    if(dataPoli[i].id == jadwal[j].poli_id){
                        dataPoli[i].kuota = `${jadwal[j].kuota}`
                        dataPoli[i].kuotaOnline = `${jadwal[j].kuota_mobile}`
                        dataPoli[i].sisaKuota = dataPoli[i].kuota == '999'?+dataPoli[i].kuota: +jadwal[j].kuota + +jadwal[j].kuota_mobile
                    }
                }
                for (let j = 0; j < booking.length; j++) {
                    if(dataPoli[i].id == booking[j].poli_id){
                        dataPoli[i].sisaKuota -= +booking[j].jumlah_booking
                        dataPoli[i].kuota_terbooking += +booking[j].jumlah_booking
                    }
                }
                for (let j = 0; j < antrian.length; j++) {
                    if(dataPoli[i].id == antrian[j].poli_id){
                        dataPoli[i].sisaKuota -= +antrian[j].total
                        dataPoli[i].kuota_terbooking += +antrian[j].total
                    }
                }
                if(dataPoli[i].id == poli_id){
                    hasil.push(dataPoli[i])
                }
            }
            resolve(hasil)
        } catch (error) {
            console.log(error)
            reject(error)
        }
    });
}

module.exports = kuota