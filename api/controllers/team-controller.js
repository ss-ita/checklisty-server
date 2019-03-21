const { Team } = require('../models/team-model');

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

module.exports = { createTeam, getTeam };
