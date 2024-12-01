const fetch = require('node-fetch');
const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
let code;
let access_token;
let username;
// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Load sensitive information from environment variables
const clientId = process.env.ACCESS_KEY;
const clientSecret = process.env.SECRET_KEY;
const redirectUri = process.env.REDIRECT_URI;
let loggedIn = false;


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// Redirect user to Unsplash authorization page
app.get('/auth/login', (req, res) => {
    const authUrl = `https://unsplash.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=public+write_likes`;
    res.redirect(authUrl);
});

// Handle callback from Unsplash
app.get('/auth/callback', async (req, res) => {
  console.log("Handling callback ...");
  code = req.query.code;
  // Make a POST request to https://unsplash.com/oauth/token with the code
  try {
    const response = await axios.post('https://unsplash.com/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: code,
      grant_type: 'authorization_code'
    });
    access_token = response.data.access_token;
    username = response.data.username;
    console.log(`Access token: ${access_token}`);
    // redirect to homepage
    res.redirect('http://localhost:8443/');
    // Redirect user to the home page
    loggedIn = true;
  }
  catch (error) {
    console.error(error);
    res.send('An error occurred');

  }
}
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Check if user is authenticated
app.get('/api/check-auth', (req, res) => {
  console.log("Checking authentication ...");
  console.log("loggedIn:", loggedIn);
  res.json({ loggedIn: loggedIn });
});

// Handle favorites pictures
let favorites = [];
app.post('/api/favorite', (req, res) => {
  console.log("Fetching favorites ...");
  console.log("Request body:", req.body);
  const { photoId } = req.body;

  axios.post(`https://api.unsplash.com/photos/${photoId}/like`, {}, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Accept-Version': 'v1'
    },
  })
    .then(response => {
      console.log('Photo liked successfully');
    })
    .catch(error => {
      if (error.response) {
        console.error(`HTTP error: ${error.response.status}`);
        console.error('Error details:', error.response.data);
      } else {
        console.error('Network error:', error.message);
      }
    });
  });

  app.delete('/api/favorites/:photoId', async (req, res) => {
    const { photoId } = req.params;
    try {
      const response = await fetch(`https://api.unsplash.com/photos/${photoId}/like`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${access_token}`,
      // Usa tu access_token 
      'Content-Type': 'application/json', }, }); if (response.ok) { console.log(`Photo ${photoId} unliked successfully`);
      //Quita la foto de la galería
    }
    else
    {
      console.error(`Failed to unlike photo ${photoId}`); } } catch (error) { console.error('Error unliking photo:', error); }
    res.status(200).send(`Photo ID to delete: ${photoId}`);
  });

app.get('/api/favorites', async (req, res) => {
  try {
    await axios.get(`https://api.unsplash.com/users/${username}/likes`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,  // Aquí va el token de acceso en el encabezado
        'Accept-Version': 'v1'
      }
    })
      .then(response => {
        // Mostrar las fotos que el usuario ha dado "like"
        if (response.status === 200)
        {
          console.log('Fotos que el usuario ha dado like:');
          response.data.forEach(photo => {
          if (!favorites.includes(photo.id))
            favorites.push(photo.id);
        });
        }
        else
          console.error('Get request failed:', response.status);
      })
      .catch(error => {
        console.error('Error al obtener las fotos:', error);
      });
  }
  catch (error) {
    console.error('Error al obtener las fotos:', error);
  }
  console.log("Fetching favorites ...");
  res.json({ favorites });
});
