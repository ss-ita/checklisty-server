const moment = require('moment');
const { User } = require('../models/user-model');

const getMadeTodayUsers = async (req, res) => {
  try {
    const start = moment().toISOString();
    const end = moment().subtract(1,'days').toISOString();
    const madeToday = await User.find({"createdAt": {"$gte": end, "$lt": start }}).count();
  
    return res.status(201).json({date: moment().format('ll'),  count: madeToday});
    
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const getUsersForWeek = async (req, res) => {
  try {
    let date = [];
    for (let i =7; i >=1; i--) {
      const start = moment().subtract(i-1,'days').toISOString();
      const end = moment().subtract(i,'days').toISOString();
      const users = await User.find({"createdAt": {"$gte": end, "$lt": start }});
      
      date.push({dayOfWeek: moment().subtract(i-1,'days').format('dddd'), date: moment().subtract(i-1,'days').format('ll'), users: users.length})
    }
    
    return res.status(201).json(date);
  
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const getUsersForMonth = async (req, res) => {
  try {
    let date = [];
    for (let i =moment().daysInMonth(); i >=1; i--) {
      const start = moment().subtract(i-1,'days').toISOString();
      const end = moment().subtract(i,'days').toISOString();
      const users = await User.find({"createdAt": {"$gte": end, "$lt": start }});
  
      date.push({dayOfWeek: moment().subtract(i-1,'days').format('dddd'), date: moment().subtract(i-1,'days').format('ll'), users: users.length})
    }
  
    return res.status(201).json(date);

  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const getUsersForYear = async (req, res) => {
  try {
    let date = [];
    for (let i =12; i >=1; i--) {
      const start = moment().subtract(i-1,'month').toISOString();
      const end = moment().subtract(i,'month').toISOString();
      const users = await User.find({"createdAt": {"$gte": end, "$lt": start }});

      date.push({dayOfWeek: moment().subtract(i-1,'month').format('MMM YYYY'), date: moment().subtract(i-1,'month').format('MMM YYYY'), users: users.length})
    }
    
    return res.status(201).json(date);

  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = { getMadeTodayUsers, getUsersForWeek, getUsersForMonth, getUsersForYear };
