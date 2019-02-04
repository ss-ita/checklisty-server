/* eslint-disable node/no-unsupported-features/es-syntax */
const mongoose = require('mongoose');
const CheckList = require('../models/checklist-model');
const User = require('../models/user-model');

const create = async (req, res) => {

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
        console.log("action-error", error);
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

module.exports = { create, getAll };
