const express = require('express');
const router = new express.Router();
const checklistControler = require('../controllers/checklist-controler');

router.get('/', checklistControler.getAll);
router.post('/create', checklistControler.createCheckList);
router.post('/create/:id', checklistControler.createCheckListItem);
router.get('/:id', checklistControler.getOne);
router.put('/:id', checklistControler.update);
router.delete('/:id', checklistControler.deleteList);

module.exports = router;
