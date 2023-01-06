const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const master_kualifikasi = sq.define('master_kualifikasi',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_kualifikasi:{
        type:DataTypes.STRING
    }
    
},
{
paranoid:true,
freezeTableName:true
});

// master_kualifikasi.sync({alter:true})

module.exports = master_kualifikasi