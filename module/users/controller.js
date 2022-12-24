require('dotenv').config({})
const users = require('./model')
const { sq } = require("../../config/connection");
const bcrypt = require("../../helper/bcrypt.js");
const jwt = require("../../helper/jwt");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');;
const s = { type: QueryTypes.SELECT }
const moment = require('moment');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY, url: "https://api.eu.mailgun.net/" });
// const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});
const mg_domain = process.env.MAILGUN_DOMAIN
const mg_email = process.env.MAILGUN_EMAIL

class Controller {

    static register(req, res) {
        const { username, password, role } = req.body;
        let encryptedPassword = bcrypt.hashPassword(password);
        users.findAll({ where: { username } }).then((data) => {
            if (data.length) {
                res.status(200).json({ status: 200, message: "username sudah terdaftar" });
            } else {
                let y = uuid_v4()
                let kode = y.substring(y.length - 4, y.length).toUpperCase()
                users.create({ id: uuid_v4(), username, password: encryptedPassword, role, kode_otp: kode, otp_time: moment().add(60, 'm').toDate() }, { returning: true }).then(async (respon) => {
                    let fieldheader = `RSUD RAA TJOKRONEGORO PURWOREJO <br> Gunakan kode dibawah ini untuk verifikasi : <br> OTP : <b>${kode}</b>`
                    await mg.messages.create(mg_domain, {
                        from: mg_email,
                        to: [username],
                        subject: "OTP RSUD RAA TJOKRONEGORO PURWOREJO",
                        text: " ",
                        html: fieldheader
                    })
                    res.status(200).json({ status: 200, message: "sukses", data: respon });
                }).catch((err) => {
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static login(req, res) {
        const { username, password } = req.body;
        users.findAll({ where: { username } }).then((data) => {
            if (data.length) {
                if (data[0].dataValues.user_status == 0) {
                    res.status(200).json({ status: 200, message: "username belum terverifikasi" });
                } else {
                    let dataToken = {
                        id: data[0].id,
                        password: data[0].password,
                    };
                    let hasil = bcrypt.compare(password, data[0].dataValues.password);
                    if (hasil) {
                        res.status(200).json({
                            status: 200,
                            message: "sukses",
                            token: jwt.generateToken(dataToken),
                            id: data[0].id,
                        });
                    } else {
                        res.status(200).json({ status: 200, message: "Password Salah" });
                    }
                }
            } else {
                res.status(200).json({ status: 200, message: "username Tidak Terdaftar" });
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, role } = req.body
        users.update({ role }, {
            where: {
                id
            }
        }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        })
            .catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
    }

    static verifikasiOTP(req, res) {
        const { username, kode_otp } = req.body
        users.findAll({ where: { username, kode_otp } }).then((data) => {
            if (data.length) {
                users.update({ user_status: 1 }, { where: { username } }).then((data2) => {
                    res.status(200).json({ status: 200, message: "sukses" })
                })
            } else {
                res.status(200).json({ status: 200, message: "username Tidak Terdaftar" });
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select * from users u where u."deletedAt" isnull`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params
        try {
            let data = await sq.query(`select * from users u where u."deletedAt" isnull and u.id='${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body
        users.destroy({ where: { id } })
            .then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({ status: 500, message: "gagal", data: error })
            })
    }

    static kirimOTP(req, res) {
        const { username } = req.body
        let x = moment()
        users.findAll({ where: { username } }).then(hasil => {
            // console.log(hasil[0].dataValues.id);
            if (!hasil.length) {
                res.status(200).json({ status: 201, message: "email tidak terdaftar" })
            } else {
                let y = uuid_v4()
                let kode = y.substring(y.length - 4, y.length).toUpperCase()
                users.update({ kode_otp: kode, otp_time: moment().add(60, 'm').toDate() }, { where: { username } }).then(async data6 => {

                    let fieldheader = `RSUD RAA TJOKRONEGORO PURWOREJO <br> gunakan data sebagai berikut untuk mengganti password : <br> OTP : <b>${kode}</b>`
                    await mg.messages.create(mg_domain, {
                        from: mg_email,
                        to: [username],
                        subject: "OTP RSUD RAA TJOKRONEGORO PURWOREJO",
                        text: " ",
                        html: fieldheader
                    })
                    res.status(200).json({ status: 200, message: "sukses" })
                })
            }
        }).catch(error => {
            console.log(req.body)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static changePasswordOTP(req, res) {
        const { username, password_baru, kode_otp } = req.body
        let waktu = moment()
        let encryptedPassword = bcrypt.hashPassword(password_baru);

        users.findAll({ where: { username, kode_otp } }).then(hasil1 => {
            if (hasil1.length && hasil1[0].otp_time > waktu) {
                users.update({ password: encryptedPassword, user_status: 1 }, { where: { username } }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses" })
                })
            } else if (hasil1[0].otp_time < waktu) {
                res.status(200).json({ status: 201, message: "kode OTP Kadaluarsa" })
            } else {
                res.status(200).json({ status: 201, message: "kode OTP salah" })
            }
        }).catch(error => {
            console.log(req.body)
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }
}

module.exports = Controller