const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { User } = require('../models/user-model');

aws.config.update({
    secretAccessKey: process.env.AWS_SECRETKEY,
    accessKeyId: process.env.AWS_ACCESSKEY,
    region: 'us-east-1'
});

const s3 = new aws.S3();

const avatarUploadBase64 = async (req,res) => {

  const base64Data = Buffer.from(req.body.img.replace(/^data:image\/\w+;base64,/, ""),'base64')
  const type = req.body.img.split(';')[0].split('/')[1];
  const userId = req.userData.id;

  const params = {
      Bucket: 'checklisty',
      Key: `${Date.now()}-${userId}.${type}`,
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: `image/${type}`
  }

  const userForImageChecking = await User.findById(userId);
  if(userForImageChecking.image){
    const paramsDel = {  
        Bucket: 'checklisty', 
        Key: userForImageChecking.image.replace('https://checklisty.s3.amazonaws.com/','')
    };

    s3.deleteObject(paramsDel, () => {});
  }
  s3.upload(params, async (err, data) => {
      if (err) return res.status(500).json(err);
      try {
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: { image: data.Location } }, { new: true}).select('-password');
        return res.status(200).json(updatedUser);
      } catch (err) {
          res.status(500).json(err);
      }
  });
};

const avatarUploadMulter = (req, res, next) => {
  try{
    if (req.body.img) return next();
    const uploadMulter = multer({
      storage: multerS3({
        s3: s3,
        bucket: 'checklisty',
        acl: 'public-read',
        metadata: (req, file, cb) => {
          cb(null, {fieldName: file.fieldname});
        },
        key: (req, file, cb) => {
          cb(null, Date.now().toString() + '-' + file.originalname.toString())
        }
      })
    })
    const upload = uploadMulter.single('avatar');
    upload(req, res, async err => {
      if (err) return res.status(422).json(err.message);
      try{
        const userId = req.userData.id;
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: { image: req.file.location } }, { new: true }).select('-password');
        return res.status(200).json(updatedUser);
      }
      catch (err){
        return res.status(500).json(err.message);
      }
    })
  }
  catch (err){
    res.status(500).json(err.message);
  }
}

module.exports = { avatarUploadBase64, avatarUploadMulter };
