require("dotenv").config();

const fs = require("fs");
const express = require("express");
const app = express();
const cors = require("cors"); // cors
const jwt = require("jsonwebtoken");
const axios = require("axios");

// get users database
const { users, refreshTokens } = JSON.parse(
  fs.readFileSync("./users.json", "UTF-8")
);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(cors());

const SECRET_KEY_TOKEN = process.env.SECRET_KEY_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const expiresIn = "30s";

// Create an access token from a payload
function createAccessToken(payload) {
  return jwt.sign(payload, SECRET_KEY_TOKEN, { expiresIn });
}

// Create a refresh token from a payload
function createRefreshToken(payload) {
  return addRefreshTokenToDb(jwt.sign(payload, REFRESH_TOKEN));
}

// Verify the token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Auth Header:", authHeader);
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.SECRET_KEY_TOKEN, (err, user) => {
    if (err && err.name === "TokenExpiredError") {
      return res.json({ status: 401, err: err.name });
    }

    if (err) {
      return res.status(403).json(err);
    }

    req.user = users.find((item) => item.username === user.username);
    next();
  });
}

// Check if the user exists in database
function isAuthenticated({ username, password }) {
  return (
    users.findIndex(
      (user) => user.username === username && user.password === password
    ) !== -1
  );
}

// Add refresh token
function addRefreshTokenToDb(refreshToken) {
  // if refreshToken not exist add one
  if (!refreshTokens.includes(refreshToken)) {
    fs.readFile("./users.json", (err, data) => {
      if (err) {
        const status = 401;
        const message = err;
        res.status(status).json({ status, message });
        return;
      }

      // Get current users data
      data = JSON.parse(data.toString());

      // Add new refresh token
      data.refreshTokens.push(refreshToken);

      fs.writeFile("users.json", JSON.stringify(data), (err, result) => {
        // WRITE
        if (err) {
          const status = 401;
          const message = err;
          return res.status(status).json({ status, message });
        }

        console.log(result);
      });
    });
  }

  return refreshToken;
}

// Register New User
app.post("/auth/register", (req, res) => {
  console.log("register endpoint called; request body:");
  console.log(req.body);

  const { username, password, oauth2 } = req.body;
  let isExistOAuth2 = false;

  if (isAuthenticated({ username, password })) {
    const status = 401;
    const message = "Username and Password already exist";

    if (!oauth2) {
      res.status(status).json({ status, message });
      return;
    } else {
      isExistOAuth2 = true;
    }
  }

  if (!isExistOAuth2) {
    fs.readFile("./users.json", (err, data) => {
      if (err) {
        const status = 401;
        const message = err;
        res.status(status).json({ status, message });
        return;
      }

      // Get current users data
      data = JSON.parse(data.toString());

      // Get the id of last user
      const lastId = data.users[data.users.length - 1].id;

      //Add new user
      data.users.push({
        id: lastId + 1,
        username: username,
        password: password,
        isVip: false,
      }); //add some data

      fs.writeFile("./users.json", JSON.stringify(data), (err, result) => {
        // WRITE
        if (err) {
          const status = 401;
          const message = err;
          res.status(status).json({ status, message });
          return;
        }

        // Create token for new user
        const accessToken = createAccessToken({ username, password });
        const refreshToken = createRefreshToken({ username, password });
        console.log("Access Token: " + accessToken);
        console.log("Refresh Token: " + refreshToken);
        res.status(200).json({ accessToken, refreshToken });
      });
    });
  }
});

// Login to one of the users from ./users.json
app.post("/auth/login", (req, res) => {
  console.log("login endpoint called; request body:");
  console.log(req.body);

  const { username, password } = req.body;
  if (isAuthenticated({ username, password }) === false) {
    const status = 401;
    const message = "Incorrect username or password";
    res.status(status).json({ status, message });
    return;
  }

  const accessToken = createAccessToken({ username, password });
  const refreshToken = createRefreshToken({ username, password });
  console.log("Access Token: " + accessToken);
  console.log("Refresh Token: " + refreshToken);
  res.status(200).json({ accessToken, refreshToken });
});

// refresh Token
app.post("/auth/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken == null) return res.sendStatus(401);

  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN,
    (err, { username, password }) => {
      if (err) return res.sendStatus(403);
      const accessToken = createAccessToken({ username, password });
      res.json({ accessToken: accessToken });
    }
  );
});

// delete refresh token
app.delete("/auth/logout", (req, res) => {
  fs.readFile("./users.json", (err, data) => {
    if (err) {
      const status = 401;
      const message = err;
      res.status(status).json({ status, message });
      return;
    }

    // Get current users data
    data = JSON.parse(data.toString());

    // Delete refreshToken
    data.refreshTokens = data.refreshTokens.filter(
      (refreshToken) => refreshToken !== req.body.refreshToken
    );

    // Save data
    fs.writeFile("./users.json", JSON.stringify(data), (err, result) => {
      // WRITE
      if (err) {
        const status = 401;
        const message = err;
        res.status(status).json({ status, message });
        return;
      }
    });
  });
  res.sendStatus(204);
});

// test token
app.get("/users", verifyToken, (req, res) => {
  res.status(200).json(users);
});

app.post("/superlike", verifyToken, async (req, res) => {
  try {
    const API_URL = "https://5f892e6d18c33c0016b30683.mockapi.io/";
    if (req.user && !req.user.isVip) return res.sendStatus(403);
    const cat = await axios.post(API_URL + "superlikes", req.body.cat);
    res.status(200).json(cat.data);
  } catch (err) {
    console.log(err);
  }
});

app.listen(8080, () => console.log("Run Auth API Server"));
