module.exports = (router, pool) => {
  const db = require('../db/database')
  const func = require('../functions')

  //Get all the polls
  router.get('/polls', async (req, res, next) => {
    const query = {
      name: 'fetch-polls',
      text: 'SELECT poll_id, poll_creator_id, poll_title, poll_fighter1, poll_fighter2, poll_image, poll_status, poll_votes_for_fighter1, poll_votes_for_fighter2, poll_votes_for_draw, poll_votes_for_canceled, poll_created_date FROM poll ORDER BY view DESC, poll_created_date ASC',
      values: []
    }

    try {
      await db.query(query, (error, result) => {
        if (error) {
          res.json({
            success: false,
            message: "Our server is down"
          })
        } else {
          res.json({
            success: true,
            result: result.rows
          })
        }
      })
    } catch (error) {
      throw error;
    }
  })

  //Ger a single poll
  router.get('/polls/:poll_id', async (req, res, next) => {
    const {
      poll_id
    } = req.params;

    if (typeof parseInt(poll_id) !== 'number') {
      res.json({
        success: false,
        message: 'poll not found'
      })
    }
    const pollQuery = {
      name: 'fetch-poll',
      text: 'SELECT poll_creator_id, poll_title, poll_created_date, poll_fighter1, poll_fighter2, poll_image, poll_status, poll_votes_for_fighter1, poll_votes_for_fighter2, poll_votes_for_draw, poll_votes_for_canceled FROM poll WHERE poll_id=$1',
      values: [poll_id]
    }

    try {
      const dbGetPoll = await db.query(pollQuery)
      if (dbGetPoll.rowCount < 1) {
        res.json({
          success: false,
          message: 'poll not found'
        })
      } else {
        const pollCreatorId = dbGetPoll.rows[0].poll_creator_id
        const getPollCreatorUsernameQuery = {
          name: 'fetch-poll-creator',
          text: 'SELECT account_username FROM account WHERE account_id=$1',
          values: [pollCreatorId]
        }
        const getPollCreatorUsername = await db.query(getPollCreatorUsernameQuery)

        if (getPollCreatorUsername.rowCount < 1) {
          res.json({
            success: false,
            message: 'user not found'
          })
        } else {
          res.json({
            success: true,
            result: {
              username: getPollCreatorUsername.rows[0].account_username,
              data: dbGetPoll.rows[0]
            } //This is what makes me happy
          });
        }
      }
    } catch (error) {
      throw error;
    }
  })


  //Post a Poll (latter it will use a middleware that is based on authentication)
  router.post('/auth/create-poll', async (req, res, next) => {
    const poll = req.body;

    if (!poll.title) {
      res.json({
        success: false,
        message: 'poll title is missing'
      })
    }
    if (!poll.fighter1) {
      res.json({
        success: false,
        message: 'fighter is missing'
      })
    }
    if (!poll.fighter2) {
      res.json({
        success: false,
        message: 'fighter is missing'
      })
    }
    if (!poll.creatorId) {
      res.json({
        success: false,
        message: 'Login to make polls'
      })
    } else {
      const date = new Date()
      const query = {
        name: 'post-poll',
        text: 'INSERT INTO poll(poll_creator_id, poll_title, poll_created_date, poll_fighter1, poll_fighter2, poll_image) VALUES($1,$2,$3,$4,$5,$6)',
        values: [poll.creatorId, poll.title, date, poll.fighter1, poll.fighter2, poll.image]
      }
      try {
        const dbPoll = await db.query(query);
        if (dbPoll.rowCount < 1) {
          res.json({
            success: false,
            message: 'poll failed to create'
          })
        } else {
          res.json({
            success: true,
            message: 'poll created'
          })
        }
      } catch (error) {
        throw error
      }
    }
  })

  // Vote on Polls when a selection is made (this is fired everytime a selection is made)
  router.put('/auth/polls/:poll_id/vote', async (req, res, next) => {
    const {
      poll_id
    } = req.params
    const vote = req.body
    if (typeof parseInt(poll_id) !== 'number') {
      res.json({
        success: false,
        message: 'poll not found'
      })
    }
    if (!vote.fighter1Num) {
      vote.fighter1Num = 0
    }
    if (!vote.fighter2Num) {
      vote.fighter2Num = 0
    }
    if (!vote.drawNum) {
      vote.drawNum = 0
    }
    if (!vote.cancelNum) {
      vote.cancelNum = 0
    }
    if (!vote.userId) {
      res.json({
        success: false,
        message: 'login to vote'
      })
    } else {
      const getQuery = {
        name: 'get-vote-query',
        text: 'SELECT poll_voters_ids FROM poll WHERE poll_id = $1',
        values: [poll_id]
      }
      const updateQuery = {
        name: 'update-vote-query',
        text: 'UPDATE poll SET poll_votes_for_fighter1 = $1, poll_votes_for_fighter2 = $2, poll_votes_for_draw=$3, poll_votes_for_canceled=$4, view=view+1 WHERE poll_id = $5',
        values: [vote.fighter1Num, vote.fighter2Num, vote.drawNum, vote.cancelNum, poll_id]
      }
      const updateVotersQuery = {
        name: 'update-voters-query',
        text: 'UPDATE poll SET poll_voters_ids=array_append(poll_voters_ids, $1) WHERE poll_id = $2',
        values: [vote.userId, poll_id]
      }

      try {
        const dbGetVotes = await db.query(getQuery)
        const dbUpdateVotes = await db.query(updateQuery)
        if (dbGetVotes.rowCount > 0) {
          const votersIds = dbGetVotes.rows[0].poll_voters_ids
          const voted = func.checkDuplicateUserId(vote.userId, votersIds);
          if (voted === false) {
            const dbUpdateVoters = await db.query(updateVotersQuery)
            if (dbUpdateVoters.rowCount < 1) {
              res.json({
                success: true,
                message: 'failed to update voter'
              })
            }
          }
        }
        if (dbUpdateVotes.rowCount > 0) {
          res.json({
            success: true,
            message: 'your vote is updated'
          })
        } else {
          res.json({
            success: false,
            message: 'failed to update vote'
          })
        }

      } catch (e) {
        throw e
      }
    }
  })

  router.put('/auth/polls/:poll_id/close-poll', async (req, res, next) => {
    const {
      poll_id
    } = req.params
    const closedPoll = req.body.status
    if (typeof parseInt(poll_id) !== 'number') {
      res.json({
        success: false,
        message: 'poll not found'
      })
    } else {
      if (closedPoll == null) {
        res.json({
          success: false,
          message: 'status was not found'
        })
      } else {
        const query = {
          name: 'update-status',
          text: 'UPDATE poll SET poll_status=$1 WHERE poll_id =$2',
          values: [closedPoll, poll_id]
        }
        try {
          const dbStatus = await db.query(query)
          if (dbStatus.rowCount < 1) {
            res.json({
              success: false,
              message: 'failed to update status'
            })
          } else {
            res.json({
              success: true,
              message: 'status updated'
            })
          }
        } catch (e) {
          throw e
        }
      }
    }
  })
  return router
}