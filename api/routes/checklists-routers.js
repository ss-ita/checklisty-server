const express = require('express');

const router = new express.Router();
const checklistControler = require('../controllers/checklist-controler');
const saveChecklistProgressController = require('../controllers/save-checklist-progress-controller');
const viewedChecklistController = require('../controllers/viewed-checkist-controller');
const slugController = require('../controllers/slug-controller');
const authCheck = require('../middlewares/auth-check');
const checklistChartController = require('../controllers/checklist-chart-controller');
const nestedChecklistController = require('../controllers/nested-checklist-controller');

router.get('/', checklistControler.getAll);
router.get('/page=:activePage/search=:searchValue/limit=:itemsInPage', checklistControler.getFive);
router.get('/today', checklistChartController.getMadeTodayChecklists);
router.get('/week', checklistChartController.getChecklistsForWeek);
router.get('/month', checklistChartController.getChecklistsForMonth);
router.get('/year', checklistChartController.getChecklistsForYear);
router.get('/author=:id', authCheck, checklistControler.searchByAuthor);
router.get('/search=:searchValue', checklistControler.searchFilter);
router.get('/:id', checklistControler.getOne);
router.get('/get-viewed-checklists/userid=:id/page=:page/perpage=:perpage', 
  authCheck, viewedChecklistController.getViewedChecklists
);
router.get('/copy/:id', authCheck, checklistControler.copyList);

router.post('/create', authCheck, checklistControler.createCheckList);
router.get('/get-nested-checklist/:id', nestedChecklistController.getNestedChecklist);
router.post('/create-nested-checklist', nestedChecklistController.createNestedChecklist);
router.post('/set-checkbox-data', authCheck, saveChecklistProgressController.setCheckboxesData);
router.post('/create-users-checklists', saveChecklistProgressController.createUserChecklistCollection);
router.post('/create-teams-checklists', saveChecklistProgressController.createTeamChecklistCollection);
router.post('/create/:id/:sectionId', authCheck, checklistControler.createCheckListItem);

router.patch('/new-slug', authCheck, slugController.findAndUpdateSlug);
router.put('/:id', authCheck, checklistControler.update);

router.delete('/delete-history/userid=:id', authCheck, viewedChecklistController.deleteHistoryOfViewedLists);
router.delete('/:id', authCheck, checklistControler.deleteList);

module.exports = router;
