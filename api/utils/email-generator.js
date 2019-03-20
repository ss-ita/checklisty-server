const forgotPasswordEmail = (emailData) => {
  const { username, resetPasswordURL } = emailData;
  return (
    `<div>
        <h1>Hello, ${username}!</h1>
        <hr />
        <h3>You are receiving this because you have requested the reset of the password for your account on Checklisty</h3>
        <h3>Please click on the following link to complete the process, your token will be available only for 10 minutes:\n\n </h3>
        <h3 style="display:flex; justify-content: center; margin: 15px auto;">
        <a href=${resetPasswordURL} 
        style="
        background-color: #3474db;
        color: white;
        padding: 15px 30px;
        text-align: center;
        text-decoration: none;
        border-radius: 5px;
        ">
        Click here to reset password!
        </a>
        </h3>
        <hr />
        <h4>If you did not request this, please ignore this email and your password will remain unchanged.\n</h4>
    </div>`
  )
}
const blockedOrDeletedEmail = (emailData) => {
  const { username, userOrList, blockedOrDeleted } = emailData;
  return (
    `<div>
      <h1>Hello, ${username}!</h1>
      <hr />
      <h3>You are receiving this because you have violated the rules of our service.</h3>
      <h3>Thus ${userOrList} was ${blockedOrDeleted}.\n\n </h3>
      <hr />
      <h4>With best regards, administartion of Checklisty.\n</h4>
     </div>`
  )
};

module.exports = { forgotPasswordEmail, blockedOrDeletedEmail };
