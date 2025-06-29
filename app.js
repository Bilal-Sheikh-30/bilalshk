const express = require('express');
app = express();
const websiteRoutes = require('./routes/website.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

const dbConnection = require('./config/db')
dbConnection();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/', websiteRoutes);
app.use('/dashboard', dashboardRoutes);


app.listen(3000, () =>{
    console.log('server is running on 3000');
});