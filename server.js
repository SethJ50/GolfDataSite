const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const crypto = require('crypto');
const port = 80;
const app = express()
app.use(express.json());
app.use(cookieParser());

app.use(express.static('public_html'));

app.listen(port, () =>
console.log(
    `Example app listening at http://127.0.0.1:${port}` // Change this ip address
));