const adminSessionMiddleware = (req, res, next) => {
    if (req.session.adminData) {
      next();
    } else {
      res.redirect("/admin/");
    }
  };
  module.exports = adminSessionMiddleware;
  