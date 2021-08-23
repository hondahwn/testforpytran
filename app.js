require('dotenv').config();
const express = require("express");

const path = require("path");
const bcrypt = require("bcryptjs");
const mysql = require("mysql");
const config = require("./config/dbConfig.js");
const multer = require("multer");
const bodyParser = require("body-parser");
const app = express();
const con = mysql.createConnection(config);
const passportSetup = require("./config/passport-setup");
const passport = require("passport");
const authRoutes = require("./routes/auth-routes");
const profile = require("./routes/profile-routes")
const pageRoute = require('./routes/pagerout');
const compression = require('compression');
const blogRoute = require('./routes/manageuserroute');
const caroute = require('./routes/managecarroute');
const carmatchro = require('./routes/managecarmatch');
// const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://broker.emqx.io')
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const { decode } = require("punycode");
app.use(bodyParser.urlencoded({ extended: true })); //when you post service
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(compression());
app.use(cookieSession({
    maxAge: 60 * 60 * 1000,
    keys: [process.env.cookiekey]
}))
// app.use(helmet());      //for header protection
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/style", express.static(path.join(__dirname, '/public/styles')));
app.use(passport.session());
app.use(cookieParser(process.env.COOKIE_KEY));
app.use("/auth", authRoutes);
app.use(carmatchro)
app.use(pageRoute);
app.use(blogRoute);
app.use(caroute);

app.use("/profileroute", profile);

app.set('view engine', 'ejs');

// app.engine('html', require('ejs').renderFile);

app.use("/image", express.static(path.join(__dirname, 'image')));

app.post("/signUp", function(req, res) {

    const username = req.body.username;
    const email = req.body.email;
    const tel = req.body.tel;
    const role = req.body.role

    const sql = "INSERT INTO user(name, email, role,tel) VALUES(?,?,?,?)";
    con.query(sql, [username, email, role, tel], function(err, result, fields) {
        if (err) {
            console.error(err.message);
            res.status(503).send("Database error");
            return;
        }
        // get inserted rows
        const numrows = result.affectedRows;
        if (numrows != 1) {
            console.error("can not insert data");
            res.status(503).send("Database error");
        } else {
            res.send("Registered");
        }
    });

});

app.get('/verify', (req, res) => {
    const token = req.signedCookies['mytoken'] || req.headers['x-access-token'];
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            console.log(err);
            res.status(400).send('Invalid token');
        } else {
            // OK, decoding is done
            console.log(decoded)
            res.send(decoded);
        }
    });
 });

//-------------------------- Register ------------------------
app.post("/register", function(req, res) {
    const username = req.body.username;
    const name = req.body.name;
    const lastname = req.body.lastname;
    const password = req.body.password;
    const role = req.body.role;
    const id_card = req.body.id_card;
    const email = req.body.email;
    const tell = req.body.tell;

    //checked existing username
    let sql = "SELECT driver_id FROM driver WHERE username=?";
    con.query(sql, [username], function(err, result, fields) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Database server error");
            return;
        }

        const numrows = result.length;
        //if repeated username
        if (numrows > 0) {
            res.status(400).send("Sorry, this username exists");
        } else {
            bcrypt.hash(password, 10, function(err, hash) {
                //return hashed password, 60 characters
                sql = "INSERT INTO driver(username,name,lastname,password,role,id_card,email,tell) VALUES (?,?,?,?,?,?,?,?)";
                con.query(sql, [username, name, lastname, hash, role, id_card, email, tell], function(err, result, fields) {
                    if (err) {
                        console.error(err.message);
                        res.status(500).send("Database server error");
                        return;
                    }

                    const numrows = result.affectedRows;
                    if (numrows != 1) {
                        res.status(500).send("Insert failed");
                    } else {
                        res.send("Register done");
                    }
                });
            });
        }
    });
});

