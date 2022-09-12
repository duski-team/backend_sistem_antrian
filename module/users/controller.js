const user = require('./model')
const {sq} = require("../../config/connection");
const bcrypt = require("../../helper/bcrypt.js");
const jwt = require("../../helper/jwt");
const { v4: uuid_v4 } = require("uuid");

class Controller{

    static register(req,res){
        const { username, password, role } = req.body;
        let encryptedPassword = bcrypt.hashPassword(password);
        user.findAll({ where: { username } })
            .then((data) => {
                if (data.length) {
                    res.status(200).json({ status: 200, message: "username sudah terdaftar" });
                } else {
                    user.create({ id: uuid_v4(), username, password: encryptedPassword, role }, { returning: true })
                        .then((respon) => {
                            res.status(200).json({ status: 200, message: "sukses", data: respon });
                        })
                        .catch((err) => {
                            res.status(500).json({ status: 500, message: "gagal", data: err });
                        })
                }
            })
    }

    static login(req, res) {
        const { username, password } = req.body;
        user.findAll({ where: { username } })
            .then((data) => {
                if (data.length) {
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
                } else {
                    res.status(200).json({ status: 200, message: "username Tidak Terdaftar" });
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ status: 500, message: "gagal", data: err });
            })
    }
}



module.exports=Controller