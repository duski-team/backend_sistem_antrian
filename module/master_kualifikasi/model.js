const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const master_kuallifikasi = sq.define('master_kualifikasi',{
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

// master_kuallifikasi.sync({alter:true})

module.exports = master_kuallifikasi