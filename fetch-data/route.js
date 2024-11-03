const ssh2 = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

// remote desktop initialization
const remoteHost = process.env.HOST
const remoteUser = process.env.USER
const remotePassword = process.env.PASS
const remoteFilePath = `/home/us_s_vpn_admin/algo/configs/135.148.24.72/wireguard/`
   
const connection = new ssh2();


async function fetchData(req, res) {
    const { fileName } = req.body;
    const remoteImgPath = remoteFilePath + 'holakaal.png'

    await connection.connect({
        host: remoteHost,
        port: '22',
        username: remoteUser,
        password: remotePassword
    });
    
    try {
        const stream = await connection.get(remoteImgPath)
        res.setHeader('Content-Type', 'image/jpeg')
        res.status(200).send(stream)

    } catch (err) {
       console.error('the error is', err.message);
       res.status(500).json({ message: 'Server error' });

    } finally {
        connection.end();
    }
}

async function downloadConf(req, res) {
    const { fileName } = req.body;

    await connection.connect({
        host: remoteHost,
        port: '22',
        username: remoteUser,
        password: remotePassword
    });
    
    try {
        const remoteConfPath = remoteFilePath + 'holakaal.conf'
        const localConfPath = path.join(__dirname, '/local/holakaal.conf')

        await connection.get(remoteConfPath, localConfPath);
        console.log('.conf file downloaded to:', localConfPath);

        res.download(localConfPath); 

    } catch(err) {
       console.error('the error is', err.message);
       res.status(500).json({ message: 'Server error' });

    } finally {
        connection.end();
    }
}

module.exports = {
    fetchData, 
    downloadConf
}