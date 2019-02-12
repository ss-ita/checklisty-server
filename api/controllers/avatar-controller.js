const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config.update({
    secretAccessKey: "rOA1t5goIOpjVzn63NCQTsAt48gF3NiFfWczSgLw",
    accessKeyId: "AKIAJSH7HDJE5ZGN45HA",
    region: 'us-east-1'
});

const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'frontend-checklist',
      acl: 'public-read',
      metadata: (req, file, cb) => {
        cb(null, {fieldName: file.fieldname});
      },
      key: (req, file, cb) => {
        cb(null, Date.now().toString() + '.jpg')
      }
    })
});

const singleUpload = upload.single('avatar');

const avatarUpload = async (req,res) => {
    await singleUpload(req, res, (err) => {
        if (err) {
          return res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}] });
        }
        return res.send(req.file.location);
    });
}

module.exports = avatarUpload;
