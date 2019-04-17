const { nestedChecklist } = require('../models/checklists/nested-checklist-model');

const createNestedChecklist = async (req, res) => {
  try {
    const { title, author_id, isPrivate, checklistData } = req.body;
    const checklist_IDs = await checklistData.map(list => list.id || list._id)

    const newList = new nestedChecklist({
      title,
      author: author_id,
      isPrivate,
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
    const slug = req.params.id;
    const checklist = await nestedChecklist.findOne({ slug: slug })
      .populate('author', 'username')
      .populate('checklists_data');

    if (!checklist) return res.sendStatus(404);

    res.status(200).json(checklist);
  } catch (error) {
    res.json(error);
  }
}

module.exports = { createNestedChecklist, getNestedChecklist };

