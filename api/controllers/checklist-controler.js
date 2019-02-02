/* eslint-disable node/no-unsupported-features/es-syntax */
const mongoose = require('mongoose');
const CheckList = require('../models/checklist-model');

const createCheckList = async (req, res) => {

    try {
        const { item_data } = req.body;

        if (!item_data) {
            return res.status(422).json({message: 'Please, fill up all fields'});
        }
        const newList = new CheckList({
            author: mongoose.Types.ObjectId(),
            creation_date: new Date(),
            item_data
        })

        const list = await newList.save()
        res.status(201).json(list);

    } catch (error) {
        res.status(500).json(error);
    }
};

const createCheckListItem = async (req, res) => {

    try {
        const { title, description, tag, category, priority } = req.body;

        const list = await CheckList.findById(req.params.id);
        if(!list) return res.sendStatus(404);

        if (!title || !description || !tag || !category || !priority) {
            return res.status(422).json({message: 'Please, fill up all fields'});
        }
        list.item_data.push({
            title: title,
            description: description,
            tag: tag,
            category: category,
            priority: priority
        });

        const result = await list.save()
        res.status(201).json(result);

    } catch (error) {
        res.status(500).json(error);
    }
};

const getAll = async (req, res) => {

    try {
        const checkLists = await CheckList.find();

        const result = checkLists.map(doc => {
            return {
                id: doc.id,
                author: doc.author,
                creation_date: doc.creation_date,
                item_data: doc.item_data.map(item => {
                    return {
                        title: item.title,
                        description: item.description,
                        tag: item.tag,
                        category: item.category,
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

        if(!list) return res.sendStatus(404);
        const result = {
            id: list.id,
            author: list.author,
            creation_date: list.creation_date,
            item_data: list.item_data
        };
        res.status(200).json(result);

    } catch (error) {
        res.json(error);
    }
}; 

const update = async (req, res) => {

    try {
        const { title, description, tag, category, priority } = req.body;

        const list = await CheckList.findById(req.params.id);
        if(!list) return res.sendStatus(404);

        if (!title || !description || !tag || !category || !priority) {
            return res.status(422).json({message: 'Please, fill up all fields'});
        }

        list.item_data.forEach(item => {
            if(item.id === req.params.itemid) {
                console.log("method update - equals id" , item.id === req.params.itemid);
                return (
                    item.title = title || item.title,
                    item.description = description || item.description,
                    item.tag = tag || item.tag,
                    item.category = category || item.category,
                    item.priority = priority || item.priority
                )
            }
        }); 

        await list.save();  
        res.status(200).json({message: 'List updated'});

    } catch (error) {
        res.json(error);
    }
};

const deleteList = async (req, res) => {

    try {
        const succeded = await CheckList.findByIdAndDelete(req.params.id)
        if (succeded) {
            res.status(200).json({message: `Deleted Check List ID: ${req.params.id}`});
        } else res.sendStatus(404);
        
    } catch (error) {
        res.sendStatus(404);
    }
};

module.exports = { createCheckList, createCheckListItem, getAll, getOne, update, deleteList };
