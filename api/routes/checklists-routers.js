const express = require('express');

const router = new express.Router();
const checklistControler = require('../controllers/checklist-controler');
const saveChecklistProgressController = require('../controllers/save-checklist-progress-controller');
const viewedChecklistController = require('../controllers/viewed-checkist-controller');
const slugController = require('../controllers/slug-controller');
const authCheck = require('../middlewares/auth-check');

router.get('/', checklistControler.getAll);
router.get('/page=:activePage/search=:searchValue/limit=:itemsInPage', checklistControler.getFive);
router.get('/author=:id', checklistControler.searchByAuthor);
router.get('/:id', checklistControler.getOne);
router.post('/create', authCheck, checklistControler.createCheckList);
router.post('/set-checkbox-data', saveChecklistProgressController.setCheckboxesData);
router.post('/create-users-checklists', saveChecklistProgressController.createUserChecklistCollection);
router.get('/get-viewed-checklists/userid=:id/page=:page/perpage=:perpage', viewedChecklistController.getViewedChecklists);
router.delete('/delete-history/userid=:id', viewedChecklistController.deleteHistoryOfViewedLists);
router.post('/create/:id/:sectionId', authCheck, checklistControler.createCheckListItem);
router.patch('/new-slug', slugController.findAndUpdateSlug);
router.put('/:id', checklistControler.update);
router.delete('/:id', authCheck, checklistControler.deleteList);

module.exports = router;
