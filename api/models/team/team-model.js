const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const jwt = require('jsonwebtoken');

mongoose.plugin(slug);

const maxLength = 50;

const teamSchema = new mongoose.Schema({
  name: { type: String, maxlength: maxLength, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId,  ref: 'User', required: true },
  // slug: { type: String, slug: "name", unique: true, slugPaddingSize: 2 },
  requested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  checklists: [{ type: mongoose.Schema.Types.ObjectId,  ref: 'Checklists' }]
});

teamSchema.methods.generateTeamToken = function (userId) {
  const token = jwt.sign(
    {
      teamId: this._id,
      userId
    },
    process.env.JWT_KEY,
  );
  return token;
};

const Team = new mongoose.model('Team', teamSchema);

module.exports = { Team };
