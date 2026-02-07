const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

/* GET transactions */
router.get('/', auth, (req, res) => {
    db.query(
        `SELECT * FROM transactions 
         WHERE user_id = ? AND status != 'deleted'
         ORDER BY created_at DESC`,
        [req.user.id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        }
    );
});

/* ADD transaction */
router.post('/', auth, (req, res) => {
    const { description, amount, type } = req.body;

    db.query(
        `INSERT INTO transactions (user_id, description, amount, type)
         VALUES (?, ?, ?, ?)`,
        [req.user.id, description, amount, type],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Transaction added' });
        }
    );
});

/* DELETE transaction */
router.delete('/:id', auth, (req, res) => {
    db.query(
        `UPDATE transactions SET status='deleted' WHERE id=? AND user_id=?`,
        [req.params.id, req.user.id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Transaction deleted' });
        }
    );
});

module.exports = router;
