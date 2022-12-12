const purworejo = 'http://103.121.123.87/rsudapi/reg'
const token = 'agAW4AUAgjOtCMwIxcKnGjkDj6jj64vr'
const axios = require('axios')
const config = {
    headers: { Authorization: `Bearer ${token}`,'Content-Type': 'application/json' }
};




class Controller{

    static async register(req,res){
        const{noRm,idPoli,idDokter,noTelp,idCaraMasuk,ketCaraMasuk,penanggungjawabNama,penanggungjawabHubungan,idJaminan,noBpjs,kelompokBpjs,kelasBpjs,diagAwal,noRujukan,asalRujukan,tglRujukan,idFaskes,namaFaskes,tujuanKunjungan,flagProcedure,kdPenunjang,assesmentPelayanan}=req.body
        console.log(req.body);

        try {
            let kirim = await axios.post(purworejo+"/reg-rajal",{noRm,idPoli,idDokter,noTelp,idCaraMasuk,ketCaraMasuk,penanggungjawabNama,penanggungjawabHubungan,idJaminan,noBpjs,kelompokBpjs,kelasBpjs,diagAwal,noRujukan,asalRujukan,tglRujukan,idFaskes,namaFaskes,tujuanKunjungan,flagProcedure,kdPenunjang,assesmentPelayanan},config)
            res.status(200).json({ status: 200, message: "sukses"})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error}) 
        }
    }

}


module.exports=Controller