const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const sep = sq.define('sep', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    no_rm: {
        type: DataTypes.STRING
    },
    no_sep: {
        type: DataTypes.STRING
    },
    kode_booking: {
        type: DataTypes.STRING
    },
    data: {
        type: DataTypes.JSONB
    }
},
    {
        paranoid: true,
        freezeTableName: true
        
    });
module.exports = sep