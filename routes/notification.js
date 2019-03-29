module.exports = (router) => {
  const db = require('../db/database')
  const func = require('../functions')

  //Fire this notification when someone replies to someone
  //The person you are replying to will be notified
  //When you reply to someone, a notification is fired with the person you replied to account_id which we use to notify him/her
  router.post('/auth/post-reply-notification', async (req, res, next) => {
    const commentId = req.body.commentId
    const pollId = req.body.pollId
    if (!commentId) {
      res.json({
        success: false,
        message: 'comment not found'
      })
    }
    if (!pollId) {
      res.json({
        success: false,
        message: 'poll not found'
      })
    } else {
      const date = new Date()
      const fetchReplyIdQuery = {
        name: 'fetch-reply-id',
        text: 'SELECT reply_id, comment_info, comment_creator_account_id FROM comment WHERE comment_id = $1',
        values: [commentId]
      }
      try {
        const dbReply = await db.query(fetchReplyIdQuery)
        if (dbReply.rowCount > 0) {
          const replyId = dbReply.rows[0].reply_id;
          const message = dbReply.rows[0].comment_info;
          const commentFrom = dbReply.rows[0].comment_creator_account_id;

          const fetchUserIdQuery = {
            name: 'fetch-reply-user-id',
            text: 'SELECT comment_creator_account_id, comment_info FROM comment WHERE comment_id = $1',
            values: [replyId]
          }
          const dbReplyUser = await db.query(fetchUserIdQuery)

          if (dbReplyUser.rowCount < 1) {
            res.json({
              success: false,
              message: 'this is not a reply'
            })
          } else {
            const accountId = dbReplyUser.rows[0].comment_creator_account_id;
            const replyQuery = {
              name: 'post-reply-notification',
              text: 'INSERT INTO notification(notification_to_user_id, notification_from_id,notification_poll_id, notification_message, notification_created_date, notification_comment) VALUES($1, $2, $3, $4, $5, $6)',
              values: [accountId, commentFrom, pollId, message, date, true]
            }
            const dbCommentNotification = await db.query(replyQuery)
            if (dbCommentNotification.rowCount < 1) {
              res.json({
                success: false,
                message: 'failed to send notification to database'
              })
            } else {
              res.json({
                success: true,
                message: 'notification posted to database'
              })
            }
          }
        }
      } catch (e) {
        throw e
      }
    }
  })

  //Fire this notification when a poll is closed
  //All who have voted in the poll will be notified
  //We have an array of account_id in polls table which we can loop through to send that the poll is closed
  router.post('/auth/post-poll-notification', async (req, res, next) => {
    const closedPoll = req.body

    if (!closedPoll.pollId) {
      res.json({
        success: false,
        message: 'poll id wasn\'t recieved'
      })
    } else {
      const getpollQuery = {
        name: 'get-poll-notification',
        text: 'SELECT poll_creator_id, poll_voters_ids, poll_title, poll_status FROM poll WHERE poll_id=$1',
        values: [closedPoll.pollId]
      }
      const dbGetPoll = await db.query(getpollQuery)
      if (dbGetPoll.rowCount < 1) {
        res.json({
          success: false,
          message: 'failed to get poll'
        })
      } else {
        const pollCreatorId = dbGetPoll.rows[0].poll_creator_id
        const pollVotersId = dbGetPoll.rows[0].poll_voters_ids
        const pollStatus = dbGetPoll.rows[0].poll_status
        const message = dbGetPoll.rows[0].poll_title;
        if (pollStatus) {
          const sendToUsers = func.sendNotificationToUsers(pollVotersId, pollCreatorId, closedPoll.pollId, message, closedPoll.date, false)
          const closedPollQuery = {
            name: 'post-closed-poll-notification',
            text: `INSERT INTO notification(notification_to_user_id, notification_from_id, notification_poll_id, notification_message, notification_created_date, notification_comment) VALUES ${sendToUsers}`,
            values: []
          }
          try {
            const dbClosedPollNotification = await db.query(closedPollQuery)
            if (dbClosedPollNotification.rowCount < 1) {
              res.json({
                success: false,
                message: 'failed to send notification to database'
              })
            } else {
              res.json({
                success: true,
                message: 'poll notification sent to database'
              })
            }
          } catch (e) {
            throw e
          }
        } else {
          res.json({
            success: false,
            message: 'the poll is still active'
          })
        }

      }
    }

  })

  router.get('/notifications/:user_id', async (req, res, next) => {

    const {
      user_id
    } = req.params

    if (typeof parseInt(user_id) !== 'number') {
      res.json({
        success: false,
        message: 'user not found'
      })
    }
    const query = {
      name: 'fetch-notification',
      text: 'SELECT notification_from_id, notification_message, notification_created_date, notification_read, notification_comment FROM notification WHERE notification_to_user_id=$1',
      values: [user_id]
    }
    try {
      await db.query(query, (error, result) => {
        if (error) {
          res.json({
            success: false,
            result: 'notification not found'
          })
        } else {
          res.json({
            success: true,
            result: result.rows
          })
        }
      })
    } catch (e) {
      throw e
    }
  })

  router.get('/get-notification-user/:user_id', async (req, res, next) => {
    const {
      user_id
    } = req.params
    if (typeof parseInt(user_id) !== 'number') {
      res.json({
        success: false,
        message: 'user not found'
      })
    } else {
      const userQuery = {
        name: 'fetch-user-notification',
        text: 'SELECT account_id, account_username, account_profile_image FROM account WHERE account_id = $1',
        values: [user_id]
      }
      try {
        await db.query(userQuery, (error, result) => {
          if (error) {
            res.json({
              success: false,
              message: 'error while fetching user'
            })
          } else {
            res.json({
              success: true,
              result: result.rows[0]
            })
          }
        })
      } catch (e) {
        throw e
      }
    }
  })
  return router
}