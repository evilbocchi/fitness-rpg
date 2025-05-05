const controller = require('../controllers/challengeController');
const userController = require('../controllers/userController');
const express = require('express');
const { validatePositiveIntegerParam, validateFields } = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/auth');
const router = express.Router();

router.get('/', controller.readAllChallenge);
router.post('/',
    validateFields("challenge", "skillpoints"),
    verifyToken,
    controller.createChallenge
);

router.get('/popular', controller.readPopularChallenge);
router.get('/recent', controller.readRecentChallenge);
router.get('/toprated', controller.readTopRatedChallenge);

router.use('/:challenge_id',
    validatePositiveIntegerParam('challenge_id'),
    controller.readChallengeById
);

router.put('/:challenge_id',
    validateFields("challenge", "skillpoints"),
    verifyToken,
    controller.checkChallengeOwnership,
    controller.updateChallengeById
);

router.delete('/:challenge_id',
    verifyToken,
    controller.checkChallengeOwnership,
    controller.deleteChallengeRecordsByChallengeId,
    controller.deleteChallengeById
);

router.post('/:challenge_id',
    validateFields("creation_date"),
    verifyToken,
    userController.readUserById,
    controller.createCompletionRecord
);

router.post('/:challenge_id/review',
    validateFields("rating", "description"),
    verifyToken,
    userController.readUserById,
    controller.checkEligibleToReview,
    controller.createReview
);
router.put('/:challenge_id/review',
    validateFields("rating", "description"),
    verifyToken,
    userController.readUserById,
    controller.updateReviewByIds
);
router.delete('/:challenge_id/review',
    verifyToken,
    userController.readUserById,
    controller.deleteReviewByIds
);


router.get('/:challenge_id', controller.readCompletionRecordsByChallengeId);
router.get('/:challenge_id/review', controller.readReviewsByChallengeId);


module.exports = router;