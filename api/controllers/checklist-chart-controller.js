const moment = require('moment');
const { Checklist } = require('../models/checklists/checklist-model');

const getMadeTodayChecklists = async (req, res) => {
  try {
    const start = moment().toISOString();
    const end = moment().subtract(1,'days').toISOString();
    const madeToday = await Checklist.find({"creation_date": {"$gte": end, "$lt": start }}).count();
  
    return res.status(201).json({date: moment().format('ll'),  count: madeToday});

  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const getChecklistsForWeek = async (req, res) => {
  try {
    let data = [];
    for (let i =7; i >=1; i--) {
      const start = moment().subtract(i-1,'days').toISOString();
      const end = moment().subtract(i,'days').toISOString();
      const lists = await Checklist.find({"creation_date": {"$gte": end, "$lt": start }});

      data.push({dayOfWeek: moment().subtract(i-1,'days').format('dddd'), date: moment().subtract(i-1,'days').format('ll'), checklists: lists.length})
    }
    
    return res.status(201).json(data);

  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const getChecklistsForMonth = async (req, res) => {
  try {
    let data = [];
    for (let i =moment().daysInMonth(); i >=1; i--) {
      const start = moment().subtract(i-1,'days').toISOString();
      const end = moment().subtract(i,'days').toISOString();
      const lists = await Checklist.find({"creation_date": {"$gte": end, "$lt": start }});

      data.push({dayOfWeek: moment().subtract(i-1,'days').format('dddd'), date: moment().subtract(i-1,'days').format('ll'), checklists: lists.length})
    }
    
    return res.status(201).json(data);

  } catch (error) {
    return res.status(500).json(error.message);
  }
};
const getChecklistsForYear = async (req, res) => {
  try {
    let data = [];
    for (let i =12; i >=1; i--) {
      const start = moment().subtract(i-1,'month').toISOString();
      const end = moment().subtract(i,'month').toISOString();
      const lists = await Checklist.find({"creation_date": {"$gte": end, "$lt": start }});

      data.push({dayOfWeek: moment().subtract(i,'month').format('MMM YYYY'), date: moment().subtract(i-1,'month').format('MMM YYYY'), checklists: lists.length})
    }
    
    return res.status(201).json(data);

  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = { getMadeTodayChecklists, getChecklistsForWeek, getChecklistsForMonth, getChecklistsForYear };
