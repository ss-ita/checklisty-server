const userChecklists = require('../models/checklists/users-checklists')

const countpercentProgress = (array) => {
  let counter = 0, amount = 0;
  for (let i = 0; i < array.length; i++) {
    amount += array[i].length;
    for (let j = 0; j < array[i].length; j++) {
      if (array[i][j] === true) counter++;
    }
  }
  if (counter && amount) {
    return ((counter / amount) * 100).toFixed(0);
  } else {
    return 0;
  }
}

const getViewedChecklists = async (req, res) => {
  try {
    const id = req.params.id;
    const perPage = parseInt(req.params.perpage);
    const activePages = (parseInt(req.params.page) - 1) * perPage;

    const totalPagesArray = await userChecklists.find({ userID: id });

    const totalPages = totalPagesArray.length;

    const historyResponse = await userChecklists.find({ userID: id }).sort({ '_id': -1 })
      .skip(activePages).limit(perPage).populate('checklistData');

    const checklist = historyResponse.map(item => (item.checklistData));

    let currentProgress = [];

    historyResponse.map((elem) => {
      if (elem.id) currentProgress.push(countpercentProgress(elem.checkboxes_data));
    });

    return res.status(200).json({ checklist: checklist, progress: currentProgress, totalPages })
  }
  catch (error) {
    res.status(500);
  }
}

const deleteHistoryOfViewedLists = async (req, res) => {
  try {
    await userChecklists.find({ userID: req.params.id }).remove();

    res.status(200).json({ message: `History deleted` });
  } catch (error) {
    res.json(error);
  }
}


module.exports = {
  getViewedChecklists,
  deleteHistoryOfViewedLists,
};