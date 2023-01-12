const moment = require('moment');
const axios = require('axios')
const purworejo = process.env.HOST_PURWOREJO
const config = require("../../helper/config").config

class Controller {

    static async getDokter(req, res) {
        try {
            let kirim = await axios.get(purworejo + "/get-dokter", config)
            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async listPoli(req, res) {
        try {
            let kirim = await axios.get(purworejo + "/get-poli", config)
            let x = [
                {
                    id: '888',
                    nama: 'Farmasi',
                    kdPoliBpjs: '',
                    kuota: '999',
                    kuotaOnline: '0',
                    kdAntrean: 'FM'
                },
                {
                    id: '777',
                    nama: 'Kasir',
                    kdPoliBpjs: '',
                    kuota: '999',
                    kuotaOnline: '0',
                    kdAntrean: 'KS'
                }
            ]
            kirim.data.data.push(...x)
            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async jadwalDokter(req, res) {
        const { dokter_id } = req.params
        try {
            let kirim = await axios.get(purworejo + "/get-jadwal-dokter?idDokter=" + dokter_id, config)
            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async rujukan(req, res) {
        const { noRujukan, tipe } = req.body
        let tambahan = ''
        if (tipe) {
            tambahan += `&tipe=${tipe}`
        }
        try {
            let kirim = await axios.get(purworejo + "/get-no-rujukan?noRujukan=" + noRujukan + tambahan, config)
            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async detailsPasienBPJS(req, res) {
        const { no_peserta, tanggal } = req.body
        let tambahan = ''
        if (tanggal) {
            tambahan += `&tgl=${tanggal}`
        }
        try {
            let kirim = await axios.get(purworejo + "/get-pasien-bpjs?noPeserta=" + no_peserta + tambahan, config)
            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async detailsDataKontrol(req, res) {
        const { noSuratKontrol } = req.params
        try {

            let kirim = await axios.get(purworejo + "/get-data-kontrol?noSuratKontrol=" + noSuratKontrol, config)
            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async listRujukan(req, res) {
        const { noPeserta, type } = req.body
        let tambahan = ''
        if (type) {
            tambahan += `&tipe=${type}`
        }
        try {
            let kirim = await axios.get(purworejo + "/get-list-rujukan?noPeserta=" + noPeserta, config)
            let data = kirim.data.data.rujukan;
            let asalFaskes = kirim.data.data.asalFaskes
            let hasil = []
            let tgl = moment().format('YYYY-MM-DD')
            for (let i = 0; i < data.length; i++) {
                let tglExp = moment(data[i].tglKunjungan).add(90, 'days').format('YYYY-MM-DD')
                if (tglExp > tgl) {
                    hasil.push(data[i])
                }
            }
            res.status(200).json({ status: 200, message: "sukses", data: { asalFaskes, rujukan: hasil } })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async getKontrol(req, res) {
        const { noBpjs, idPoli } = req.body
        try {
            let kirim = await axios.post(purworejo + "/get-kontrol", { noBpjs, idPoli }, config)

            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            if (error.response.status == 404) {
                res.status(200).json({ status: 200, message: "data tidak ada" })
            }
            else {
                res.status(500).json({ status: 500, message: "gagal", data: error.code })
            }
        }
    }

    static async getListRujukInternal(req, res) {
        const { noRm } = req.body
        try {
            let kirim = await axios.post(purworejo + "/get-list-rujuk-internal", { noRm }, config)
            console.log(kirim.data);
            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            console.log(error);
            console.log(req.body);
            if (error.response.status == 404) {
                res.status(200).json({ status: 200, message: "data tidak ada" })
            }
            else {
                res.status(500).json({ status: 500, message: "gagal", data: error.code })
            }
        }
    }
}


module.exports = Controller