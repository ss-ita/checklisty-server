const aws = require('aws-sdk');
const { User } = require('../models/user-model');

aws.config.update({
    secretAccessKey: process.env.SECRETKEY,
    accessKeyId: process.env.ACCESSKEY,
    region: 'us-east-1'
});

const s3 = new aws.S3();

const avatarUpload = (req,res) => {

  const base64Data = Buffer.from(req.body.img.replace(/^data:image\/\w+;base64,/, ""),'base64')
  const type = req.body.img.split(';')[0].split('/')[1];
  const userId = req.userData._id;

  const params = {
      Bucket: 'frontend-checklist',
      Key: `${Date.now()}-${userId}.${type}`,
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: `image/${type}`
  }

  s3.upload(params, async (err, data) => {
      if (err) res.status(500).json(err);
      try {
        await User.findByIdAndUpdate(userId,{ $set: { image: data.Location } });
        res.send(data.Location);
      } catch (err) {
          res.status(500).json(err);
      }
  });
};

module.exports = avatarUpload;
