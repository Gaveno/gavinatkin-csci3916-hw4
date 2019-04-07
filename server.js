var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');
var jwt = require('jsonwebtoken');

var app = express();
module.exports = app; // for testing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    )
    .all(function (req, res) {
        console.log(req.body);
        res.status(403).send({ success: false, message: "Operation not supported. Only POST allowed." });
    });

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        console.log(JSON.stringify(req.params));
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);

            // return that user
            res.json(user);
        });
    })
    .all(function (req, res) {
        console.log(req.body);
        res.status(403).send({ success: false, message: "Operation not supported. Only GET allowed." });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    })
    .all(function (req, res) {
        console.log(req.body);
        res.status(403).send({ success: false, message: "Operation not supported. Only GET allowed." });
    });

router.route('/signup')
    .post(function(req, res) {
        if (!req.body.username || !req.body.password) {
            res.json({success: false, message: 'Please pass username and password.'});
        }
        else {
            var user = new User();
            user.name = req.body.name;
            user.username = req.body.username;
            user.password = req.body.password;
            // save the user
            user.save(function(err) {
                if (err) {
                    // duplicate entry
                    if (err.code == 11000)
                        return res.json({ success: false, message: 'A user with that username already exists. '});
                    else
                        return res.send(err);
                }

                res.json({ success: true, message: 'User created!' });
            });
        }
    })
    .all(function (req, res) {
        console.log(req.body);
        res.status(403).send({ success: false, message: "Operation not supported. Only POST allowed." });
    });

router.route('/signin')
    .post(function(req, res) {
        var userNew = new User();
        userNew.name = req.body.name;
        userNew.username = req.body.username;
        userNew.password = req.body.password;

        User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
            if (err) res.send(err);
            if (user) {
                user.comparePassword(userNew.password, function (isMatch) {
                    if (isMatch) {
                        var userToken = {id: user._id, username: user.username};
                        var token = jwt.sign(userToken, process.env.SECRET_KEY);
                        res.json({success: true, token: 'JWT ' + token});
                    } else {
                        res.status(401).send({success: false, message: 'Authentication failed.'});
                    }
                });
            }
            else {
                return res.status(403).send({ success: false, message: "User not found." });
            }
        });
    })
    .all(function (req, res) {
        console.log(req.body);
        res.status(403).send({ success: false, message: "Operation not supported. Only POST allowed." });
    });

