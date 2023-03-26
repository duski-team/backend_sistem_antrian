const version = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');

class Controller {

    static register(req, res) {
        const { nama_version } = req.body;

        version.findAll({where:{username:{[Op.iLike]:nama_version}}}).then(async (data) => {
            if(data.length>0){
                res.status(201).json({ status: 204, message: "data sudah ada" });
            }else{
                await version.create({id:uuid_v4(),nama_version}).then(data2 =>{
                    res.status(200).json({ status: 200, message: "sukses", data:data2 });
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, nama_version } = req.body

        version.update({nama_version}, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select * from version v where v."deletedAt" isnull order by v."createdAt" desc`, s);
            
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params
        try {
            let data = await sq.query(`select * from version v where v."deletedAt" isnull and v.id='${id}'`, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body
        
        version.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }


}

module.exports = Controller