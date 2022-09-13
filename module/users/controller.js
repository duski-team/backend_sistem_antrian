const users = require('./model')
const {sq} = require("../../config/connection");
const bcrypt = require("../../helper/bcrypt.js");
const jwt = require("../../helper/jwt");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');;
const s = {type:QueryTypes.SELECT}

class Controller{

    static register(req,res){
        const { username, password, role } = req.body;
        let encryptedPassword = bcrypt.hashPassword(password);
        users.findAll({ where: { username } })
            .then((data) => {
                if (data.length) {
                    res.status(200).json({ status: 200, message: "username sudah terdaftar" });
                } else {
                    users.create({ id: uuid_v4(), username, password: encryptedPassword, role }, { returning: true })
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
        users.findAll({ where: { username } })
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


    static update(req,res){
        const{id,role}=req.body
        users.update({role},{
            where:{
                id
            }
        }).then(hasil=>{
            res.status(200).json({ status: 200, message: "sukses"})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }

    static async list(req,res){
        try {
            let data = await sq.query(`select * from users u where u."deletedAt" isnull`,s)
            res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
    }

    static async detailsById(req,res){
        const{id}= req.params
        try {
            let data = await sq.query(`select * from users u where u."deletedAt" isnull and u.id='${id}'`,s)
            res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        }
    }

    static delete(req,res){
        const{id}= req.body
        users.destroy({where:{id}})
        .then(hasil=>{
            res.status(200).json({ status: 200, message: "sukses"})
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error})
        })
    }
}



module.exports=Controller