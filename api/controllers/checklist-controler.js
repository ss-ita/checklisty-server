/* eslint-disable node/no-unsupported-features/es-syntax */
const CheckList = require('../models/checklist-model');

const createCheckList = async (req, res) => {

    try {
        const { title, sections_data} = req.body;
        const {sections_data:[{section_title, items_data}]} = req.body;
        
        if (!section_title || !items_data) {
            return res.status(422).json({ message: 'Please, fill up all fields' });
        }
        const newList = new CheckList({
            title,
            author: req.userData.id,
            creation_date: new Date(),
            sections_data
        })

        const list = await newList.save()
        res.status(201).json(list);

    } catch (error) {
        res.status(500).json(error);
    }
};

const createCheckListItem = async (req, res) => {

    try {
        const { item_title, description, details, tags, priority } = req.body;

        const list = await CheckList.findById(req.params.id);
        const section = await list.sections_data.find(item => item.id === req.params.sectionId);
        
        if (!list) return res.sendStatus(404);

        if (!item_title || !description || !tags || !priority) {
            return res.status(422).json({ message: 'Please, fill up all fields' });
        }

        section.items_data.push({
            item_title,
            description,
            details,
            tags,
            priority
        });
        await list.save()
        res.status(201).json(list);

    } catch (error) {
        res.status(500).json(error);
    }
};

const getAll = async (req, res) => {
    try {
        const checkLists = await CheckList.find().populate('author', 'username');
        const result = checkLists.map(doc => {
            return {
                id: doc.id,
                title: doc.title,
                author: doc.author,
                creation_date: doc.creation_date,
                sections_data: doc.sections_data.map(section => {
                  return {
                    section_title: section.section_title,
                    items_data: section.items_data.map(item => {
                      return {
                        item_title: item.item_title,
                        description: item.description,
                        details: item.details,
                        tags: item.tags,
                        priority: item.priority,
                    }
                    })
                  }
                })
            }
        });
        
        res.status(200).json(result);

    } catch (error) {
        res.json(error);
    }
};

const getFive = async (req, res) => {
    try {
        const checkLists = await CheckList.find().populate('author', 'username');
        const result = checkLists.map(doc => {
            return {
                id: doc.id,
                title: doc.title,
                author: doc.author,
                creation_date: doc.creation_date,
                sections_data: doc.sections_data.map(section => {
                  return {
                    section_title: section.section_title,
                    items_data: section.items_data.map(item => {
                      return {
                        item_title: item.item_title,
                        description: item.description,
                        details: item.details,
                        tags: item.tags,
                        priority: item.priority,
                    }
                    })
                  }
                })
            }
        });
        
        res.status(200).json(result);

    } catch (error) {
        res.json(error);
    }
};

const searchFilter = async (req, res) => {
    try {
        const search = req.params.filter;
        const checkLists = await CheckList.find({"title": {$regex : `${search}`, $options: 'i'}}).populate('author', 'username');
        const result = checkLists.map(doc => {
                return {
                    id: doc.id,
                    title: doc.title,
                    author: doc.author,
                    creation_date: doc.creation_date,
                    sections_data: doc.sections_data.map(section => {
                      return {
                        section_title: section.section_title,
                        items_data: section.items_data.map(item => {
                          return {
                            item_title: item.item_title,
                            description: item.description,
                            details: item.details,
                            tags: item.tags,
                            priority: item.priority,
                        }
                        })
                      }
                    })
                }
        });
        res.status(200).json(result);
    } catch (error) {
        res.json(error);
    }
}

const getOne = async (req, res) => {

    try {
        const list = await CheckList.findById(req.params.id);
        if (!list) return res.sendStatus(404);

        const result = {
            id: list.id,
            title: list.title,
            author: list.author,
            creation_date: list.creation_date,
            sections_data: list.sections_data.map(section => {
              return {
                section_title: section.section_title,
                items_data: section.items_data
              }
            })
        };

        res.status(200).json(result);

    } catch (error) {
        res.json(error);
    }
};

const update = async (req, res) => {

    try {
        const { title, sections_data } = req.body;

        const list = await CheckList.findByIdAndUpdate(
          req.params.id, 
          { $set: { sections_data, title } }, 
          { new: true }
        );
        
        if (!list) return res.sendStatus(404);

        res.status(200).json({ message: 'List updated', list: list });

    } catch (error) {
        res.json(error);
    }
};

const deleteList = async (req, res) => {
    try {
        const deletedList = await CheckList.findByIdAndDelete(req.params.id);
        if (deletedList) {
            res.status(200).json({ message: `Deleted Check List Title: ${deletedList.title}` });
        } else res.sendStatus(404);

    } catch (error) {
        res.sendStatus(404);
    }
};

module.exports = { createCheckList, createCheckListItem, getAll, getOne, update, deleteList, searchFilter, getFive };
