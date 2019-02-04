/* eslint-disable node/no-unsupported-features/es-syntax */
const mongoose = require('mongoose');
const CheckList = require('../models/checklist-model');

const createCheckList = async (req, res) => {

    try {
        const { title, item_data } = req.body;

        if (!item_data) {
            return res.status(422).json({message: 'Please, fill up all fields'});
        }
        const newList = new CheckList({
            title,
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
        const { title, description, details, tag, priority } = req.body;

        const list = await CheckList.findById(req.params.id);
        if(!list) return res.sendStatus(404);

        if (!title || !description || !details || !tag || !priority) {
            return res.status(422).json({message: 'Please, fill up all fields'});
        }
        list.item_data.push({
            title,
            description,
            details,
            tag,
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
        const checkLists = await CheckList.find();

        const result = checkLists.map(doc => {
            return {
                id: doc.id,
                title: doc.title,
                author: doc.author,
                creation_date: doc.creation_date,
                item_data: doc.item_data.map(item => {
                    return {
                        title: item.title,
                        description: item.description,
                        tag: item.tag,
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
            title: list.title,
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
        const {title, item_data} = req.body;
        
        const list = await CheckList.findByIdAndUpdate(req.params.id, {
            item_data: {$set: item_data},
            title:  {$set: title}
        }, {new: true});
        if(!list) return res.sendStatus(404);

        await list.save();  
        res.status(200).json({message: 'List updated', list: list});

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
