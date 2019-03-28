const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/send-email');
const { inviteUserToTeam } = require('../utils/email-generator');
const { Team } = require('../models/team/team-model');
const { User } = require('../models/user-model');

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

const invite = async (id, team, inviting, url) => {
  const invited = await User.findById(id).select('username email');

  const inviteToken = team.generateTeamToken(id);

  sendEmail({ emailGenerator: inviteUserToTeam, 
    userEmail: invited.email, 
    userName: invited.username,
    subjectOption: `You invited to team ${team.name}`,
    team,
    baseURL,
    inviting: inviting.username,
    url: url + inviteToken,
    invited: invited.username}); 
    
  team.requested.push(id);
}


const createTeam = async (req, res) => {
  try {
    const { id: creatorId } = req.userData;
    const { name, requested } = req.body;
    
    const creator = await User.findById(creatorId).select('username');
    if (!creator) return res.status(422).json({ message: 'Creator is absent' });
    if (!name) return res.status(422).json({ message: 'Name is required' });

    const team = await new Team({ creator, name, members: [creator] });

    const url = `${baseURL}/profile/myteam/${team._id}/?join=`;

    if (requested) {
      requested.split(',').map(async id => {
        await invite(id, team, creator, url);
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
    const { id: invitingId } = req.userData;
    const { invitedId, teamId } = req.body;
    if (!invitedId) return res.status(422).json({ message: 'Invited user id is absent' });

    let team = await Team.findOne({ _id: teamId }).select('name requested members')
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isRequested = team.requested.some(requested => requested == invitedId);
    if (isRequested) return res.status(422).json({ message: 'User is already invited' });

    const isMember = team.members.some(member => member == invitedId);
    if (isMember) return res.status(422).json({ message: 'User is already a member' });

    const url = `${baseURL}/profile/myteam/${team._id}/?join=`;

    const inviting = await User.findById(invitingId).select('username');
    

    invite(invitedId, team, inviting, url);

    res.status(200).json({ message: 'User invited' });
  } catch(err) {
    res.json(err.message);
  }
};

const joinTeam = async (req, res) => {
  try {
    const { token } = req.query;
    const { teamId, userId } = jwt.verify(token, process.env.JWT_KEY);
    if (!teamId || !userId) return res.status(422).json({ message: 'Team or user id is absent' });

    const user = await User.findById(userId).select('username');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let team = await Team.findById(teamId).select('members requested');

    const isRequested = team.requested.some(requested => requested == userId);
    if (!isRequested) return res.status(403).json({ message: 'User is not requested to team' }); 

    const isMember = team.members.some(member => member == userId);
    if (isMember) return res.status(204).json({ message: 'User if already a member' });

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

const deleteMember = async (req, res) => {
  try {
    const { id: acting } = req.userData;
    const { id: memberId } = req.params;
    const { teamId } = req.body;

    let team = await Team.findById(teamId);

    if (!team) res.status(404).json({ message: 'Team not found' });
    
    if (team.creator != acting) return res.status(403).json({ message: 'You are not creator of team' });

    team = await Team.findOneAndUpdate(
      { _id: teamId },
      { $pull: { 'members': memberId } },
      { new: true }
    );

    res.status(200).json({ message: 'Member deleted', team });
  } catch(err) {
    res.json(err.message);
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id: acting } = req.userData;
    const { id } = req.params;

    let team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.creator != acting) return res.status(403).json({ message: 'You are not creator of team' });

    team = await Team.findOneAndDelete({ _id: id });

    res.status(200).json({ message: `Team ${team.name} deleted`});
  } catch(err) {
    res.json(err.message);
  }
}

module.exports = { createTeam, getTeam,
  inviteMember, joinTeam, deleteMember, deleteTeam };
