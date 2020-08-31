const passport = require('passport');
const bcrypt = require('bcrypt');


module.exports = function (app, client) {
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    };

    app.route("/").get((req, res) => {
        //Change the response to render the Pug template
        res.render('pug/index',
            {
                title: 'Hello',
                message: 'Please login',
                showLogin: true,
                showRegistration: true
            });
    });

    app.route('/login').post(
        passport.authenticate('local', { failureRedirect: '/' }),
        (req, res) => {
            res.redirect('/profile');
        });

    app.route('/profile').get(ensureAuthenticated, (req, res) => {
        res.render('pug/profile', { username: req.user.username });
    })

    app.route('/register').post(
        (req, res, next) => {
            client.db().collection('users').findOne({ username: req.body.username }, (err, user) => {
                if (err) {
                    next(err);
                } else if (user) {
                    res.redirect('/');
                } else {
                    const hash = bcrypt.hashSync(req.body.password, 12);
                    client.db().collection('users').insertOne({
                        username: req.body.username,
                        password: hash
                    },
                        (err, data) => {
                            if (err) {
                                res.redirect('/');
                            } else {
                                next(null, user)
                            }
                        })
                }
            })
        },
        passport.authenticate('local', { failureRedirect: '/' }),
        (req, res, next) => {
            res.redirect('/profile');
        }
    )

    app.route('/logout')
        .get((req, res) => {
            req.logout();
            res.redirect('/')
        })

    app.use((req, res, next) => {
        res.status(404)
            .type('text')
            .send('Not Found')
    })
}