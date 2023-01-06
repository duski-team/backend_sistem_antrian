// const purworejo = 'http://103.121.123.87/rsudapi/reg'
const purworejo = 'http://194.169.46.193/rsudapi/reg'

const token = 'agAW4AUAgjOtCMwIxcKnGjkDj6jj64vr'
const axios = require('axios')
const config = {
    headers: { Authorization: `Bearer ${token}`,'Content-Type': 'application/json' }
};

class Controller{

    static async getDokter(req,res){
        try {
            let kirim = await axios.get(purworejo+"/get-dokter",config)
            res.status(200).json({ status: 200, message: "sukses",data:kirim.data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
      
    }

    static async listPoli(req,res){
        try {
            let kirim = await axios.get(purworejo+"/get-poli",config)
            res.status(200).json({ status: 200, message: "sukses",data:kirim.data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
      
    }
    
    static async jadwalDokter(req,res){
        const{dokter_id}=req.params
        try {
            let kirim = await axios.get(purworejo+"/get-jadwal-dokter?idDokter="+dokter_id,config)
            res.status(200).json({ status: 200, message: "sukses",data:kirim.data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
      
    }

    static async rujukan(req,res){
        const{noRujukan,tipe}=req.body
        let tambahan=''
        if(tipe){
            tambahan +=`&tipe=${tipe}`
        }
        try {
            let kirim = await axios.get(purworejo+"/get-no-rujukan?noRujukan="+noRujukan+tambahan,config)
            res.status(200).json({ status: 200, message: "sukses",data:kirim.data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
      
    }

    static async detailsPasienBPJS(req,res){
        const{no_peserta,tanggal}=req.body
        let tambahan=''
        if(tanggal){
            tambahan +=`&tgl=${tanggal}`
        }
        try {
            let kirim = await axios.get(purworejo+"/get-pasien-bpjs?noPeserta="+no_peserta+tambahan,config)
            res.status(200).json({ status: 200, message: "sukses",data:kirim.data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
      
    }

    static async detailsDataKontrol(req,res){
        const{noSuratKontrol}=req.params
        try {
            
            let kirim = await axios.get(purworejo+"/get-data-kontrol?noSuratKontrol="+noSuratKontrol,config)
            res.status(200).json({ status: 200, message: "sukses",data:kirim.data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
      
    }

    static async listRujukan(req,res){
        const{noPeserta,type}=req.body
        let tambahan=''
        if(type){
            tambahan +=`&type=${type}`
        }
        try {
            let kirim = await axios.get(purworejo+"/get-list-rujukan?noPeserta="+noPeserta,config)
            res.status(200).json({ status: 200, message: "sukses",data:kirim.data})
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
      
    }

    static async getKontrol(req,res){
        const{noBpjs,idPoli}=req.body
        try {
            let kirim = await axios.post(purworejo+"/get-kontrol",{noBpjs,idPoli},config)
            
            res.status(200).json({ status: 200, message: "sukses",data:kirim.data})
        } catch (error) {
            if(error.response.status==404){
                res.status(200).json({ status: 200, message: "data tidak ada"})
            }
            else{
                res.status(500).json({ status: 500, message: "gagal", data: error.code})
            }
        }
    }
}


module.exports=Controller