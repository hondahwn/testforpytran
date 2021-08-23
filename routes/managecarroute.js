const router = require('express').Router();
const config = require("../config/dbConfig.js");
const mysql = require("mysql");
const con = mysql.createConnection(config);

router.get("/carinfo", (req, res) => {
    const sql = "SELECT * FROM car";
    con.query(sql, function (err, result, fields) {
        if (err) {
            console.error(err.message);
            res.status(503).send("Database error");
            return;
        } else {
            res.render('car', { result: result })
        }
    });
})

router.post("/addcar", (req, res) => {
    const { License_plate, seat } = req.body;
    const sql = "INSERT INTO `car`(`License_plate`, `seat`) VALUES (?,?)"
    con.query(sql, [License_plate, seat], (err, result) => {
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
                res.send("/carinfo");
            }

        }
    });
});

router.put("/updatecar", (req, res) => {
    const { License_plate, seat, car_id } = req.body;
    const sql = "UPDATE car SET License_plate=?,seat=? WHERE car_id = ?"
    con.query(sql, [License_plate, seat, car_id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(503).send("Server error");
        } else {
            res.status(200).send('/carinfo');
        }
    });
});

// router.delete("/deletecar", (req, res) => {
//     const { car_id } = req.body;
//     console.log(car_id)
//     const sql = "DELETE FROM car WHERE car_id = ?"
//     con.query(sql, [car_id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.status(503).send("Server error");
//         } else {
//             res.status(200).send('/carinfo');
//         }
//     });
// });

module.exports = router;