const jwt = require( 'jsonwebtoken' )

function generateToken( payload ) {
	return jwt.sign( payload, 'Grinatha' )
}

function verifyToken( token ) {
	return jwt.verify( token, 'Grinatha' )
}

module.exports = {
	generateToken,
	verifyToken
}