const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const master_bank = sq.define('master_bank',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_bank:{
        type:DataTypes.STRING
    }
    
},
{
paranoid:true,
freezeTableName:true
});

// master_bank.sync({alter:true})

module.exports = master_bank