const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const master_specialist = sq.define('master_specialist',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_specialist:{
        type:DataTypes.STRING
    },
    kode_specialist:{
        type:DataTypes.STRING
    }
    
    
},
{
paranoid:true,
freezeTableName:true
});

// master_specialist.sync({alter:true})

module.exports = master_specialist