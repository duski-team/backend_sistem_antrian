const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const master_layanan=require('../master_layanan/model')

const ruang_layanan = sq.define('ruang_layanan',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_ruangan:{
        type:DataTypes.STRING
    },
    status_ruangan:{
        type:DataTypes.INTEGER,
        defaultValue:0               //0:tutup, 1:buka
    }
    
    
},
{
paranoid:true,
freezeTableName:true
});

ruang_layanan.belongsTo(master_layanan,{foreignKey:"master_layanan_id"})
master_layanan.hasMany(ruang_layanan,{foreignKey:"master_layanan_id"})

// ruang_layanan.sync({alter:true})

module.exports = ruang_layanan