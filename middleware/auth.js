const User = require('../models/user/user');

/*
 *  requireGuest: requires no active session to view this page
 */

exports.requireGuest = function (req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/admin');
  } else {
    return next();
  }
}


/*
 * requireSession: require any active session to view this page
 */

exports.requireSession = function (req, res, next) {
  if (!req.session || !req.session.userId) {
    let err = new Error('Not authorized to view this page');
    err.status = 401;
    return next(err);
  } else {
    return next();
  }
};


/*
 * getCurrentUser: gets the currently logged-in user
 *
 * adds logged-in user (if applicable) to res.locals as currentUser
 */

exports.getCurrentUser = function (req, res, next) {
  if (req.session && req.session.userId) {
    User.get(req.session.userId)
      .then(user => {
        if (user) {
          res.locals.currentUser = user;
          next();
        }
      })
      .catch(next);
  } else {
    return next();
  }
};
