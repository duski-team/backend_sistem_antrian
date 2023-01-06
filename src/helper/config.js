const token = process.env.TOKEN

const config = {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
};

module.exports = {config}