function login (req, res) {
   const { username, password } = req.json()
   if ( username == 'otonye' && password == 'otonye' ) 
      res.status(200).send({ message: 'success' })
}

function signup (req, res) {

}

export {
   login,
   signup
}