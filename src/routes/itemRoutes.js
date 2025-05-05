const controller = require('../controllers/itemController');
const express = require('express');
const { validatePositiveIntegerParam, validateFields } = require('../middlewares/validate');
const router = express.Router();


router.get('/', controller.readAllItem);

router.use('/:item_id',
    validatePositiveIntegerParam("item_id"),
    controller.readItemById
);

router.get('/:item_id', controller.readItem);

router.post('/',
    validateFields("name", "power", "req", "slot", "rarity"),
    controller.createItem
);

router.put('/:item_id',
    validateFields("name", "power", "req", "slot", "rarity"),
    controller.updateItemById
);

module.exports = router;