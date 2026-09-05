'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  generateDSAQuestions,
  evaluateDSASolution,
  runTestCases,
  saveDSASession,
  getDSASessions
} = require('../controllers/dsa.controller');

router.use(protect);

router.post('/generate', generateDSAQuestions);
router.post('/evaluate', evaluateDSASolution);
router.post('/run-testcases', runTestCases);
router.route('/session').post(saveDSASession).get(getDSASessions);
router.route('/sessions').get(getDSASessions).post(saveDSASession);

module.exports = router;
