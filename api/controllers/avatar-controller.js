const aws = require('aws-sdk');

aws.config.update({
    secretAccessKey: process.env.SECRETKEY,
    accessKeyId: process.env.ACCESSKEY,
    region: 'us-east-1'
});

const s3 = new aws.S3();

const avatarUpload = (req,res) => {
  const base64Data = Buffer.from(req.body.replace(/^data:image\/\w+;base64,/, ""),'base64')
  const type = req.body.split(';')[0].split('/')[1];
  const userId = Date.now().toString();

  const params = {
      Bucket: 'frontend-checklist',
      Key: `${userId}.${type}`,
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: `image/${type}`
  }

  s3.upload(params, (err, data) => {
      if (err) res.status(500).json(err);
      res.send(data.Location);
  });
};

module.exports = avatarUpload;
