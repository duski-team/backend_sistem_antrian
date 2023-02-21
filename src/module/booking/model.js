const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const jadwal_dokter = require('../jadwal_dokter/model')
const user = require('../users/model')

const booking = sq.define('booking', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tanggal_booking: {
        type: DataTypes.DATE
    },
    jenis_booking: {
        type: DataTypes.STRING   //Mobile atau Onsite
    },
    no_rm: {
        type: DataTypes.STRING
    },
    NIK: {
        type: DataTypes.STRING
    },
    nama_booking: {
        type: DataTypes.STRING
    },
    no_hp_booking: {
        type: DataTypes.STRING
    },
    no_rujukan: {
        type: DataTypes.STRING
    },
    no_kontrol: {
        type: DataTypes.STRING
    },
    is_verified: {
        type: DataTypes.INTEGER  //0: belum terverifikasi, 1: sudah
    },
    is_registered: {
        type: DataTypes.INTEGER  // 0: belum registrasi, 1:sudah
    },
    status_booking: {
        type: DataTypes.INTEGER //0 :batal , 1 :aktif , 2 :diacc ,9: selesai
    },
    kode_booking: {
        type: DataTypes.STRING
    },
    flag_layanan: {
        type: DataTypes.INTEGER, // 0: non bpjs || 1: bpjs 
        defaultValue: 0
    },
    tujuan_booking: {
        type: DataTypes.INTEGER, // 1: mandiri || 2:rujukan || 3:kontrol 
    },
    foto_surat_rujukan: {
        type: DataTypes.STRING
    },
    tanggal_rujukan: {
        type: DataTypes.DATE,
        defaultValue: null
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

booking.belongsTo(jadwal_dokter, { foreignKey: "jadwal_dokter_id" })
jadwal_dokter.hasMany(booking, { foreignKey: "jadwal_dokter_id" })

booking.belongsTo(user, { foreignKey: "user_id" })
user.hasMany(booking, { foreignKey: "user_id" })

// booking.sync({alter:true})

module.exports = booking