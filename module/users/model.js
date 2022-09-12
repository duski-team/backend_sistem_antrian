const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const users = sq.define('users',{
    id:{
        type: DataTypes.UUID,
        primaryKey: true,
    },
    username:{
        type:DataTypes.STRING
    },
    password:{
        type:DataTypes.STRING
    },
    role:{
        type:DataTypes.STRING
    }
    
    
},
{
paranoid:true,
freezeTableName:true
});

// users.sync({alter:true})

module.exports = users