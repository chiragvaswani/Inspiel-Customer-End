const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const app = express();

app.use(bodyParser.json());

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("static"));

app.use(
  session({
    secret: "Secret key",
    resave: true, // Forces the session to be saved back to the session store
    saveUninitialized: true // Forces a session that is "uninitialized" to be saved to the store
  })
);

const Booking = require("./static/js/BookingSchema");
const Player = require("./static/js/PlayerSchema");
const BookingCompare = require("./static/js/BookingsCompare");
const Court = require("./static/js/CourtSchema");
const BookingsCompare = require("./static/js/BookingsCompare");
// import { BookingCompare } from "./static/js/BookingsCompare";

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

mongoose.connect("mongodb://localhost:27017/BookingsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", () => console.log("Error in Connecting to Database"));
db.once("open", () => console.log("Connected to Database"));

app.get("/", (req, res) => {
  delete session.username;
  delete session.firstName;
  res.render("index");
});

app.post("/", (req, res) => {
  const username = req.body.username;
  const date = req.body.date;
  const court = req.body.court;
  const cost = req.body.cost;
  const slot = req.body.slot;

  const data = {
    username: username,
    date: date,
    courtName: court,
    cost: cost,
    slot: slot
  };

  Booking.create(data, (err, data) => {
    if (err) {
      throw err;
    }
    console.log(data);
    console.log("Record Inserted Successfully");
    res.render("index");
  });
});

app.get("/:courtName/", (req, res) => {
  console.log("This place");
  var date = new Date();
  date = date.toLocaleDateString();
  console.log("Today: " + date);
  // var date = new Date().toLocaleDateString();
  console.log(date);
  const data = {
    username: "test123",
    date: date,
    courtname: req.params.courtName,
    ownerusername: "testOwner",
    slot: {
      startTime: {
        hours: 9,
        minutes: 0
      },
      endTime: {
        hours: 10,
        minutes: 0
      }
    },
    cost: 300
  };

  Booking.create(data, (err, data) => {
    if (err) throw err;
    console.log(data);
    console.log("Record added!");
    res.send("Boom!");
  });
});

app.get("/customer/login", (req, res) => {
  res.render("CustomerSignin", { message: "" });
});

app.get("/customer/signup", (req, res) => {
  res.render("CustomerSignup", { message: "" });
});

app.post("/customer/login", async (req, res) => {
  Player.findOne({ username: req.body.username }, async (err, data) => {
    if (err) {
      throw err;
    } else {
      if (data == null) {
        res.render("CustomerSignin", { message: "User does not exist" });
      } else {
        try {
          if (await bcrypt.compare(req.body.password, data.password)) {
            session.username = req.body.username;
            session.firstName = data.firstName;
            console.log("Session username: ", session.username);
            console.log("Session successful");
            res.redirect("/customer/dashboard");
          } else {
            res.render("CustomerSignin", { message: "Incorrect password" });
          }
        } catch {
          res.render("CustomerSignin", { message: "Incorrect password" });
        }
      }
    }
  });
});

app.post("/customer/signup", async (req, res) => {
  if (req.body.password !== req.body.confirmPassword) {
    console.log();
    res.render("CustomerSignup", { message: "Passwords don't match" });
  } else {
    Player.findOne({ username: req.body.username }, async (err, data) => {
      console.log(data);
      if (data != null) {
        console.log(data.username);
        res.render("CustomerSignup", { message: "Username exists" });
      } else {
        try {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          data = {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            contact: req.body.contact,
            address: req.body.address
          };

          Player.create(data, (err, data) => {
            if (err) {
              throw err;
            } else {
              console.log(data);
              res.redirect("/customer/login");
            }
          });
        } catch {
          console.log("Error in inserting the record");
        }
      }
    });
  }
});

app.get("/customer/dashboard", (req, res) => {
  if (session.username == undefined) {
    res.redirect("/");
  } else {
    res.render("customer-dashboard", { firstName: session.firstName });
  }
});

app.get("/customer/profile", (req, res) => {
  res.render("profile");
});

app.get("/customer/bookings", (req, res) => {
  console.log("Session username in customer/bookings is: " + session.username);
  Booking.find({ username: session.username }, (err, data) => {
    if (err) {
      throw err;
    } else {
      past = [];
      upcoming = [];
      for (var ob of data) {
        if (ob.date >= Date.now()) {
          upcoming.push(ob);
        } else {
          past.push(ob);
        }
      }
      // past = past.slice(0, past.length - 1); The session object was saved in the same collection as MyBookings but now I've removed it so this is no longer needed
      past.sort(BookingCompare);
      upcoming.sort(BookingCompare);
      console.log("Past bookings: ", past);
      console.log("Upcoming bookings: ", upcoming);
      console.log(data);
      // data = data.slice(0, data.length - 1);
      // console.log(data);
      res.render("MyBookings", { past: past, upcoming: upcoming });
    }
  });
});

app.get("/customer/court/", (req, res) => {
  Court.find({ sport: req.query.sport }, (err, data) => {
    if (err) throw err;
    else {
      res.render("Courts", { courts: data });
    }
  });
});

app.get("/customer/court/:courtName/:sport", (req, res) => {
  Court.findOne(
    { name: req.params.courtName, sport: req.params.sport },
    (err, data) => {
      if (err) throw err;
      else {
        if (data != null) res.render("CourtDes", { court: data });
        else res.send(data);
        // Check this once
      }
    }
  );
});

