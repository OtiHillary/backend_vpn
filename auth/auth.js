async function login (req, res) {
   const reqq = req.body
   console.log('someone called /login-auth as :', reqq)
   // if ( name == 'otonye' && password == 'otonye' ) 
   //    res.status(200).send({ message: 'success' })
}

function signup (req, res) {

}

module.exports = {
   login,
   signup
}