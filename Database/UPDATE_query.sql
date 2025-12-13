UPDATE  expenses
SET amount = ?,
category_id = ?,
note = ? 
WHERE id = ? AND user_id = ?;