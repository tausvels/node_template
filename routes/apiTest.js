const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

module.exports = () => {
  const apiUrl = `https://api-prod.linkin.bio/api/pub/linkinbio_posts?instagram_profile_id=32192`;
  router.get('/', (req, res) => {
    res.send('Welcome to API TESTING page.')
  });

  router.get('/test', (req, res) => {
    fetch(apiUrl)
    .then(response => {
      return response.json();
    })
    .then(data => {
      const output = data.linkinbio_posts[0];
      res.send(output.caption)
    })
    .catch(e => console.error(e))
  })

  return router;
}