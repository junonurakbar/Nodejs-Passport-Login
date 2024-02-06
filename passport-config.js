const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const pool = require('./database')

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        const user = (await pool.query(`SELECT * FROM users WHERE email = $1`, [email])).rows[0]
        // console.log(user)
        
        try {                                // user's password in DB
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            }
            else {
                return done(null, false, {message: "password incorrect"})
            }
        } 
        catch (err) {
            return done(err)
            // console.error(err)
        }
    }

    passport.use(new localStrategy(({ usernameField: 'email' }), authenticateUser))
    // Stores user details inside session. serializeUser determines which data of the user
    // object should be stored in the session. The result of the serializeUser method is attached
    // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
    //   the user id as the key) req.session.passport.user = {user_id: 'xyz'}
    passport.serializeUser((user, done) => done(null, user.user_id))

    // In deserializeUser that key is matched with the in memory array / database or any data resource.
    // The fetched object is attached to the request object as req.user
    passport.deserializeUser(async (id, done) => {
        const result = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [id])
        return done(null, result.rows[0])
    })
}

module.exports = initialize