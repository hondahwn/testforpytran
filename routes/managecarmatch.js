const router = require('express').Router();
const config = require("../config/dbConfig.js");
const mysql = require("mysql");
const con = mysql.createConnection(config);

router.get("/carmatchinfo", (req, res) => {
    const sql = "SELECT * FROM car_match,driver,car WHERE date(date)=CURRENT_DATE AND car_match.driver_id =driver.driver_id AND car_match.car_id = car.car_id";
    con.query(sql, function (err, result, fields) {
        if (err) {
            console.error(err.message);
            res.status(503).send("Database error");
            return;
        } else {
            res.render('match', { resule: result })
        }
    });
})

router.delete("/deletecarmatch", (req, res) => {
    const { carmatch } = req.body;
    const sql = "DELETE FROM car_match WHERE carmatch = ?"
    con.query(sql, [carmatch], (err, result) => {
        if (err) {
            console.log(err);
            res.status(503).send("Server error");
        } else {
            res.status(200).send("/carmatchinfo");
        }
    });
});

router.put("/updatecarmatch", (req, res) => {
    const { name, lastname,License_plate,carmatch } = req.body;
    const sql = "UPDATE car_match SET driver_id=(SELECT driver_id FROM driver WHERE name =? AND lastname=? ),car_id=(SELECT car_id FROM car WHERE License_plate = ?) WHERE carmatch=?"
    con.query(sql, [name, lastname, License_plate,carmatch], (err, result) => {
        if (err) {
            console.log(err);
            res.status(503).send("Server error");
        } else {
            res.status(200).send("/carmatchinfo");
        }
    });
});

router.post("/addcarmatch", (req, res) => {
    const { name, lastname, License_plate } = req.body;
    console.log(name+lastname+License_plate)
    const sql = "INSERT INTO car_match(driver_id, car_id ) VALUES ((SELECT driver_id FROM driver WHERE name =? AND lastname=? ),(SELECT car_id FROM car WHERE License_plate = ?))"
    con.query(sql, [name, lastname, License_plate], (err, result) => {
        if (err) {
            console.log(err);
            res.status(503).send("Server error");
        } else {
            const numrows = result.affectedRows;
            if (numrows != 1) {
                console.error("can not insert data");
                res.status(503).send("Database error");
            }
            else {
                res.send("/carmatchinfo");
            }
        }
    });
});


module.exports = router;