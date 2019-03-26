const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/send-email');
const { inviteUserToTeam } = require('../utils/email-generator');
const { Team } = require('../models/team/team-model');
const { User } = require('../models/user-model');


const createTeam = async (req, res) => {
  try {
    const { id: creator } = req.userData;
    const { name, requested, url } = req.body;

    if (!creator) return res.status(422).json({ message: 'Creator is absent' });
    if (!name) return res.status(422).json({ message: 'Name is required' });

    const team = await new Team({ creator, name, members: [creator] });

    const inviting = User.findById(creator).select('username');

    if (requested) {
      requested.split(',').map(el => {
        team.requested.push(el);
      });
  
      team.requested.map(async (id) => {
        const invited = await User.findById(id).select('username email');
        const inviteToken = team.generateTeamToken(id);
        
        sendEmail({ emailGenerator: inviteUserToTeam, 
          userEmail: invited.email, 
          userName: invited.username,
          subjectOption: `You invited to team ${team.name}`,
          team,
          inviting,
          url: url + inviteToken,
          invited: invited.username});
      });  
    }

    await team.save();
    
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
    const { id: inviting } = req.userData;
    const { invitedId, teamId, url } = req.body;
    if (!invitedId) return res.status(422).json({ message: 'Invited user id is absent' });

    let team = await Team.findOne({ _id: teamId }).select('name requested members')
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isRequested = team.requested.some(requested => requested == invitedId);
    if (isRequested) return res.status(422).json({ message: 'User is already invited' });

    const isMember = team.members.some(member => member == invitedId);
    if (isMember) return res.status(422).json({ message: 'User is already a member' });

    const invited = await User.findById(invitedId).select('username email');
    if (!invited) return res.status(404).json({ message: 'Invited user not found' });

    const inviteToken = team.generateTeamToken(invitedId);

    team = await Team.findOneAndUpdate({ _id: teamId }, { $push: { requested: invitedId } }, { new: true })
      .select('name');
    
    sendEmail({ emailGenerator: inviteUserToTeam, 
      userEmail: invited.email, 
      userName: invited.username,
      subjectOption: `You invited to team ${team.name}`,
      team,
      inviting,
      url: url + inviteToken,
      invited: invited.username});

    res.status(200).json({ message: 'User invited' });
  } catch(err) {
    res.json(err.message);
  }
};

const joinTeam = async (req, res) => {
  try {
    const { token } = req.query;
    const { teamId, userId } = jwt.verify(token, process.env.JWT_KEY);
    if (!teamId || !userId) res.status(422).json({ message: 'Team or user id is absent' });

    const user = await User.findById(userId).select('username');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let team = await Team.findById(teamId).select('members requested');

    const isRequested = team.requested.some(requested => requested == userId);
    if (!isRequested) return res.status(422).json({ message: 'User is not requested to team' }); 

    const isMember = team.members.some(member => member == userId);
    if (isMember) return res.status(422).json({ message: 'User if already a member' });

    team = await Team.findOneAndUpdate(
      { _id: teamId },  
      { $push: { members: userId }, $pull: { requested: userId } }, 
      { new: true }
    );

    res.status(200).send(`${user.username} joinded a team ${team.name}`);
  } catch(err) {
    res.json(err.message);
  }
};

module.exports = { createTeam, getTeam, inviteMember, joinTeam };
