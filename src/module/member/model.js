const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const user = require('../users/model')

const member = sq.define('member', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    no_rm_pasien: {
        type: DataTypes.STRING
    },
    NIK: {
        type: DataTypes.STRING
    },
    nama_member: {
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

member.belongsTo(user, { foreignKey: "user_id" })
user.hasMany(member, { foreignKey: "user_id" })

// member.sync({alter:true})

module.exports = member