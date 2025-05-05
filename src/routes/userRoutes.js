const controller = require('../controllers/userController');
const battleController = require('../controllers/battleController');
const characterController = require('../controllers/characterController');
const challengeController = require('../controllers/challengeController');
const express = require('express');
const { validatePositiveIntegerParam, validateFields } = require('../middlewares/validate');
const { hashPassword, comparePassword } = require('../middlewares/bcrypt');
const { generateToken, sendToken, verifyToken, refreshToken } = require('../middlewares/auth');
const router = express.Router();

router.get('/', controller.readAllUser);

router.post('/',
    validateFields("username", "email"),
    controller.checkUserAvailability,
    controller.validateEmail,
    hashPassword,
    controller.createUser,
    controller.readUserById,
    generateToken
);

router.post('/login',
    validateFields("username", "rememberme"),
    controller.readUserByUsername,
    comparePassword,
    generateToken
);

router.post("/refresh-token",
    refreshToken,
    generateToken
);

router.use('/token',
    verifyToken,
    controller.readUserById
)
router.get('/token', controller.readUser);

router.get('/token/characters', characterController.readCharacterByUserId);
router.get('/token/records', challengeController.readCompletionRecordsByUserId);
router.get('/token/requests',
    battleController.readRequestsByUserId,
    battleController.readRequests
);

router.use('/:user_id',
    validatePositiveIntegerParam('user_id'),
    controller.readUserById
);

router.get('/:user_id', controller.readUser);

router.put('/:user_id',
    validateFields("username", "email", "skillpoints"),
    controller.checkUserAvailability,
    controller.validateEmail,
    hashPassword,
    controller.updateUserById
);

router.get('/:user_id/characters', characterController.readCharacterByUserId);
router.get('/:user_id/records', challengeController.readCompletionRecordsByUserId);

module.exports = router;