const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authMiddleware = require('../middleware/auth');

router.get('/dashboard/tasks', authMiddleware, volunteerController.getVolunteerTasks);
router.put('/dashboard/tasks/:assignmentId/status', authMiddleware, volunteerController.updateVolunteerTaskStatus);
router.post('/dashboard/tasks/:assignmentId/feedback', authMiddleware, volunteerController.submitVolunteerFeedback);

// Get volunteers by city
router.get('/city/:city', volunteerController.getVolunteersByCity);

// Get volunteers by role
router.get('/role/:role', volunteerController.getVolunteersByRole);

// Get all volunteers
router.get('/', volunteerController.getAllVolunteers);

// Create new volunteer
router.post('/', volunteerController.createVolunteer);
router.post('/join', volunteerController.createVolunteer);

// Get volunteer by ID
router.get('/:id', volunteerController.getVolunteerById);

// Update volunteer
router.put('/:id', volunteerController.updateVolunteer);

// Delete volunteer
router.delete('/:id', volunteerController.deleteVolunteer);

module.exports = router;
