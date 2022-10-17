const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const booking = require('../booking/model')
const jadwal_dokter= require('../jadwal_dokter/model')

const antrian_list = sq.define('antrian_list',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tanggal_antrian:{
        type:DataTypes.DATE
    },
    is_master:{
        type:DataTypes.SMALLINT
    },
    poli_layanan:{
        type:DataTypes.INTEGER  //1.poli 2.layanan
    },
    innitial:{
        type:DataTypes.STRING
    },
    antrianno:{
        type:DataTypes.INTEGER
    },
    sequence:{
        type:DataTypes.STRING
    },
    is_cancel:{
        type:DataTypes.SMALLINT
    }
    
},
{
paranoid:true,
freezeTableName:true
});

antrian_list.belongsTo(booking,{foreignKey:"antrian_list_id"})
booking.hasMany(antrian_list,{foreignKey:"antrian_list_id"})

antrian_list.belongsTo(jadwal_dokter,{foreignKey:"jadwal_dokter_id"})
jadwal_dokter.hasMany(antrian_list,{foreignKey:"jadwal_dokter_id"})

// antrian_list.sync({alter:true})



module.exports = antrian_list