// app.get("/:courtName/book", (req, res) => {
//   session.date = req.body.date;
//   session.courtName = req.params.courtName;
//   res.json(date, courtName);
// });

app.post("/customer/court/:courtName/:sport", (req, res) => {
  // console.log(req.body.date);
  // var date = new Date(Date.parse(req.body.date));
  // console.log("Date is " + date.toLocaleDateString());
  // session.date = date;
  // console.log(date.toLocaleDateString());
  // console.log(session.date.toLocaleDateString());
  session.courtName = req.params.courtName;
  // console.log(typeof session.courtName);
  var date = req.body.date;
  var total = [];
  Court.findOne({ name: session.courtName }, (err, data) => {
    if (err) throw err;
    else {
      console.log("Now here");
      session.total = data.slots;
      console.log(session.total);
      session.total = data.slots.map(
        obj =>
          obj.startTime.hours +
          ":" +
          String(obj.startTime.minutes).padStart(2, "0") +
          " - " +
          obj.endTime.hours +
          ":" +
          String(obj.endTime.minutes).padStart(2, "0")
      );
    }
  });
  Booking.find({ courtname: req.params.courtName }, (err, data) => {
    if (err) throw err;
    else {
      // console.log(data[0].date.getTime());
      // date.toLocaleDateString();
      // console.log(data[0].date);
      // console.log(date.toLocaleDateString().toString());
      // console.log(date.toLocaleDateString() == data[0].date);
      // session.booked = data;
      // console.log("here");
      // console.log(session.booked);
      session.date = date;
      Booking.find({ date: date }, (err, data) => {
        if (err) throw err;
        else {
          console.log("Worked x 2");
          console.log(typeof data);
          console.log(data);

          session.booked = data.map(
            obj =>
              obj.slot.startTime.hours +
              ":" +
              String(obj.slot.startTime.minutes).padStart(2, "0") +
              " - " +
              obj.slot.endTime.hours +
              ":" +
              String(obj.slot.endTime.minutes).padStart(2, "0")
          );
          console.log("Booked: " + session.booked);
          session.morning = session.total.filter(
            item => +item.split(":")[0] < 12
          );
          session.afternoon = session.total.filter(
            item => +item.split(":")[0] < 16 && +item.split(":")[0] >= 12
          );
          session.evening = session.total.filter(
            item => +item.split(":")[0] >= 16
          );
          console.log("Morning ones are: ", session.morning);
          console.log("Afternoon ones are: ", session.afternoon);
          console.log("Evening ones are: ", session.evening);
          console.log("Total: " + session.total);
          res.redirect("/book/123");
        }
      });
    }
  });
});

app.get("/book/123/", (req, res) => {
  res.render("Slot", {
    booked: session.booked,
    morning: session.morning,
    afternoon: session.afternoon,
    evening: session.evening
  });
});

app.get("/court/signup", (req, res) => {
  res.sendFile(__dirname + "/form.html");
});

app.post("/court/signup", (req, res) => {
  data = {
    name: req.body.name,
    sport: req.body.sport.toLowerCase(),
    ownerusername: req.body.ownerusername,
    address: {
      flatno: req.body.flatno,
      street: req.body.street,
      city: req.body.city,
      landmark: req.body.landmark
    },
    imagepath: "/css/bg_image.jpg",
    slots: [
      {
        startTime: {
          hours: 7,
          minutes: 30
        },
        endTime: {
          hours: 8,
          minutes: 30
        }
      },
      {
        startTime: {
          hours: 9,
          minutes: 0
        },
        endTime: {
          hours: 10,
          minutes: 0
        }
      }
    ]
  };
  Court.create(data, (err, data) => {
    if (err) throw err;
    else console.log("Court Added");
  });
  res.redirect("/court/signup");
});

app.get("/slot", (req, res) => {
  res.render("Slot");
});

app.post("/slot", (req, res) => {
  console.log("I'm here");
  var slots = req.body.slots;
  console.log(typeof slots);
  console.log(slots === undefined);
  if (slots === undefined) res.send("Select something first");
  else {
    if (typeof slots == "string") {
      console.log("I was here");
      session.booking = [
        {
          startTime: {
            hours: +slots.split("-")[0].split(":")[0],
            minutes: +slots.split("-")[0].split(":")[1]
          },
          endTime: {
            hours: +slots.split("-")[1].split(":")[0],
            minutes: +slots.split("-")[1].split(":")[1]
          }
        }
      ];
    } else {
      session.booking = [];
      slots.forEach(slots =>
        session.booking.push({
          startTime: {
            hours: +slots.split("-")[0].split(":")[0],
            minutes: +slots.split("-")[0].split(":")[1]
          },
          endTime: {
            hours: +slots.split("-")[1].split(":")[0],
            minutes: +slots.split("-")[1].split(":")[1]
          }
        })
      );
    }
    console.log(session.date);
    console.log(session.courtName);
    for (var booking of session.booking) {
      data = {
        username: "5678",
        date: session.date,
        courtName: session.courtName,
        ownerusername: "demowner",
        slot: booking,
        cost: 300
      };
      Booking.create(data, (err, data) => {
        if (err) {
          throw err;
        }
        console.log(data);
        console.log("Record Inserted Successfully");
        // res.render("index");
      });
    }
    // console.log("Session.bookings: ", session.booking);
    res.send(String(300 * session.booking.length));
  }
});

app.post("/test", (req, res) => {
  console.log(req.body);
  res.send("done");
});

app.listen(3000, () => console.log("Running on port 3000"));
