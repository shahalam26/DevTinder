const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user');

const oauthRouter = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Generate generic JWT and set cookie
const loginUser = (res, user) => {
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });
};

// --- GITHUB OAUTH ---
oauthRouter.get('/auth/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return res.status(500).send("GitHub Auth is not configured");
  
  const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
  const redirectUri = `${BACKEND_URL}/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  res.redirect(url);
});

oauthRouter.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { data } = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: { Accept: 'application/json' }
    });

    const accessToken = data.access_token;
    if (!accessToken) return res.redirect(`${FRONTEND_URL}/login?error=true`);

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    let email = userRes.data.email;

    if (!email) {
      const emailRes = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const primaryEmail = emailRes.data.find(e => e.primary);
      email = primaryEmail ? primaryEmail.email : emailRes.data[0].email;
    }

    let user = await User.findOne({ emailId: email.toLowerCase() });
    
    if (!user) {
        const nameParts = (userRes.data.name || userRes.data.login).split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || "GitHubUser";
        
        const randomPassword = crypto.randomBytes(16).toString("hex") + "!Aa1";

        user = new User({
          firstName,
          lastName,
          emailId: email.toLowerCase(),
          password: randomPassword, 
          photourl: userRes.data.avatar_url || ""
        });
        await user.save();
    }

    loginUser(res, user);
    res.redirect(`${FRONTEND_URL}/feed`);
  } catch (error) {
    console.error("GitHub Auth Error:", error.message);
    res.redirect(`${FRONTEND_URL}/login?error=github`);
  }
});

// --- GOOGLE OAUTH ---
oauthRouter.get('/auth/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.redirect(`${FRONTEND_URL}/login?error=not_configured`);
  
  const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
  const redirectUri = `${BACKEND_URL}/auth/google/callback`;
  const scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;
  res.redirect(url);
});

oauthRouter.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
  const redirectUri = `${BACKEND_URL}/auth/google/callback`;

  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${data.access_token}` }
    });

    const { email, given_name, family_name, picture } = userInfo.data;

    let user = await User.findOne({ emailId: email.toLowerCase() });
    
    if (!user) {
        const randomPassword = crypto.randomBytes(16).toString("hex") + "!Aa1";
        user = new User({
          firstName: given_name || "GoogleUser",
          lastName: family_name || "User",
          emailId: email.toLowerCase(),
          password: randomPassword, 
          photourl: picture || ""
        });
        await user.save();
    }

    loginUser(res, user);
    res.redirect(`${FRONTEND_URL}/feed`);
  } catch (error) {
    console.error("Google Auth Error:", error.message);
    res.redirect(`${FRONTEND_URL}/login?error=google`);
  }
});

module.exports = oauthRouter;
