const sendEmail = require('../utils/send-email');
const { inviteUserToTeam } = require('../utils/email-generator');
const { Team } = require('../models/team-model');
const { User } = require('../models/user-model');


const createTeam = async (req, res) => {
  try {
    const { name, creator } = req.body;

    if (!name) return res.status(422).json({ message: 'Creator is absent' });
    if (!creator) return res.status(422).json({ message: 'Name is required' });

    const team = await new Team({ creator, name }).save();
    
    res.status(200).json({ message: 'Team created', team });
  } catch (err) {
    res.json(err.message); 
  }
};

const getTeam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(422).json({ message: 'Team id is absent' });
    
    const team = await Team.findById(id).populate({ path: 'creator', select: 'username' });

    if (!team) return res.status(404).json({ message: 'Team not founded' });
    
    res.status(200).json(team);
  } catch (err) {
    res.json(err.message); 
  }
};

const inviteMember = async (req, res) => {
  try {
    const { inviting, invitedId, teamId, url } = req.body;
    if (!invitedId) return res.status(422).json({ message: 'Invited user id is absent' });

    let team = await Team.findOne({ _id: teamId }).select('name requested members')
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isRequested = team.requested.some(requested => requested == invitedId);
    if (isRequested) return res.status(422).json({ message: 'User is already invited' });

    const isMember = team.members.some(member => member == invitedId);
    if (isMember) return res.status(422).json({ message: 'User is already a member' });

    const invited = await User.findById(invitedId).select('username email');
    if (!invited) return res.status(404).json({ message: 'Invited user not found' });

    team = await Team.findOneAndUpdate({ _id: teamId }, { $push: { requested: invitedId } }, { new: true })
      .select('name');
    
    sendEmail({ emailGenerator: inviteUserToTeam, 
      userEmail: invited.email, 
      userName: invited.username,
      subjectOption: `You invited to team ${team.name}`,
      team,
      inviting,
      url,
      invited: invited.username});

    res.status(200).json({ message: 'User invited' });
  } catch(err) {
    res.json(err.message);
  }
};

const joinTeam = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    if (!teamId || !userId) res.status(422).json({ message: 'Team or user id is absent' });

    const user = await User.findById(userId).select('username');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let team = await Team.findById(teamId).select('members');

    const isMember = team.members.some(member => member == userId);
    if (isMember) return res.status(422).json({ message: 'User if already a member' });

    team = await Team.findOneAndUpdate(
      { _id: teamId },  
      { $push: { members: userId }, $pull: { requested: userId } }, 
      { new: true }
    );
    if (!team) return res.status(404).json({ message: 'Team not found' });

    res.status(200).send(`${user.username} joinded a team ${team.name}`);
  } catch(err) {
    res.json(err.message);
  }
}

module.exports = { createTeam, getTeam, inviteMember, joinTeam };
