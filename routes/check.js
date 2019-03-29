module.exports = (router) => {
    const db = require('../db/database')
    const func = require('../functions')

    //Get checked polls
    router.get('/user/:user_id/checked/poll/:poll_id', async (req, res, next) => {
        const {
            poll_id,
            user_id
        } = req.params;
        if (typeof parseInt(user_id) !== 'number') {
            res.json({
                success: false,
                message: 'user not found'
            })
        }
        if (typeof parseInt(poll_id) !== 'number') {
            res.json({
                success: false,
                message: 'poll not found'
            })
        }
        const query = {
            name: 'fetch-checked-poll',
            text: 'SELECT poll_id, voter_account_id, checked FROM poll_checked WHERE poll_id=$1 AND voter_account_id=$2',
            values: [poll_id, user_id]
        }

        try {
            const dbGetChecked = await db.query(query)
            if (dbGetChecked.rowCount < 1) {
                res.json({
                    success: false,
                    message: 'poll check is not found',
                })
            } else {
                res.json({
                    success: true,
                    result: dbGetChecked.rows[0]
                })
            }
        } catch (error) {
            throw error
        }
    })
    return router
}