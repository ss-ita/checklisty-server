const express = require('express');
const router = new express.Router();
const checklistControler = require('../controllers/checklist-controler');

router.get('/getall', checklistControler.getAll);

router.post('/create', checklistControler.create);

// router.get('/:id', authCheck, postController.getOne);

// router.put('/:id', authCheck, postController.update);

// router.delete('/:id', authCheck, postController.remove);

module.exports = router;