const express = require('express');
const router = new express.Router();
const checklistControler = require('../controllers/checklist-controler');
const authCheck = require('../middlewares/auth-check');

router.get('/', checklistControler.getAll);
router.get('/author=:id', checklistControler.searchByAuthor);
router.get('/page=:activePage', checklistControler.getFive);
router.get('/search=:filter', checklistControler.searchFilter);
router.post('/create', authCheck, checklistControler.createCheckList);
router.post('/create/:id/:sectionId', authCheck, checklistControler.createCheckListItem);
router.get('/:id', checklistControler.getOne);
router.put('/:id', checklistControler.update);
router.delete('/:id', checklistControler.deleteList);

module.exports = router;
