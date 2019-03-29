module.exports = (router) => {
  const db = require('../db/database')
  const func = require('../functions')

  //Get the parent comments
  router.get('/parent-comments/:poll_id', async (req, res, next) => {
    const {
      poll_id
    } = req.params;

    if (typeof parseInt(poll_id) !== 'number') {
      res.json({
        success: false,
        message: 'poll not found'
      })
    }
    const parentQuery = {
      name: 'fetch-first-row-comments',
      text: 'SELECT comment_id, parent_comment_id, reply_id, comment_creator_account_id, comment_created_date, comment_info, comment_likes FROM comment WHERE poll_id = $1 AND parent_comment_id is null ORDER BY comment_likes DESC',
      values: [poll_id]
    }

    try {
      await db.query(parentQuery, (error, result) => {
        if (error) {
          res.json({
            success: false,
            result: 'comments not found'
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

  //Get a commenter using the comment id
  router.get('/all-comments/:user_id/commenter', async (req, res, next) => {
    const {
      user_id
    } = req.params

    const commentQuery = {
      name: 'fetch-comment-id',
      text: 'SELECT comment_creator_account_id FROM comment WHERE comment_id=$1',
      values: [user_id]
    }
    try {
      const dbComment = await db.query(commentQuery);
      if (dbComment.rowCount < 1) {
        res.json({
          success: false,
          message: 'failed to fetch comment'
        })
      } else {
        const commentCreaterId = dbComment.rows[0].comment_creator_account_id
        const commentCreaterQuery = {
          name: 'fetch-comment-creater',
          text: 'SELECT account_username, account_profile_image FROM account WHERE account_id=$1',
          values: [commentCreaterId]
        }
        const dbCommentCreater = await db.query(commentCreaterQuery)
        if (dbCommentCreater.rowCount < 1) {
          res.json({
            success: false,
            message: 'failed to fetch comment creater'
          })
        } else {
          res.json({
            success: true,
            result: dbCommentCreater.rows[0]
          })
        }

      }
    } catch (e) {
      throw e
    }
  })

  //replies which are inside the parent comment
  router.get('/replies/:parent_id/poll/:poll_id', async (req, res, next) => {
    const {
      parent_id,
      poll_id
    } = req.params;
    
    if (typeof parseInt(parent_id) !== 'number') {
      res.json({
        success: false,
        message: 'comments not found'
      })
    }
    if (typeof parseInt(poll_id) !== 'number') {
      res.json({
        success: false,
        message: 'poll not found'
      })
    }
    const replyQuery = {
      name: 'fetch-comments',
      text: 'SELECT comment_id, parent_comment_id, reply_id, comment_creator_account_id, comment_created_date, comment_info, comment_likes FROM comment WHERE poll_id = $1 AND parent_comment_id = $2 ORDER BY comment_created_date ASC, comment_likes DESC',
      values: [poll_id, parent_id]
    }
    try {
      await db.query(replyQuery, (error, result) => {
        if (error) {
          res.json({
            success: false,
            result: 'comments not found'
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

  //Note that you must get the reply and parent id when pressed on reply.

  //Check if the comment you're replying has a parent id first, if not it...
  //means it is a parent-comment itself so get its parent id.

  //On the other hand, the reply id is the id of the comment you're replying to.
  router.post('/auth/post-reply', async (req, res, next) => {
    const reply = req.body.reply; //the info
    const replyCreaterId = req.body.userId; //userId
    const date = func.getDate(); //date
    const parentCommentId = req.body.parentCommentId; //the parentCommentId of the  the comment you pressed reply button on or if null, the comment id of it
    const replyToId = req.body.replyToId; //this is the comment id of the comment you pressed reply button on

    if (!reply) {
      res.json({
        success: false,
        message: 'enter a comment'
      })
    }
    if (!replyCreaterId) {
      res.json({
        success: false,
        message: 'login to comment'
      })
    } else {
      const query = {
        name: 'post-reply',
        text: 'INSERT INTO comment (reply_id, parent_comment_id, comment_creator_account_id, comment_created_date, comment_info) VALUES($1, $2, $3, $4, $5)',
        values: [replyToId, parentCommentId, replyCreaterId, date, reply]
      }
      try {
        const dbreply = await db.query(query)
        if (dbreply.rowCount < 1) {
          res.json({
            success: false,
            message: 'comment failed'
          })
        } else {
          res.json({
            success: true,
            message: 'comment saved'
          })
        }
      } catch (e) {
        throw e
      }
    }
  })
  router.post('/auth/post-parent-comment', async (req, res, next) => {
    const parentComment = req.body.comment;
    const commentCreaterId = req.body.userId;
    const date = func.getDate();

    if (!parentComment) {
      res.json({
        success: false,
        message: 'enter a comment'
      })
    }
    if (!commentCreaterId) {
      res.json({
        success: false,
        message: 'login to comment'
      })
    } else {
      const query = {
        name: 'post-parent-comment',
        text: 'INSERT INTO comment (comment_creator_account_id, comment_created_date, comment_info) VALUES($1, $2, $3)',
        values: [commentCreaterId, date, parentComment]
      }
      try {
        const dbParentComment = await db.query(query)
        if (dbParentComment.rowCount < 1) {
          res.json({
            success: false,
            message: 'comment failed'
          })
        } else {
          res.json({
            success: true,
            message: 'comment saved'
          })
        }
      } catch (e) {
        throw e
      }
    }
  })

  router.put('/auth/all-comments/:comment_id/like', async (req, res, next) => {
    const {
      comment_id
    } = req.params
    const like = req.body.like
    if (typeof parseInt(comment_id) !== 'number') {
      res.json({
        success: false,
        message: 'comment not found'
      })
    }
    console.log(!like);
    if (!like) {
      res.json({
        success: false,
        message: 'like failed'
      })
    } else {
      const query = {
        name: 'update-like',
        text: 'UPDATE comment SET comment_likes=$1 WHERE comment_id =$2',
        values: [like, comment_id]
      }
      try {
        const dbLike = await db.query(query)
        if (dbLike.rowCount < 1) {
          res.json({
            success: false,
            message: 'failed to like comment'
          })
        } else {
          res.json({
            success: true,
            message: 'comment liked'
          })
        }
      } catch (e) {
        throw e
      }
    }
  })

  return router
}