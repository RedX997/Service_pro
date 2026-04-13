import express from 'express';
import { notify } from '../helpers/notify.js';

const router = express.Router();

// Test endpoint to manually create notifications
router.post('/', async (req, res) => {
    try {
        const { userId, role, type, title, message, priority, actionUrl } = req.body;
        
        console.log('📝 Test notification request:', req.body);
        
        const notification = await notify({
            userId,
            role,
            type: type || 'system',
            title: title || 'Test Notification',
            message: message || 'This is a test notification',
            priority: priority || 'normal',
            actionUrl: actionUrl || '/dashboard'
        });
        
        console.log('✅ Test notification created:', notification);
        
        res.json({
            success: true,
            notification
        });
    } catch (error: any) {
        console.error('❌ Error creating test notification:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
