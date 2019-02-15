/* eslint-disable node/no-unsupported-features/es-syntax */
const CheckList = require('../models/checklist-model');

const createCheckList = async (req, res) => {

    try {
        const { title, items_data } = req.body;

        if (!items_data) {
            return res.status(422).json({ message: 'Please, fill up all fields' });
        }
        const newList = new CheckList({
            title,
            author: req.userData.id,
            creation_date: new Date(),
            items_data
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
        if (!list) return res.sendStatus(404);

        if (!item_title || !description || !details || !tags || !priority) {
            return res.status(422).json({ message: 'Please, fill up all fields' });
        }
        list.items_data.push({
            item_title,
            description,
            details,
            tags,
            priority
        });

        const result = await list.save()
        res.status(201).json(result);

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
                items_data: doc.items_data.map(item => {
                    return {
                        item_title: item.item_title,
                        description: item.description,
                        details: item.details,
                        tags: item.tags,
                        priority: item.priority,
                    }
                })
            }
        });

        res.status(200).json(result);

    } catch (error) {
        res.json(error);
    }
};

const getOne = async (req, res) => {

    try {
        const list = await CheckList.findById(req.params.id);
        if (!list) return res.sendStatus(404);

        const result = {
            id: list.id,
            title: list.title,
            author: list.author,
            creation_date: list.creation_date,
            items_data: list.items_data
        };

        res.status(200).json(result);

    } catch (error) {
        res.json(error);
    }
};

const update = async (req, res) => {

    try {
        const { title, items_data } = req.body;

        const list = await CheckList.findByIdAndUpdate(req.params.id, {
            items_data: { $set: items_data },
            title: { $set: title }
        }, { new: true });
        if (!list) return res.sendStatus(404);

        await list.save();
        res.status(200).json({ message: 'List updated', list: list });

    } catch (error) {
        res.json(error);
    }
};

const deleteList = async (req, res) => {

    try {
        const succeded = await CheckList.findByIdAndDelete(req.params.id)
        if (succeded) {
            res.status(200).json({ message: `Deleted Check List ID: ${req.params.id}` });
        } else res.sendStatus(404);

    } catch (error) {
        res.sendStatus(404);
    }
};

module.exports = { createCheckList, createCheckListItem, getAll, getOne, update, deleteList };
