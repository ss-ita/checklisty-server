const userChecklists = require('../models/users-checklists')

const createUserChecklistCollection = async (req, res) => {
  try {
    const { userID, checklistID, checkboxes_data, checklistData } = req.body;

    const result = await userChecklists.findOne({ userID: userID, checklistID: checklistID });
    
    if (result) {
      return res.status(200).json(result);
    } else {
      const usersChecklists = await new userChecklists({
        userID: userID,
        checklistID: checklistID,
        checklistData: checklistData,
        checkboxes_data: checkboxes_data
      }).save();
      return res.json(usersChecklists);
    }
  }
  catch (error) {
    res.status(500);
  }
}

const setCheckboxesData = async (req, res) => {
  try {
    const { id, checkboxArray } = req.body;

    await userChecklists.findByIdAndUpdate(id, { $set: { checkboxes_data: checkboxArray } });

    return res.status(200).json({ message: "Setted" })
  }
  catch (error) {
    return res.status(500);
  }
}

module.exports = {
  setCheckboxesData,
  createUserChecklistCollection,
};
