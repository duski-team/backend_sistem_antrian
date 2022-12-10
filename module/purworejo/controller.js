const purworejo = 'http://103.121.123.87/rsudapi/reg'
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

}


module.exports=Controller