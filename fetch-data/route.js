const ssh2 = require('ssh2-sftp-client');
const path = require('path');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// remote desktop initialization
const remoteHost = process.env.HOST
const remoteUser = process.env.USER
const remotePassword = process.env.PASS
const remoteFilePath = `/home/us_s_vpn_admin/algo/configs/135.148.24.72/wireguard/`
   
//db initialization
const pool = new Pool({
    user: 'testuser',
    host: '135.148.24.65',
    database: 'testdb',
    password: 'otonye',
    port: 5432,   
});

async function fetchData(req, res) {    
    try {
        const { token } = req.body;
        const email = jwt.verify(token, 'secretkey');
        const queryResult = await pool.query('SELECT * FROM vpn_user WHERE email = $1', [email.id]);
        const user = queryResult.rows[0];
        const remoteImgPath = `${remoteFilePath}${user.vpn_name}.png`
        const connection = new ssh2();

        await connection.connect({
            host: remoteHost,
            port: '22',
            username: remoteUser,
            password: remotePassword
        });

        const stream = await connection.get(remoteImgPath)
        res.setHeader('Content-Type', 'image/jpeg')
        res.status(200).send(stream)

    } catch (err) {
       console.error('the error is', err.message);
       res.status(500).json({ message: 'Server error' });

    } finally {
        // connection.end();
    }
}

async function downloadConf(req, res) {
    try {
        const token = req.query.tkn;
        const email = jwt.verify(token, 'secretkey');
        const queryResult = await pool.query('SELECT * FROM vpn_user WHERE email = $1', [email.id]);
        const user = queryResult.rows[0];
        const remoteConfPath = `${remoteFilePath}${user.vpn_name}.conf`
        const localConfPath = path.join(__dirname, `/local/${user.vpn_name}.conf`)
        const connection = new ssh2();

        await connection.connect({
            host: remoteHost,
            port: '22',
            username: remoteUser,
            password: remotePassword
        });

        await connection.get(remoteConfPath, localConfPath);
        console.log('.conf file downloaded to:', localConfPath);
        res.download(localConfPath); 
        await connection.end();

    } catch(err) {
       console.error('the error is', err.message);
       res.status(500).json({ message: 'Server error' });

    }
}

module.exports = {
    fetchData, 
    downloadConf
}