const ssh2 = require('ssh2-sftp-client');
const fs = require('fs');

// remote desktop initialization
const remoteHost = '';
const remoteUser = '';
const remotePassword = '';

async function fetchData(req, res) {
    const { fileName } = req.body;
    const remoteFilePath = `/home/adm_cloud_01/Downloads/${fileName}`
    const localFilePath = `/public/${fileName}`
    
    try {
        const connection = new ssh2();

        await connection.connect({
            host: remoteHost,
            port: '22',
            username: remoteUser,
            password: remotePassword
        });

        const stream = await connection.get(remoteFilePath)
        res.setHeader('Content-Type', 'image/jpeg')
        res.status(200).send(stream)

    } catch (err) {
       console.error('the error is', err.message);
       res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    fetchData
}