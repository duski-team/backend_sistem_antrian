const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const master_kualifikasi=require('../master_kualifikasi/model')
const master_specialist=require('../master_specialist/model')
const master_bank= require('../master_bank/model')
const master_poliklinik= require('../master_poliklinik/model')

const master_dokter = sq.define('master_dokter',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_dokter:{
        type:DataTypes.STRING
    },
    tempat_lahir_dokter:{
        type:DataTypes.STRING
    },
    tanggal_lahir_dokter:{
        type:DataTypes.DATE
    },
    agama_dokter:{
        type:DataTypes.STRING
    },
    jk_dokter:{
        type:DataTypes.STRING //laki -laki , perempuan
    },
    no_hp_dokter:{
        type:DataTypes.STRING
    },
    email_dokter:{
        type:DataTypes.STRING
    },
    NIK_dokter:{
        type:DataTypes.STRING
    },
    NPWP_dokter:{
        type:DataTypes.STRING
    },
    edu_bachelor:{
        type:DataTypes.STRING
    },
    edu_diploma:{
        type:DataTypes.STRING
    },
    edu_doctor:{
        type:DataTypes.STRING
    },
    keahlian_khusus:{
        type:DataTypes.STRING
    },
    foto_dokter:{
        type:DataTypes.STRING   //file1
    },
    tanda_tangan:{
        type:DataTypes.STRING   //file2
    },
    norek_bank:{
        type:DataTypes.STRING
    },
    kj_str_number:{
        type:DataTypes.STRING           //nomor surat keterangan dokter
    },
    kj_BPJS:{
        type:DataTypes.STRING            // id dokter ning BPJS
    },
    tanggal_surat:{
        type:DataTypes.DATE
    },
    tanggal_kadaluarsa_surat:{
        type:DataTypes.DATE
    }
    
},
{
paranoid:true,
freezeTableName:true
});

master_dokter.belongsTo(master_kualifikasi,{foreignKey:'master_kualifikasi_id'})
master_kualifikasi.hasMany(master_dokter,{foreignKey:'master_kualifikasi_id'})

master_dokter.belongsTo(master_specialist,{foreignKey:'master_specialist_id'})
master_specialist.hasMany(master_dokter,{foreignKey:'master_specialist_id'})

master_dokter.belongsTo(master_bank,{foreignKey:'master_bank_id'})
master_bank.hasMany(master_dokter,{foreignKey:'master_bank_id'})

// master_dokter.belongsTo(master_poliklinik,{foreignKey:'base_poliklinik_id'})
// master_poliklinik.hasMany(master_dokter,{foreignKey:'base_poliklinik_id'})




// master_dokter.sync({alter:true})

module.exports = master_dokter