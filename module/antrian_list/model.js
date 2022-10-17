const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const booking = require('../booking/model')
const jadwal_dokter= require('../jadwal_dokter/model')

const antrian_list = sq.define('antrian_list',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tanggal_antrian:{
        type:DataTypes.DATE
    },
    is_master:{
        type:DataTypes.SMALLINT //0:not master, 1 : master
    },
    poli_layanan:{
        type:DataTypes.INTEGER  //1.poli 2.layanan
    },
    initial:{
        type:DataTypes.STRING
    },
    antrian_no:{
        type:DataTypes.INTEGER
    },
    sequence:{
        type:DataTypes.INTEGER
    },
    is_cancel:{
        type:DataTypes.SMALLINT, 
        default:0
    },
    is_process:{
        type:DataTypes.SMALLINT,  //0: belum di proses, 1: sudah di proses
        defaultValue:0
    },
    status_antrian:{
        type:DataTypes.SMALLINT,
        defaultValue:0     //0: belum selesai, 1: selesai
    }
    
},
{
paranoid:true,
freezeTableName:true
});

antrian_list.belongsTo(booking,{foreignKey:"booking_id"})
booking.hasMany(antrian_list,{foreignKey:"booking_id"})

antrian_list.belongsTo(jadwal_dokter,{foreignKey:"jadwal_dokter_id"})
jadwal_dokter.hasMany(antrian_list,{foreignKey:"jadwal_dokter_id"})

// antrian_list.sync({alter:true})



module.exports = antrian_list