const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3030;
const cors = require('cors');

app.use(cors());

// Use bodyParser middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));



let access_token = 'token';

let artist_id_server = "";

// app.use(express.json()); // This line is needed to parse JSON body
app.use(express.static(path.join(__dirname)));

// gets a new api token
app.get('/get_api_token', (req, res) => {
    var client_id = process.env.ENV_CLIENT_ID;
    var client_secret = process.env.ENV_CLIENT_SECRET;

    fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
    },
    body: new URLSearchParams({
        'grant_type': 'client_credentials'
    })})
    .then(response => response.json())
    .then(data => {
        res.json(data);
    })
})

// test the api token and if not valid get a new one
app.get('/test_api_token', (req, res) => {
  let headers = {
    'Authorization': 'Bearer ' + access_token
  };
  fetch(`https://api.spotify.com/v1/search?q=rihanna&type=artist`, { headers: headers })
      .then(response => {
          if (response.status === 401) {
              // Return the promise chain to continue handling asynchronous calls
              return fetch('https://spotify-webapp-backend.onrender.com/get_api_token')
                  .then(response => response.json())
                  .then(data => {
                      access_token = data.access_token;
                      console.log(access_token);
                  });
          } else {
              return Promise.resolve();
          }
      })
      .then(() => {
          res.end();
      })
      .catch(error => {
          console.error("Error occurred:", error);
          res.status(500).send("Internal Server Error");
      });
});

app.post('/get_artist_search', (req, res) => {
  let headers = {
    'Authorization': 'Bearer ' + access_token
  };
  fetch(`https://api.spotify.com/v1/search?q=${req.body.search}&type=artist`, { headers: headers })
      .then(response => response.json())
      .then(data => {
        artist_id_server = data.artists.items[0].id;
        res.json(data);
      })
      .catch(error => {
          console.error("Error occurred:", error);
          res.status(500).send("Internal Server Error");
      });
});

app.get('/get_artist_info', (req, res) => {
  let headers = {
    'Authorization': 'Bearer ' + access_token
  };
  fetch(`https://api.spotify.com/v1/artists/${artist_id_server}`, { headers: headers })
      .then(response => response.json())
      .then(data => {
          res.json(data);
      })
      .catch(error => {
          console.error("Error occurred:", error);
          res.status(500).send("Internal Server Error"); 
      });
});

app.get('/get_artist_top_tracks', (req, res) => {
  let headers = {
    'Authorization': 'Bearer ' + access_token
  };
  console.log("got to 'get artist top tracks'")
  fetch(`https://api.spotify.com/v1/artists/${artist_id_server}/top-tracks`, { headers: headers })
      .then(response => response.json())
      .then(data => {
        res.json(data);
      })
      .catch(error => {
          console.error("Error occurred:", error);
          res.status(500).send("Internal Server Error");
      });
});

app.get('/get_artist_album', (req, res) => {
  let headers = {
    'Authorization': 'Bearer ' + access_token
  };
  fetch(`https://api.spotify.com/v1/artists/${artist_id_server}/albums?album_type=album`, { headers: headers })
      .then(response => response.json())
      .then(data => {
          res.json(data);
      })
      .catch(error => {
          console.error("Error occurred:", error);
          res.status(500).send("Internal Server Error");
      });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
