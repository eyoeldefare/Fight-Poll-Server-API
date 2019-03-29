module.exports = (router) => {
  const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken')
  const db = require('../db/database')
  const secrets = require('../secret')
  const func = require('../functions')
  const saltRounds = 10;

  //Register a user Keyboard Shortcut
  router.post('/register', async (req, res, next) => {
    const signupPost = req.body;
    const hashPassword = await bcrypt.hash(signupPost.password, saltRounds);
    const date = new Date()
    if (!signupPost.name) {
      res.json({
        success: false,
        message: 'Enter a name'
      })
    }
    if (!signupPost.email) {
      res.json({
        success: false,
        message: 'Enter an email'
      })
    }
    if (!signupPost.username) {
      res.json({
        success: false,
        message: 'Enter a username'
      })
    }
    if (!signupPost.password) {
      res.json({
        success: false,
        message: 'Enter a password'
      })
    } else {
      const emailQuery = {
        name: 'check-email',
        text: 'SELECT account_email FROM account WHERE account_email = $1',
        values: [signupPost.email]
      }
      const usernameQuery = {
        name: 'check-password',
        text: 'SELECT account_username FROM account WHERE account_username = $1',
        values: [signupPost.username]
      }

      const userQuery = {
        name: 'post-user',
        text: 'INSERT INTO account(account_name, account_email, account_username, account_password, account_created_date) VALUES($1,$2,$3,$4,$5)',
        values: [signupPost.name, signupPost.email, signupPost.username, hashPassword, date]
      }

      try {
        const email = await db.query(emailQuery);
        const username = await db.query(usernameQuery);
        if (email.rowCount > 0) {
          res.json({
            success: false,
            message: 'email is registered'
          });
        }
        if (username.rowCount > 0) {
          res.json({
            success: false,
            message: 'username is taken'
          });
        } else {
          try {
            const user = await db.query(userQuery);
            if (user.rowCount > 0) {
              res.json({
                success: true,
                message: 'You\'re registered'
              })
            }
          } catch (e) {
            throw e
          }
        }
      } catch (error) {
        throw error
      }
    }
  })

  //Change password whn the chnage password is pressed
  router.put('/auth/change-password', async (req, res, next) => {
    const user = req.body

    if (!user.currentPassword) {
      res.json({
        success: false,
        message: 'enter ur current password'
      })
    }
    if (!user.newPassword) {
      res.json({
        success: false,
        message: 'enter ur new password'
      })
    }
    if (!user.userId) {
      res.json({
        success: false,
        message: 'user not found'
      })
    } else {
      const queryCurrentPassword = {
        name: 'fetch-password',
        text: 'SELECT account_password FROM account WHERE account_id=$1',
        values: [user.userId]
      }
      try {
        const dbCurrentPassword = await db.query(queryCurrentPassword)
        const comparedPassword = bcrypt.compareSync(user.currentPassword, dbCurrentPassword.rows[0].account_password);
        if (!comparedPassword) {
          res.json({
            success: false,
            message: 'wrong password'
          })
        } else {
          //Password is correct so update the password
          const hashPassword = await bcrypt.hash(user.newPassword, saltRounds);

          const queryUpdateNewPassword = {
            name: 'update-new-password',
            text: 'UPDATE account SET account_password=$1 WHERE account_id = $2',
            values: [hashPassword, user.userId]
          }
          const dbUpdateNewPassword = await db.query(queryUpdateNewPassword)
          if (dbUpdateNewPassword.rowCount > 0) {
            res.json({
              success: true,
              message: 'password changed'
            })
          } else {
            res.json({
              success: false,
              message: 'failed to change password'
            })
          }

        };
      } catch (error) {
        throw error
      }
    }
  })

  //Login
  router.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username) {
      res.json({
        success: false,
        message: 'enter a username'
      })
    }
    if (!password) {
      res.json({
        success: false,
        message: 'enter a password'
      })
    } else {
      const usernameQuery = {
        name: 'username-query',
        text: 'SELECT account_id, account_password FROM account WHERE account_username=$1',
        values: [username]
      }

      try {
        const dbUser = await db.query(usernameQuery);

        if (dbUser.rowCount < 1) {
          res.json({
            success: false,
            message: 'username not registered'
          })
        } else {
          //user found
          const comparedPassword = bcrypt.compareSync(password, dbUser.rows[0].account_password);
          if (!comparedPassword) {
            res.json({
              success: false,
              message: 'wrong password'
            })
          } else {
            const token = jwt.sign({
              userId: dbUser.rows[0].account_id
            }, secrets.secret, {
              expiresIn: '50 days'
            })
            res.json({
              success: true,
              message: 'signed in',
              token: token,
              userId: dbUser.rows[0].account_id
            })
          };
        }
      } catch (error) {
        throw error;
      }
    }
  })



  //The auth middleware for authentication
  router.use('/auth', async (req, res, next) => {
    const token = await req.headers['token']
    const deviceId = await req.headers['device-id']
    if (!token) {
      res.json({
        success: false,
        message: 'login to complete this action'
      })
    } else {
      try {
        jwt.verify(token, secrets.secret, (err, decoded) => {
          if (err) {
            res.json({
              success: false,
              message: 'please login'
            })
          } else {
            req.decoded = decoded;
            next();
          }
        })
      } catch (e) {
        throw e
      }
    }
  })

  //Get users by Id
  router.get('/users/:user_id/view-profile', async (req, res, next) => {
    const {
      user_id
    } = req.params;
    if (typeof parseInt(user_id) !== 'number') {
      res.json({
        success: false,
        message: 'user not found'
      })
    }
    const query = {
      name: 'fetch-user',
      text: 'SELECT account_id, account_name, account_username, account_created_date, account_profile_info, account_profile_image FROM account WHERE account_id = $1',
      values: [user_id]
    }

    try {
      await db.query(query, (error, result) => {
        if (error) {
          res.json({
            success: false,
            result: 'user not found'
          })

        } else {
          res.json({
            success: true,
            result: result.rows[0]
          })
        }
      })
    } catch (error) {
      throw error;
    }
  })

  //Update the profile
  router.put('/auth/users/:user_id/edit-profile', async (req, res, next) => {
    const {
      user_id
    } = req.params
    const profile = await req.body
    if (typeof parseInt(user_id) !== 'number') {
      res.json({
        success: false,
        message: 'user not found'
      })
    }
    if (!profile.username) {
      res.json({
        success: false,
        message: 'enter a username'
      })
    }
    if (!profile.email) {
      res.json({
        success: false,
        message: 'enter an email'
      })
    } else {
      const emailQuery = {
        name: 'check-email',
        text: 'SELECT account_email FROM account WHERE account_email = $1',
        values: [signupPost.email]
      }
      const usernameQuery = {
        name: 'check-password',
        text: 'SELECT account_username FROM account WHERE account_username = $1',
        values: [signupPost.username]
      }
      const profileQuery = {
        name: 'update-profile',
        text: 'UPDATE account SET account_name=$1, account_username=$2, account_email=$3, account_profile_info=$4, account_profile_image=$5 WHERE account_id = $6',
        values: [profile.name, profile.username, profile.email, profile.info, profile.image, user_id]
      }
      try {
        const username = await db.query(usernameQuery)
        const email = await db.query(emailQuery)
        if (username.rowCount > 0) {
          res.json({
            success: false,
            message: 'username is taken'
          })
        }
        if (email.rowCount > 0) {
          res.json({
            success: false,
            message: 'email is registered'
          })
        } else {
          const dbProfile = await db.query(profileQuery)

          if (dbProfile.rowCount > 0) {
            res.json({
              success: true,
              message: 'Profile is saved'
            })
          } else {
            res.json({
              success: false,
              message: 'Failed to save profile'
            })
          }
        }
      } catch (e) {
        throw e
      }
    }
  })

  return router
}