const express = require('express');
const Collection = require('./mongo');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcryptjs = require('bcryptjs');

const app = express();
const path = require('path');

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

async function hashPass(password) {
    return await bcryptjs.hash(password, 10);
}

async function compare(userPass, hashPass) {
    return await bcryptjs.compare(userPass, hashPass);
}

const templatePath = path.join(__dirname, "../templates");
const publicPath = path.join(__dirname, "../public");

app.set('view engine', 'hbs');
app.set("views", templatePath);
app.use(express.static(publicPath));

app.get("/", (req, res) => {
    try {
        if (req.cookies.jwt) {
            const verify = jwt.verify(req.cookies.jwt, "meranaamhaiibuhatelamaamerichudailkibetibaapmerashaitaankachela");
            res.render("home", { name: verify.name });
        } else {
            res.render("login");
        }
    } catch (err) {
        res.clearCookie("jwt");
        res.render("login", { error: "Session expired. Please log in again." });
    }
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    try {
        const check = await Collection.findOne({ name: req.body.name });
        if (check) {
            res.send("User already exists");
        } else {
            const token = jwt.sign({ name: req.body.name }, "meranaamhaiibuhatelamaamerichudailkibetibaapmerashaitaankachela");
            res.cookie("jwt", token, {
                maxAge: 600000,
                httpOnly: true
            });
            const data = {
                name: req.body.name,
                password: await hashPass(req.body.password),
                token: token
            };
            await Collection.insertMany([data]);
            res.render("home", { name: req.body.name });
        }
    } catch {
        res.send("Wrong details");
    }
});

app.post("/login", async (req, res) => {
    try {
        const check = await Collection.findOne({ name: req.body.name });
        const passCheck = await compare(req.body.password, check.password);
        if (check && passCheck) {
            res.cookie("jwt", check.token, {
                maxAge: 600000,
                httpOnly: true
            });
            res.render("home", { name: req.body.name });
        } else {
            res.send("Wrong details");
        }
    } catch {
        res.send("Wrong details");
    }
});

// Logout route
app.post('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/');
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