app.post("/loginmoblie", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const sql = "SELECT * FROM driver LEFT JOIN car_match on driver.driver_id = car_match.driver_id WHERE driver.username = ? AND DATE(car_match.date) = CURDATE()";
    con.query(sql, [username], function(err, result, fields) {
        if (err) {
            res.status(500).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
        } else {
            const numrows = result.length;
            if (numrows != 1) {

                res.status(401).send("เข้าสู่ระบบไม่สำเร็จ");
            } else {
                bcrypt.compare(password, result[0].password, function(err, resp) {
                    if (err) {
                        res.status(503).send("การรับรองเซิร์ฟเวอร์ผิดพลาด");
                    } else if (resp == true) {
                        res.send(result)
                    } else {
                        //wrong password
                        res.status(403).send("รหัสไม่ถูกต้อง");
                    }
                });
            }
        }
    });
});



app.delete("/deleteuser", (req, res) => {
    const { id } = req.body;
    console.log(req.body)
    const sql = "DELETE FROM user WHERE Id =?"
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(503).send("Server error");
        } else {
            res.status(200).send("Delete successed");
        }
    });
});

app.get("/query_location", (req, res) => {

    const sql = "SELECT * FROM `user_request`"
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(503).send("Server error");
        } else {
            res.send(result);
        }
    });
});

app.post("/query_point", (req, res) => {

    const _id = req.body.driver_id;
    const sql = "SELECT * FROM `review_driver` WHERE driver_id=?"
    con.query(sql, [_id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(503).send("Server error");
        } else {
            res.send(result);
        }
    });
});

app.put("/setstatus", (req, res) => {
    const { request_id } = req.body;
    const sql = "UPDATE `user_request` SET `status` = '0' WHERE `user_request`.`request_id` = ?"
    con.query(sql, [request_id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(503).send("Server error");
        } else {
            res.status(200).send("Update Successfully");
        }
    });
});


app.post("/addlocation", (req, res) => {
    const { carmatch, lat, lng } = req.body;
    console.log(req.body)
    const sql = "INSERT INTO location(carmatch, lat, lng) VALUES (?,?,?)"
    con.query(sql, [carmatch, lat, lng], (err, result) => {
        if (err) {
            console.log(err);
            res.status(503).send("Server error");
        } else {
            res.status(200).send("addlocationsuccessed");
        }
    });
});

app.post("/review", (req, res) => {
    const { driver_id,user_email,carmatch,point } = req.body;
    console.log(req.body)
    const sql = "INSERT INTO `review_driver`( `driver_id`, `user_email`, `carmatch`,`point`) VALUES (?,?,?,?)"
    con.query(sql, [driver_id, user_email, carmatch,point], (err, result) => {
        if (err) {
            console.log(err);
            res.status(503).send("Server error");
        } else {
            res.status(200).send("reviewsuccessed");
        }
    });
});

app.post("/request", (req, res) => {
    const {user_email,lat,lng,status,route } = req.body;
    console.log(req.body)
    const sql = "INSERT INTO `user_request`( `user_email`, `lat`, `lng`, `status`, `route`) VALUES (?,?,?,?,?)"
    con.query(sql, [user_email,lat,lng,status,route], (err, result) => {
        if (err) {
            console.log(err);
            res.status(503).send("Server error");
        } else {
            res.status(200).send("requestsuccessed");
        }
    });
});
app.get("/showrequest", (req, res) => {
    const sql = "SELECT * FROM `user_request`"
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(503).send("Server error");
        } else {
            res.status(200).send(result);
        }
    });
});

client.on('connect', function() {
    client.subscribe('moyanyo', function(err) {
        if (!err) {
            client.publish('moyanyo', 'Hello mqtt')
        }
    })
})

client.on('message', function(topic, message) {
    // message is Buffer
    console.log(message.toString())
        // client.end()
})

const PORT = 35000
app.listen(PORT, function() {
    console.log("Server is running at " + PORT);
});
const wss = new WebSocket.Server({ port: 34000 });
wss.on('connection', function connection(ws) { // สร้าง connection
    ws.on('message', function incoming(message) {
        // รอรับ data อะไรก็ตาม ที่มาจาก client แบบตลอดเวลา
        console.log('received: %s', message);
    });
    ws.on('close', function close() {
        // จะทำงานเมื่อปิด Connection ในตัวอย่างคือ ปิด Browser
        console.log('disconnected');
    });

    // ส่ง data ไปที่ client เชื่อมกับ websocket server นี้
    client.on('message', function(topic, message) {
        // message is Buffer
        console.log(message.toString())
        ws.send(message.toString());
        // client.end()
    })
    
});