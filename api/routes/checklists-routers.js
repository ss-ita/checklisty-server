const express = require('express');

const router = new express.Router();
const checklistControler = require('../controllers/checklist-controler');
const authCheck = require('../middlewares/auth-check');

router.get('/', checklistControler.getAll);
router.get('/page=:activePage/search=:searchValue/limit=:itemsInPage', checklistControler.getFive);
// router.get('/search=:filter/page=:activePage', checklistControler.searchFilter);
router.get('/author=:id', checklistControler.searchByAuthor);
router.post('/create', authCheck, checklistControler.createCheckList);
router.post('/create/:id/:sectionId', authCheck, checklistControler.createCheckListItem);
router.get('/:id', checklistControler.getOne);
router.put('/:id', checklistControler.update);
router.delete('/:id', checklistControler.deleteList);

module.exports = router;
