const moment = require('moment');
const axios = require('axios')
const purworejo = process.env.HOST_PURWOREJO
const config = require("../../helper/config").config
const antrian_list = require('../antrian_list/model');
const { sq } = require("../../config/connection");

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
        const { noRm } = req.params
        try {
            let kirim = await axios.get(purworejo + `/get-list-rujuk-internal?noRm=${noRm}`, config)
            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            console.log(error.response);
            console.log(req.body);
            if (error.response.status == 404) {
                res.status(200).json({ status: error.response.data.code, message: error.response.data.message })
            }
            else {
                res.status(500).json({ status: 500, message: "gagal", data: error.code })
            }
        }
    }

    static async listHeadline(req, res) {
        let getListHeadline = true
        try {
            let kirim = await axios.post("https://rsutjokronegoro.purworejokab.go.id/headline/action.php", { getListHeadline }, {
                headers: { Authorization: `Bearer ${process.env.TOKEN}`, 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            // console.log(kirim.data);

            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            // console.log(error.response);
            // console.log(req.body);
            if (error.response.status == 404) {
                res.status(200).json({ status: error.response.data.code, message: error.response.data.message })
            }
            else {
                res.status(500).json({ status: 500, message: "gagal", data: error.code })
            }
        }
    }

    static async createPasienBaru(req, res) {
        const { noKtp, nama, noBpjs, tempatLahir, tglLahir, alamat, alamatDomisili, noHp, jenisKelamin, statusKawin, pekerjaan, pendidikan, agama, sukuBangsa, idProv, idKota, idKec, idKel, namaPenanggungjawab, hubunganDenganPasien, alamatPenanggungjawab, noHpPenanggungjawab, keterangan } = req.body
        try {
            let kirim = await axios.post(purworejo + "/create-pasien-baru", { noKtp, nama, noBpjs, tempatLahir, tglLahir, alamat, alamatDomisili, noHp, jenisKelamin, statusKawin, pekerjaan, pendidikan, agama, sukuBangsa, idProv, idKota, idKec, idKel, namaPenanggungjawab, hubunganDenganPasien, alamatPenanggungjawab, noHpPenanggungjawab, keterangan }, config)

            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            console.log(error);
            console.log(req.body);
            if (error.response.status == 404) {
                res.status(200).json({ status: error.response.data.code, message: error.response.data.message })
            }
            else {
                res.status(500).json({ status: 500, message: "gagal", data: error.code })
            }
        }
    }

    static async getListPekerjaan(req, res) {
        try {
            let kirim = await axios.get(purworejo + `/get-list-pekerjaan`, config)

            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            console.log(error.response);
            if (error.response.status == 404) {
                res.status(200).json({ status: error.response.data.code, message: error.response.data.message })
            }
            else {
                res.status(500).json({ status: 500, message: "gagal", data: error.code })
            }
        }
    }

    static async getListProvinsi(req, res) {
        try {
            let kirim = await axios.get(purworejo + `/get-list-prov`, config)

            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            console.log(error.response);
            if (error.response.status == 404) {
                res.status(200).json({ status: error.response.data.code, message: error.response.data.message })
            }
            else {
                res.status(500).json({ status: 500, message: "gagal", data: error.code })
            }
        }
    }

    static async getListKota(req, res) {
        const { idProv } = req.body
        try {
            let kirim = await axios.get(purworejo + `/get-list-kota?idProv=${idProv}`, config)

            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            console.log(error.response);
            console.log(req.body);
            if (error.response.status == 404) {
                res.status(200).json({ status: error.response.data.code, message: error.response.data.message })
            }
            else {
                res.status(500).json({ status: 500, message: "gagal", data: error.code })
            }
        }
    }

    static async getListKecamatan(req, res) {
        const { idKota } = req.body
        try {
            let kirim = await axios.get(purworejo + `/get-list-kec?idKota=${idKota}`, config)

            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            console.log(error.response);
            console.log(req.body);
            if (error.response.status == 404) {
                res.status(200).json({ status: error.response.data.code, message: error.response.data.message })
            }
            else {
                res.status(500).json({ status: 500, message: "gagal", data: error.code })
            }
        }
    }

    static async getListKelurahan(req, res) {
        const { idKec } = req.body
        try {
            let kirim = await axios.get(purworejo + `/get-list-kel?idKec=${idKec}`, config)

            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            console.log(error.response);
            console.log(req.body);
            if (error.response.status == 404) {
                res.status(200).json({ status: error.response.data.code, message: error.response.data.message })
            }
            else {
                res.status(500).json({ status: 500, message: "gagal", data: error.code })
            }
        }
    }

    static async getFinger(req, res) {
        const { noPeserta } = req.body
        try {
            let kirim = await axios.get(purworejo + "/get-finger?noPeserta=" + noPeserta, config)

            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            console.log(error.response);
            console.log(req.body);
            if (error.response.status == 404) {
                res.status(200).json({ status: error.response.data.code, message: error.response.data.message })
            }
            else {
                res.status(500).json({ status: 500, message: "gagal", data: error.code })
            }
        }
    }

    static async registerAntreanBPJSLoket(req, res) {
        const { nomor_kartu, poli_id, pasien_baru, no_rm, kode_dokter, nama_dokter, jam_praktek, jenis_kunjungan, nomor_referensi, nomor_antrean, angka_antrean, estimasi_dilayani, keterangan, id_antrian_list } = req.body

        const t = await sq.transaction();

        try {
            let tanggal = moment().format("YYYYMMDD")
            let kode_booking = tanggal + nomor_antrean.replace("-", "")
            let kirim = await axios.get(purworejo + "/get-poli", config)
            let poli = kirim.data.data
            let kode_poli = ''
            let nama_poli = ''
            for (let i = 0; i < poli.length; i++) {
                if (poli_id == poli[i].id) {
                    kode_poli = poli[i].kdPoliBpjs
                    nama_poli = poli[i].nama
                }
            }

            let kirim4 = await axios.get(purworejo + "/get-pasien?no=" + no_rm, config)

            let nik = kirim4.data.data[0].nik
            let no_hp = kirim4.data.data[0].noTelp

            let tgl_periksa = moment().format("YYYY-MM-DD")

            let objCreate = { kodebooking: kode_booking, jenispasien: "JKN", nomorkartu: nomor_kartu, nik: nik, nohp: no_hp, kodepoli: kode_poli, namapoli: nama_poli, pasienbaru: pasien_baru, norm: no_rm, tanggalperiksa: tgl_periksa, kodedokter: kode_dokter, namadokter: nama_dokter, jampraktek: jam_praktek, jeniskunjungan: jenis_kunjungan, nomorreferensi: nomor_referensi, nomorantrean: nomor_antrean, angkaantrean: angka_antrean, estimasidilayani: estimasi_dilayani, sisakuotajkn: 0, kuotajkn: 0, sisakuotanonjkn: 0, kuotanonjkn: 0, keterangan: keterangan }

            let kirim2 = await axios.post(purworejo + "/create-antrean", objCreate, config)
            let antrian = await antrian_list.update({ no_rm, kode_booking }, { where: { id: id_antrian_list }, transaction: t })
            let objUpdate = { kodebooking: kode_booking, waktu: estimasi_dilayani, taskid: 3 }
            let kirim3 = await axios.post(purworejo + "/update-antrean", objUpdate, config)
            
            // console.log(objCreate);
            // console.log(objUpdate);
            console.log(kirim2.data, "CREATE-ANTREAN");
            console.log(kirim3.data, "UPDATE-ANTREAN");

            res.status(200).json({ status: 200, message: "sukses", data: kirim2.data })
        } catch (error) {
            await t.rollback();
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async updateAntrean(req, res) {
        const { kodebooking, waktu } = req.body

        try {
            let kirim3 = await axios.post(purworejo + "/update-antrean", { kodebooking, waktu, taskid: 3 })

            res.status(200).json({ status: 200, message: "sukses", data: kirim3.data })
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
            // if (error.name = "AxiosError") {
            //     let respon_error = error.response.data
            //     console.log(respon_error);
            //     socket.emit("error", respon_error);
            // }
            // else {
            //     console.log(error);
            //     socket.emit("error", error);
            // }
        }
    }
}


module.exports = Controller