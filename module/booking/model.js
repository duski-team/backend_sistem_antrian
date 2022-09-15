const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const booking = sq.define('booking',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tanggal_booking:{
        type:DataTypes.STRING
    },
    jenis_booking:{
        type:DataTypes.STRING   //Mobile atau Onsite
    },
    rm_id:{
        type:DataTypes.STRING   
    },
    NIK:{
        type:DataTypes.STRING
    },
    nama_booking:{
        type:DataTypes.STRING
    },
    no_hp_booking:{
        type:DataTypes.STRING
    },
    no_rujukan:{
        type:DataTypes.STRING
    },
    no_kontrol:{
        type:DataTypes.STRING
    },
    is_verified:{
        type:DataTypes.INTEGER  //0: belum terverifikasi, 1: sudah
    },
    is_registered:{
        type:DataTypes.INTEGER  // 0: belum registrasi, 1:sudah
    },
    status_booking:{
        type:DataTypes.INTEGER //0 :tidak_aktif/cancel , 1 :aktif
    }
    
    
},
{
paranoid:true,
freezeTableName:true
});

// booking.sync({alter:true})

module.exports = booking