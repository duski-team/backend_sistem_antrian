const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const jenis_antrian = sq.define('jenis_antrian',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_jenis_antrian:{
        type:DataTypes.STRING
    },
    kode_jenis_antrian:{
        type:DataTypes.STRING
    },
    status_jenis_antrian:{
        type:DataTypes.SMALLINT
    }
    
},
{
paranoid:true,
freezeTableName:true
});

// jenis_antrian.sync({alter:true})

module.exports = jenis_antrian