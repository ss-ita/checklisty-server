const nodemailer = require('nodemailer');

module.exports = (data) => {
  const { emailGenerator, userEmail, subjectOption, ...emailGeneratorOptions } = data;

  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD
    }
  });
        
  const mailOptions = {
    to: userEmail,
    from: 'lv379nodejs@gmail.com',
    subject: subjectOption,
    html: emailGenerator(emailGeneratorOptions)
  };
        
  smtpTransport.sendMail(mailOptions);
}
