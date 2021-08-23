const router = require("express").Router();
const passport = require("passport");
const mysql = require("mysql");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const config = require("../config/dbConfig");
const con = mysql.createConnection(config)


//login using Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

//if login success, redirect here
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
    console.log(req.user)
    const payload = {email:req.user.email,photo:req.user.photo,name:req.user.name};
    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1d' });
    const cookieOption = {
        maxAge: 24 * 60 * 60 * 1000,    //ms
        httpOnly: true,
        signed: true
    };
    res.cookie('mytoken', token, cookieOption);
    var sql = ("select * from driver where email = ?")
    con.query(sql, [req.user.email], function (err, result) {
        if (err) {
            console.log(err)
        }
        else {

            if (result.length == 1) {
                if (result[0].role == 3) {
                    res.redirect('/check')
                    console.log("/chack")
                } else {
                    res.render("index", { user: req.user });
                    
                }
                // console.log(result)

            }
            else {
                res.redirect("/mapping");
            }
        }

    });


});

//log out
router.get("/logout", (req, res) => {
    req.logOut();
    // var removing = browser.cookies.remove()
    res.redirect("/");
})

module.exports = router;