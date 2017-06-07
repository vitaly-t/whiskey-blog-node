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
