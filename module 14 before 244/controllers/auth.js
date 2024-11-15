exports.getLogin = (req, res, next) => {
        // const isLoggedIn= (req.get('Cookie').trim().split('=')[1]) === 'true';
        // console.log(isLoggedIn)
        console.log(req.session.isLoggedIn)
        res.render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          isAuthenticated: false
        });
  };

  exports.postLogin = (req, res, next) => {
    req.session.isLoggedIn= true;
    // session object is provided automatically by the session middleware. 
    // we can add any key to this object.
    res.redirect('/');
};