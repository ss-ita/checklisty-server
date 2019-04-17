const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/send-email');
const { inviteUserToTeam } = require('../utils/email-generator');
const { Team } = require('../models/team/team-model');
const { User } = require('../models/user-model');
const { Checklist } = require('../models/checklists/checklist-model');

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
      requested.map(async id => {
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

const getTeams = async (req, res) => {
  try {
    const { id } = req.userData;
    let { page = 1, search = '', limit = 5 } = req.query;
    if (!id) return res.status(422).json({ message: 'User not found' });


    let totalTeams;
    if(search !== ''){
      totalTeams = await Team.find({ 'name': {$regex: `${search}`, $options: 'i'}})
        .where('members')
        .in(id)
        .count();
      if(limit > totalTeams){
        page = 1;
      }
    }
    else {
      totalTeams = await Team.find({ 'members': id }).count();
    }  
    const teamsAmount = await Team.find({ 'members': id }).count();

    const teams = await Team.find({ 'name': {$regex: `${search}`, $options: 'i'}})
      .where('members')
      .in(id)
      .sort({"_id": -1})
      .skip(Number(limit) * ( page - 1))
      .limit(Number(limit))
      .populate({ path: 'creator', select: 'username' });
   
    if (!teams) return res.status(404).json({ message: 'Team not founded' });
    
    res.status(200).json({teams, totalTeams, teamsAmount});
  } catch (err) {
    res.json(err.message); 
  }
};

const inviteMembers = async (req, res) => {
  try {
    const { teamId, url } = req.body;

    let team = await Team.findOne({ _id: teamId }).select('name creator requested')
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const inviting = await User.findById(team.creator).select('username');

    team.requested.map(async id => {
      const invited = await User.findById(id).select('username email');

      const inviteToken = team.generateTeamToken(id);
      
      sendEmail({ emailGenerator: inviteUserToTeam, 
        userEmail: invited.email, 
        userName: invited.username,
        subjectOption: `You invited to team ${team.name}`,
        team,
        inviting: inviting.username,
        url: url + inviteToken,
        invited: invited.username});      
    });

    res.status(200).json({ message: 'Users invited' });
  } catch(err) {
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

const getTeamChecklists = async (req, res) => {
  try {
    const userTeam = await Team.findById(req.params.id, (err) => err ? res.status(403).json({ message: 'Team with that id does not exists!' }) : null);
    const teamMemberCheck = userTeam.members.find((item) => {
      return String(item) === req.userData.id;
    });

    if (!teamMemberCheck) return res.status(403).json({ message: 'You can not get team checklists because you are not a team member!' });

    let { searchQuery = 'title', search = '', page = 1, perPage = 5, sortQuery = 'title' } = req.query;
    let order = 1;

    const totalChecklists = await Checklist.count({ [searchQuery]: { $regex: `${search}`, $options: 'i' } }).where('_id').in(userTeam.checklists);
    const totalItems = await Checklist.count().where('_id').in(userTeam.checklists);

    if (!totalItems) return res.status(400).json({ message: 'Team have not any checklists!' });
    if (!totalChecklists) return res.status(404).json({ message: 'Lists not found!' });

    if (sortQuery[0] === '-' ) {
      order = -1;
      sortQuery = sortQuery.slice(1);
    }

    if (perPage > totalChecklists) {
      perPage = totalChecklists;
      page = 1;
    }

    let totalPages = Math.ceil(totalChecklists / perPage);

    if (page > totalPages) {
      page = totalPages;
    }

    const teamChecklists = await Checklist.find(
      { [searchQuery]: { $regex: `${search}`, $options: 'i' } }
    )
      .where('_id')
      .in(userTeam.checklists)
      .collation({ locale: 'en'})
      .sort({ [sortQuery]: order })
      .skip(Number(perPage) * ( page - 1 ))
      .limit(Number(perPage))
      .select('title creation_date sections_data slug');

    const filteredChecklists = teamChecklists.map((item) => {

      const tagsArray = [];
      item.sections_data.forEach((item) => {
        item.items_data.forEach((item) => {
          tagsArray.push(item.tags.join(' '));
        })});

      return {
        title: item.title,
        date: item.creation_date,
        id: item._id,
        slug: item.slug
      };

    });

    return res.status(200).json({ filteredChecklists, totalPages, totalItems, teamName: userTeam.name });
    
  } catch(err) {
    return res.status(500);
  }
};

const searchUsers = async (req, res) => {
  try{
    const searchUserValue = req.params.searchUser;
    const getSearchUsers = await User.find({$or: [{firstname: { $regex: `${searchUserValue}`, $options: 'i'}}, 
      {lastname: { $regex: `${searchUserValue}`, $options: 'i'}},
      {username: {$regex: `${searchUserValue}`, $options: 'i'}}]});
    return res.status(200).json(getSearchUsers);
  } catch (err) {
    return res.sendStatus(500);
  }
}

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

const getTeamUsers = async (req, res) => {
  try{
    const { id: teamId } = req.params;
    const userTeam = await Team.findById(teamId, (err) => err ? res.status(403).json({ message: 'Team with that id does not exists!' }) : null);

    const teamMemberCheck = userTeam.members.find((item) => {
      return String(item) === req.userData.id;
    });

    if (!teamMemberCheck) return res.status(403).json({ message: 'You can not get team checklists because you are not a team member!' });

    const teamMembers = await Team.findById(teamId).populate('members').select('members');

    const filteredMembers = teamMembers.members.map(item => {
      return {
        id: item._id,
        username: item.username,
        firstName: item.firstname,
        lastName: item.lastname,
        image: item.image
      }
    });

    return res.status(200).json(filteredMembers);
  } catch (err) {
    return res.status(500);
  }
}

module.exports = { createTeam, getTeam,
  inviteMember, inviteMembers, joinTeam, deleteMember, deleteTeam, getTeams, searchUsers, getTeamChecklists, getTeamUsers };
