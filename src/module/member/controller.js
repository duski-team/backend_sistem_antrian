const member = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const axios = require('axios');

const purworejo = process.env.HOST_PURWOREJO
const config = require("../../helper/config").config

class Controller {
    static register(req, res) {
        const { no_rm_pasien,no_ktp, nama, no_bpjs, tempat_lahir, tanggal_lahir, alamat, alamat_domisili, no_hp, jenis_kelamin, status_kawin, pekerjaan, pendidikan, agama, suku_bangsa, id_provinsi, id_kota, id_kecamatan, id_kelurahan, nama_penanggung_jawab, hubungan_dengan_pasien, alamat_penanggung_jawab, no_hp_penanggung_jawab, keterangan } = req.body

        member.findAll({ where: { no_ktp } }).then(async hasilnya => {
            if (hasilnya.length) {
                res.status(200).json({ status: 200, message: "gagal, pasien tersebut sudah terdaftar" })
            } else {
                let foto_ktp = ""

                if (req.files) {
                    if (req.files.file1) {
                        foto_ktp = req.files.file1[0].filename
                    }
                }
                await member.create({ id: uuid_v4(), no_rm_pasien,no_ktp, nama, no_bpjs, tempat_lahir, tanggal_lahir, alamat, alamat_domisili, no_hp, jenis_kelamin, status_kawin, pekerjaan, pendidikan, agama, suku_bangsa, id_provinsi, id_kota, id_kecamatan, id_kelurahan, nama_penanggung_jawab, hubungan_dengan_pasien, alamat_penanggung_jawab, no_hp_penanggung_jawab, keterangan, user_id: req.dataUsers.id,status_persetujuan:!no_rm_pasien?1:2,foto_ktp }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses", data })
                })
            }
        }).catch(error => {
            console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async acceptedPersetujuan(req, res) {
        const { id, no_ktp, nama, no_bpjs, tempat_lahir, tanggal_lahir, alamat, alamat_domisili, no_hp, jenis_kelamin, status_kawin, pekerjaan, pendidikan, agama, suku_bangsa, id_provinsi, id_kota, id_kecamatan, id_kelurahan, nama_penanggung_jawab, hubungan_dengan_pasien, alamat_penanggung_jawab, no_hp_penanggung_jawab, keterangan, status_persetujuan } = req.body
        try {
            if (status_persetujuan == 2) {
                let kirim = await axios.post(purworejo + "/create-pasien-baru", { noKtp: no_ktp, nama: nama, noBpjs: no_bpjs, tempatLahir: tempat_lahir, tglLahir: tanggal_lahir, alamat: alamat, alamatDomisili: alamat_domisili, noHp: no_hp, jenisKelamin: jenis_kelamin, statusKawin: status_kawin, pekerjaan: pekerjaan, pendidikan: pendidikan, agama: agama, sukuBangsa: suku_bangsa, idProv: id_provinsi, idKota: id_kota, idKec: id_kecamatan, idKel: id_kelurahan, namaPenanggungjawab: nama_penanggung_jawab, hubunganDenganPasien: hubungan_dengan_pasien, alamatPenanggungjawab: alamat_penanggung_jawab, noHpPenanggungjawab: no_hp_penanggung_jawab, keterangan: keterangan }, config)

                let no_rm_pasien = kirim.data.data.noRM

                let data_member = await member.update({ status_persetujuan, no_rm_pasien }, { where: { id }, returning: true })

                res.status(200).json({ status: 200, message: "sukses", data: data_member[1][0] })
            } else {
                let data_member = await member.update({ status_persetujuan }, { where: { id }, returning: true })
                res.status(200).json({ status: 200, message: "sukses", data: data_member[1][0] })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMemberBaru(req, res) {
        try {
            let data = await sq.query(`select m.id as "member_id", * from "member" m where m."deletedAt" isnull and m.status_persetujuan = 1 order by m."createdAt" desc`,s)
            res.status(200).json({ status: 200, message: "sukses", data: data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async cekPasien(req, res) {
        const { no } = req.params
        try {
            let kirim = await axios.get(purworejo + "/get-pasien?no=" + no, config)
            res.status(200).json({ status: 200, message: "sukses", data: kirim.data })
        } catch (error) {
            // console.log(error.response);
            if (error.response.status == 404) {
                res.status(200).json({ status: 200, message: "data pasien tidak ada" })
            } else {
                res.status(500).json({ status: 500, message: "gagal", data: error.code })
            }
        }
    }

    static async update(req, res) {
        const { id, no_rm_pasien,no_ktp, nama, no_bpjs, tempat_lahir, tanggal_lahir, alamat, alamat_domisili, no_hp, jenis_kelamin, status_kawin, pekerjaan, pendidikan, agama, suku_bangsa, id_provinsi, id_kota, id_kecamatan, id_kelurahan, nama_penanggung_jawab, hubungan_dengan_pasien, alamat_penanggung_jawab, no_hp_penanggung_jawab, keterangan,user_id } = req.body

        const t = await sq.transaction();
        try {

            if (req.files) {
                if (req.files.file1) {
                    let foto_ktp = req.files.file1[0].filename
                    await member.update({foto_ktp},{where:{id},transaction:t})
                }
            }

            await member.update({ no_rm_pasien,no_ktp, nama, no_bpjs, tempat_lahir, tanggal_lahir, alamat, alamat_domisili, no_hp, jenis_kelamin, status_kawin, pekerjaan, pendidikan, agama, suku_bangsa, id_provinsi, id_kota, id_kecamatan, id_kelurahan, nama_penanggung_jawab, hubungan_dengan_pasien, alamat_penanggung_jawab, no_hp_penanggung_jawab, keterangan,user_id }, { where: { id },transaction:t })
            
            await t.commit();
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static deleteMember(req, res) {
        const { no_rm_pasien } = req.body

        member.destroy({ where: { no_rm_pasien, user_id: req.dataUsers.id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static delete (req, res) {
        const { id } = req.body

        member.destroy({where:{id}}).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async listMemberByUserId(req, res) {
        const { user_id } = req.params

        try {
            let data = []
            let membernya = await sq.query(`select no_rm_pasien from member m where m.user_id = '${user_id}' and m."deletedAt" isnull and m."status_persetujuan" = 2`, s)

            for (let i = 0; i < membernya.length; i++) {
                let kirim = await axios.get(purworejo + "/get-pasien?no=" + membernya[i].no_rm_pasien, config)
                data.push(kirim.data.data[0])
            }

            res.status(200).json({ status: 200, message: "sukses", data: data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMemberBelumDiverifikasiByUserId(req, res) {
        const { user_id } = req.params

        try {
            let data = await sq.query(`select * from member m where m.user_id = '${user_id}' and m."deletedAt" isnull and m."status_persetujuan" = 1`, s)

            res.status(200).json({ status: 200, message: "sukses", data: data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMemberDitolakByUserId(req, res) {
        const { user_id } = req.params

        try {
            let data = await sq.query(`select * from member m where m.user_id = '${user_id}' and m."deletedAt" isnull and m."status_persetujuan" = 0`, s)

            res.status(200).json({ status: 200, message: "sukses", data: data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params
        try {
            let data = await sq.query(`select m.id as "member_id", * from "member" m where m."deletedAt" isnull and m.id = '${id}'`, s)

            res.status(200).json({ status: 200, message: "sukses", data: data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listAllMember(req, res) {
        const {no_rm_pasien,nama,no_ktp,no_bpjs,username} = req.body;
        try {
            let isi = '';
            if(no_rm_pasien){
                isi+=` and m.no_rm_pasien ilike '%${no_rm_pasien}%'`
            }
            if(nama){
                isi+=` and m.nama ilike '%${nama}%'`
            }
            if(no_ktp){
                isi+=` and m.no_ktp ilike '%${no_ktp}%'`
            }
            if(no_bpjs){
                isi+=` and m.no_bpjs ilike '%${no_bpjs}%'`
            }
            if(username){
                isi+=` and u.username ilike '%${username}%'`
            }

            let data = await sq.query(`select m.id as member_id,* from "member" m  join users u on u.id = m.user_id where m."deletedAt" isnull${isi} order by m."createdAt" desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data: data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller