const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const jenis_antrian=require('../jenis_antrian/model')
const master_loket=require('../master_loket/model')

const antrian_loket = sq.define('antrian_loket',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nomor_antrian_loket:{
        type:DataTypes.INTEGER
    },
    status_antrian:{
        type:DataTypes.INTEGER,  //0 belum dipanggil, 1 sedang dipanggil,2 sudah dipanggil
        defaultValue:0
    },
    tanggal_antrian_loket:{
        type:DataTypes.DATE
    }
    
},
{
paranoid:true,
freezeTableName:true
});

// antrian_loket.sync({alter:true})

antrian_loket.belongsTo(jenis_antrian,{foreignKey:"jenis_antrian_id"})
jenis_antrian.hasMany(antrian_loket,{foreignKey:"jenis_antrian_id"})

antrian_loket.belongsTo(master_loket,{foreignKey:"master_loket_id"})
master_loket.hasMany(antrian_loket,{foreignKey:"master_loket_id"})

module.exports = antrian_loket