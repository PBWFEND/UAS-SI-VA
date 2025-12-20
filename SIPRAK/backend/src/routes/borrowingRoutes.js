const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ownership = require('../middleware/ownership');
const controller = require('../controllers/borrowingController');
const { borrowingValidator } = require('../validators/borrowingValidator');

router.use(auth);

router.post('/', borrowingValidator, controller.create);
router.get('/', controller.findAll);
router.put('/:id', ownership, controller.update);
router.delete('/:id', ownership, controller.delete);

module.exports = router;
