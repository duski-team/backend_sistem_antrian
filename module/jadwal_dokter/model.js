const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const master_poliklinik= require('../master_poliklinik/model')
const master_dokter=require('../master_dokter/model')
const master_layanan=require('../master_layanan/model')

const jadwal_dokter = sq.define('jadwal_dokter',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    waktu_mulai:{
        type:DataTypes.DATE
    },
    waktu_selesai:{
        type:DataTypes.DATE
    },
    kode_jadwal:{
        type:DataTypes.STRING
    },
    kuota:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    // kuota_VIP:{
    //     type:DataTypes.INTEGER,
    //     defaultValue:0
    // }
    
},
{
paranoid:true,
freezeTableName:true
});

jadwal_dokter.belongsTo(master_poliklinik,{foreignKey:"master_poliklinik_id"})
master_poliklinik.hasMany(jadwal_dokter,{foreignKey:"master_poliklinik_id"})

jadwal_dokter.belongsTo(master_dokter,{foreignKey:"master_dokter_id"})
master_dokter.hasMany(jadwal_dokter,{foreignKey:"master_dokter_id"})

jadwal_dokter.belongsTo(master_layanan,{foreignKey:"master_layanan_id"})
master_layanan.hasMany(jadwal_dokter,{foreignKey:"master_layanan_id"})

// jadwal_dokter.sync({alter:true})

module.exports = jadwal_dokter