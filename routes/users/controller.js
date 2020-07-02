const router = require('express').Router();

module.exports = service => {
  router.get('/', async (req, res) => {
    try {
      const result = await service.getAllUsers();
      res.send(result.rows)
    } catch (err) {
      console.error(err)
    }
  });

  router.get('/login', (req, res) => {
    res.render('login.ejs')
  })

  return router;
}