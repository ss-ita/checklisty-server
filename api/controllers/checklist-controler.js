const { Checklist, validateChecklist } = require('../models/checklist-model');
const { User } = require('../models/user-model');
const userChecklists = require('../models/users-checklists');

const createCheckList = async (req, res) => {
  try {
    if (Object.keys(req.body).length) {
      req.body.sections_data.map((section) => {
        delete section._id;
        return (
          section.items_data.map(item => delete item._id)
        );
      });
    }

    const { error } = validateChecklist(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const { title, sections_data, isPrivate } = req.body;

    const newList = new Checklist({
      title,
      author: req.userData.id,
      isPrivate,
      creation_date: new Date(),
      sections_data
    })

    const list = await newList.save()
    res.status(201).json(list);

  } catch (error) {
    res.status(500).json(error.message);
  }
};

const createCheckListItem = async (req, res) => {
  try {
    const { item_title, description, details, tags, priority } = req.body;

    const list = await Checklist.findById(req.params.id);

    if (!list) return res.sendStatus(404);

    const section = list.sections_data.find(item => item.id === req.params.sectionId);

    section.items_data.push({
      item_title,
      description,
      details,
      tags,
      priority
    });

    await list.save();
    res.status(201).json(list);

  } catch (error) {
    res.status(500).json(error);
  }
};

const getAll = async (req, res) => {
  try {
    const checkLists = await Checklist.find(
      { $or: [{ isPrivate: false }, { isPrivate: { $exists: false } }] }
    ).populate('author', 'username');
    const totalItems = await Checklist.count({ $or: [{ isPrivate: false }, { isPrivate: { $exists: false } }] });
    const result = checkLists.map(doc => {
      return {
        id: doc.id,
        title: doc.title,
        author: doc.author,
        slug: doc.slug,
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

    res.status(200).json({ result, totalItems });

  } catch (error) {
    res.json(error);
  }
};
const getFive = async (req, res) => {

  try { 
    const limitItemsInPage = parseInt(req.params.itemsInPage);
    const searchValue = req.params.searchValue;
    let howItemsSkip = (parseInt(req.params.activePage) - 1) * limitItemsInPage;
    let checkLists = null;
    let totalItems = null;
    if(searchValue === 'undefined'){
      totalItems = await Checklist.find({ $or: [{ isPrivate: false  }, {isPrivate: { $exists: false }}]}).count();
      if (req.params.activePage > totalItems) {
        howItemsSkip = 0;
      }
      checkLists = await Checklist.find({ $or: [{ isPrivate: false  }, {isPrivate: { $exists: false }}]}).sort({ "creation_date": -1 }).skip(howItemsSkip).limit(limitItemsInPage).populate('author', 'username');
    }
    else {
      howItemsSkip = 0;
      totalItems = Math.ceil(await Checklist.find({ "title": { $regex: `${searchValue}`, $options: 'i' }, $or: [{ isPrivate: false  }, {isPrivate: { $exists: false }}]}).count());
      checkLists = await Checklist.find({  "title": { $regex: `${searchValue}`, $options: 'i' }, $or: [{ isPrivate: false  }, {isPrivate: { $exists: false }}]}).sort({ "creation_date": -1 }).skip(howItemsSkip).limit(limitItemsInPage).populate('author', 'username');
    }
    const result = checkLists.map(doc => {
      return {
        id: doc.id,
        title: doc.title,
        author: doc.author,
        slug: doc.slug,
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

    res.status(200).json({result, totalItems});

  } catch (error) {
    res.json(error);
  }
};

const searchFilter = async (req, res) => {
  try {
    const search = req.params.filter;
    let howMuch = (parseInt(req.params.activePage) - 1) * 5;

    const totalItems = Math.ceil(await Checklist.find({
      "title": { $regex: `${search}`, $options: 'i' },
      $or: [{ isPrivate: false }, { isPrivate: { $exists: false } }]
    }).count() / 5);

    if (howMuch > totalItems) {
      howMuch = totalItems;
    }

    const checkLists = await Checklist.find({
      "title": { $regex: `${search}`, $options: 'i' },
      $or: [{ isPrivate: false }, { isPrivate: { $exists: false } }]
    }).sort({ "creation_date": -1 }).skip(howMuch).limit(5).populate('author', 'username');

    const result = checkLists.map(doc => {
      return {
        id: doc.id,
        title: doc.title,
        author: doc.author,
        slug: doc.slug,
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
    res.status(200).json({ result, totalItems });
  } catch (error) {
    res.json(error);
  }
}

const searchByAuthor = async (req, res) => {
  try {
    const author = req.params.id;
    const lists = await Checklist.find({ author });

    const result = lists.map(doc => {
      return {
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        tags: doc.sections_data.map(data => {
          const tags = [];
          data.items_data.map(el => {
            el.tags.map(item => {
              if (!tags.includes(item)) {
                tags.push(item);
              }
            })
          });
          return tags;
        }),
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
    res.json(error.message);
  }
}

const getOne = async (req, res) => {
  try {
    const list = await Checklist.findOne({ slug: req.params.id });
    if (!list) return res.sendStatus(404);

    const result = {
      id: list.id,
      title: list.title,
      isPrivate: list.isPrivate,
      author: list.author,
      slug: list.slug,
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
    const { title, sections_data, isPrivate } = req.body;

    if (Object.keys(req.body).length) {
      req.body.sections_data.map((section) => {
        delete section._id;
        return (
          section.items_data.map(item => delete item._id)
        );
      });
    }

    const list = await Checklist.findOneAndUpdate(
      { slug: req.params.id },
      { $set: { sections_data, title, isPrivate } },
      { new: true }
    );

    if (!list) return res.sendStatus(404);

    res.status(200).json({ message: 'List updated', list: list });

  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteList = async (req, res) => {
  try {
    const checkListCheck = await Checklist.findById(req.params.id);
    const operatingUser = await User.findById(req.userData.id);
    if (checkListCheck.author !== req.userData.id && (operatingUser.role !== 'admin' && operatingUser.role !== 'moderator')) {
      return res.status(403).json({ message: 'Access denied!' });
    }
    const deletedList = await Checklist.findByIdAndDelete(req.params.id);
    await userChecklists.find({ checklistID: req.params.id }).remove();
    if (deletedList) {
      res.status(200).json({ message: `Deleted list: ${deletedList.title}` });
    } else res.sendStatus(404);

  } catch (error) {
    res.json(error);
  }
};

module.exports = {
  createCheckList,
  createCheckListItem,
  getAll,
  getOne,
  update,
  deleteList,
  searchByAuthor,
  searchFilter,
  getFive,
};
