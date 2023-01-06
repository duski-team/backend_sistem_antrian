const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const master_loket = sq.define('master_loket',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_loket:{
        type:DataTypes.STRING
    },
    status_loket:{
        type:DataTypes.INTEGER,
        defaultValue:1
    }
    
},
{
paranoid:true,
freezeTableName:true
});

// master_loket.sync({alter:true})

module.exports = master_loket