router.route('/movies')
    /* Post Movies
     *
     */
    .post(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.title || !req.body.year || !req.body.genre || !req.body.actors ||
            !req.body.actors[0].actorname || !req.body.actors[1].actorname || !req.body.actors[2].actorname ||
            !req.body.actors[0].charactername || !req.body.actors[1].charactername || !req.body.actors[2].charactername) {
            res.status(403).json({success: false, message: 'Invalid movie format.'});
        }
        else {
            var movie = new Movie();
            movie.title = req.body.title;
            movie.year = req.body.year;
            movie.genre = req.body.genre;
            movie.actors = req.body.actors;
            movie.save(function(err) {
                if (err) {
                    if (err.code === 11000) {
                        return res.status(403).json({
                            success: false, message: 'A movie with that title already exists. '
                        });
                    }
                    else {
                        return res.status(403).send(err);
                    }
                }
                res.status(200).send({ success: true, message: "added movie" });
            });
        }
    })
    /* Get Movies
     *
     */
    .get(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body) {
            res.status(403).json({ success: false, message: "Empty query." });
        }
        else {
            if (req.query && req.query.reviews && req.query.reviews === "true") {
                //console.log("query reviews: true");
                Movie.aggregate()
                .match(req.body)
                .lookup({from: 'reviews', localField: '_id', foreignField: 'movie_id', as: 'reviews'})
                .exec(function (err, movie) {
                    if (err) return res.send(err);
                    if (movie && movie.length > 0) {
                        //console.log(JSON.stringify(movie));
                        return res.status(200).json({
                            success: true,
                            result: movie
                        });
                    }
                    else {
                        return res.status(403).json({
                            success: false,
                            message: "Movie not found."
                        });
                    }
                });
            }
            else {
                Movie.find(req.body).select("title year genre actors").exec(function(err, movie) {
                    if (err) res.send(err);
                    if (movie && movie.length > 0) {
                        // check for review parameter
                        //console.log("query reviews: false");
                        return res.status(200).json({
                            success: true,
                            result: movie
                        });
                    }
                    else {
                        return res.status(404).json({
                            success: false, message: "Movie not found."
                        });
                    }
                });
            }
        }
    })
    /* Put Movies
     *
     */
    .put(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body || !req.body.findby || !req.body.updateto) {
            res.status(403).json({ success: false, message: "Empty body."});
        }
        else {
            console.log("findby: " + JSON.stringify(req.body.findby));
            console.log("updateto: " + JSON.stringify(req.body.updateto));
            Movie.updateMany(req.body.findby, req.body.updateto, function (err, doc) {
                console.log(JSON.stringify(doc));
                if (err) res.status(403).json({ success: false, message: "Failed to update movie." });
                else if (doc.n === 0)
                    res.status(403).json({ success: false, message: "Did not find movies to update." });
                else if (doc.nModified === 0) {
                    res.status(403).json({ success: false, message: "Nothing changed."});
                }
                else {
                    return res.status(200).send({success: true, message: "Successfully updated movie."});
                }
            })
        }
    })
    /* Delete Movies
     *
     */
    .delete(authJwtController.isAuthenticated, function(req, res) {
        if (!req.body) {
            res.status(403).json({ success: false, message: "Empty body."});
        }
        else {
            Movie.deleteOne(req.body, function(err, doc) {
                console.log(JSON.stringify(doc));
                if (err) res.status(403).json({ success: false, message: "Failed to delete." });
                else if (doc.n === 0) res.status(403).json({ success: false, message: "Did not find records to delete." });
                else res.status(200).json({ success: true, message: "Successfully deleted.", numberDeleted: doc.n });
            })
        }
    })
    .all(function (req, res) {
        console.log(req.body);
        res.status(403).send({ success: false, message: "Operation not supported. Only POST, PUT, GET, and DELETE allowed." });
    });

router.route('/reviews')
    .post(authJwtController.isAuthenticated, function(req, res) {
        if (!req.body) return res.status(403).json({ success: false, message: "Empty body."});
        if (!req.body.movie) return res.status(403).json({ success: false, message: "Movie not specified."});
        if (req.body.movie == 0) return res.status(403).json({
            success: false, message: "Invalid movie id. First find a movie with a GET movies request."
        });
        if (!req.body.quote) return res.status(403).json({ success: false, message: "Must provide quote."});
        if (!req.body.rating) return res.status(403).json({ success: false, message: "Must provide rating 1-5 stars."});

        Movie.findById(req.body.movie, function(err, movie) {
            if (err) return res.status(403).json(err);
            if (!movie || movie.length <= 0) return res.status(403).json({ success: false, message: "Non-existent movie." });
            //console.log(JSON.stringify(movie));
            var review = new Review();
            review.quote = req.body.quote;
            review.rating = req.body.rating;
            review.movie_id = movie._id;
            //console.log(req.headers.authorization.substring(4));
            jwt.verify(req.headers.authorization.substring(4), process.env.SECRET_KEY, function(err, dec) {
                if (err) return res.status(403).json(err);
                review.user_id = dec.id;
                review.save(function(err) {
                    if (err) {
                        if (err.code === 11000) {
                            return res.status(403).json({
                                success: false, message: 'You have already posted a review.'
                            });
                        }
                        else {
                            return res.status(403).send(err);
                        }
                    }
                    res.status(200).send({ success: true, message: "Added review." });
                });
            });
        });
    })
    .all(function (req, res) {
        console.log(req.body);
        res.status(403).json({
            success: false,
            message: "Invalid operation. Only POST requests are allowed on reviews."
        })
    });

router.route('/')
    .all(function (req, res) {
        console.log(req.body);
        res.status(404).send({ success: false, message: "Invalid path."});
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
