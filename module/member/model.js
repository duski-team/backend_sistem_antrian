const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const user = require('../users/model')

const member = sq.define('member',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    pasien_id:{
        type:DataTypes.INTEGER
    }
    
    
},
{
paranoid:true,
freezeTableName:true
});

member.belongsTo(user,{foreignKey:"user_id"})
user.hasMany(member,{foreignKey:"user_id"})

// member.sync({alter:true})

module.exports = member