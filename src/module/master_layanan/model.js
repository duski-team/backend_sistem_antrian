const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const master_layanan = sq.define('master_layanan',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_layanan:{
        type:DataTypes.STRING
    },
    kode:{
        type:DataTypes.STRING
    }
    
    
},
{
paranoid:true,
freezeTableName:true
});

// master_layanan.sync({alter:true})

module.exports = master_layanan