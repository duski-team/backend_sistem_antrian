const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const user = require('../users/model')

const member = sq.define('member', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    no_rm_pasien: {
        type: DataTypes.STRING
    },
    no_ktp: {
        type: DataTypes.STRING
    },
    nama: {
        type: DataTypes.STRING
    },
    no_bpjs: {
        type: DataTypes.STRING
    },
    tempat_lahir: {
        type: DataTypes.STRING
    },
    tanggal_lahir: {
        type: DataTypes.DATE
    },
    alamat: {
        type: DataTypes.STRING
    },
    alamat_domisili: {
        type: DataTypes.STRING
    },
    no_hp: {
        type: DataTypes.STRING
    },
    jenis_kelamin: {
        type: DataTypes.STRING
    },
    status_kawin: {
        type: DataTypes.STRING
    },
    pekerjaan: {
        type: DataTypes.STRING
    },
    pendidikan: {
        type: DataTypes.STRING
    },
    agama: {
        type: DataTypes.STRING
    },
    suku_bangsa: {
        type: DataTypes.STRING
    },
    id_provinsi: {
        type: DataTypes.STRING
    },
    id_kota: {
        type: DataTypes.STRING
    },
    id_kecamatan: {
        type: DataTypes.STRING
    },
    id_kelurahan: {
        type: DataTypes.STRING
    },
    nama_penanggung_jawab: {
        type: DataTypes.STRING
    },
    hubungan_dengan_pasien: {
        type: DataTypes.STRING
    },
    alamat_penanggung_jawab: {
        type: DataTypes.STRING
    },
    no_hp_penanggung_jawab: {
        type: DataTypes.STRING
    },
    keterangan: {
        type: DataTypes.STRING
    },
    foto_ktp: {
        type: DataTypes.STRING
    },
    status_persetujuan: {
        type: DataTypes.INTEGER,   // 0: ditolak || 1: baru dibuat || 2: disetujui
        defaultValue: 1
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

member.belongsTo(user, { foreignKey: "user_id" })
user.hasMany(member, { foreignKey: "user_id" })

module.exports = member