const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const master_poliklinik = sq.define('master_poliklinik',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_poliklinik:{
        type:DataTypes.STRING
    },
    kode_poliklinik:{
        type:DataTypes.STRING
    }
    
    
},
{
paranoid:true,
freezeTableName:true
});

// master_poliklinik.sync({alter:true})

module.exports = master_poliklinik