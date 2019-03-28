const { nestedChecklist } = require('../models/checklists/nested-checklist-model');
// const { User } = require('../models/user-model');
const { Checklist } = require('../models/checklists/checklist-model');


const createNestedChecklist = async (req, res) => {
  try {
    const { title, author_id, checklist_IDs } = req.body;
    // const user = await User.findById(author_id);
    // console.log(user)

    const newList = new nestedChecklist({
      title,
      author: author_id,
      checklists_data: checklist_IDs
    })

    const list = await newList.save()
    res.status(201).json(list);
    
  } catch (error) {
    res.json(error);    
  }
}

const getNestedChecklist = async (req, res) => {
  try {
    const { id } = req.body;
    const checklist = await Checklist.findById(id)
      .populate('sections_data');
    if (!checklist) return res.sendStatus(404);

    res.status(200).json(checklist);
  } catch (error) {
    res.json(error);
  }
}

module.exports = { createNestedChecklist, getNestedChecklist };

