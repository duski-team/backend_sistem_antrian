const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const antrianList = require('../antrian_list/model');

const sep = sq.define('sep', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    no_sep: {
        type: DataTypes.STRING
    },
    nama_dokter: {
        type: DataTypes.STRING
    },
    poli_tujuan: {
        type: DataTypes.STRING
    },
    data_sep: {
        type: DataTypes.JSONB
    }
},
    {
        paranoid: true,
        freezeTableName: true
        
    });

sep.belongsTo(antrianList, { foreignKey: "antrian_list_id" })
antrianList.hasMany(sep, { foreignKey: "antrian_list_id" })

module.exports = sep