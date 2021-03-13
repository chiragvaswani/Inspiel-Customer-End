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
const User = require("./static/js/OwnerSchema.js");

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
  delete session.courtName;
  delete session.username;
  delete session.firstName;
  console.log("here");
  res.render("index");
});

// app.post("/", (req, res) => {
//   const username = req.body.username;
//   const date = req.body.date;
//   const court = req.body.court;
//   const cost = req.body.cost;
//   const slot = req.body.slot;

//   const data = {
//     username: username,
//     date: date,
//     courtName: court,
//     cost: cost,
//     slot: slot
//   };

//   Booking.create(data, (err, data) => {
//     if (err) {
//       throw err;
//     }
//     console.log(data);
//     console.log("Record Inserted Successfully");
//     res.render("index");
//   });
// });

// Testing route
// app.get("/:courtName/", (req, res) => {
//   console.log("This place");
//   var date = new Date();
//   date = date.toLocaleDateString();
//   console.log("Today: " + date);
//   // var date = new Date().toLocaleDateString();
//   console.log(date);
//   const data = {
//     username: "test123",
//     date: date,
//     courtname: req.params.courtName,
//     ownerusername: "testOwner",
//     slot: {
//       startTime: {
//         hours: 9,
//         minutes: 0
//       },
//       endTime: {
//         hours: 10,
//         minutes: 0
//       }
//     },
//     cost: 300
//   };

//   Booking.create(data, (err, data) => {
//     if (err) throw err;
//     console.log(data);
//     console.log("Record added!");
//     res.send("Boom!");
//   });
// });

app.get("/customer/login", (req, res) => {
  res.render("CustomerSignin", { message: "" });
});

app.get("/owner/login", (req, res) => res.render("login"));

app.get("/owner/signup", (req, res) => res.render("signup"));

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

// Owner post requests for login and signup
app.post("/owner/login", async (req, res) => {
  session.email = req.body.inputEmail;
  session.password = req.body.inputPassword;

  // console.log(username + " " + password);

  User.findOne({ email: session.email }, async (err, user) => {
    //  status codes -- 1 success, 2 not found, 3 incorrect password
    if (user === null) {
      return res.redirect("/owner/login"); // User not Found
    }

    try {
      // Login successful
      if (await bcrypt.compare(session.password, user.password)) {
        User.find({ email: session.email }, function (error, result) {
          session.courtName = user.court; // storing the court name in the session.2
          session.ownerusername = user.username; // storing the username of the owner in the session.
          console.log(user.court);
          res.render("Owner Dashboard", {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            contact: user.contact,
            sport: user.sport,
            court: user.court,
            address: user.address
          });
        });
      } else {
        return res.redirect("/owner/login");
      } // Incorrect Password
    } catch {
      res.json({ status: -1 }); // unknown error
    }
  });
});

app.post("/owner/signup", async (req, res) => {
  const username = req.body.username;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const contact = req.body.contact;
  const sport = req.body.sport;
  const court = req.body.court;
  const address = req.body.address;
  const street = req.body.street;
  const landmark = req.body.landmark;
  const city = req.body.city;
  const password = req.body.password;
  const copassword = req.body.copassword;

  if (password == copassword) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const data = {
        username: username,
        firstname: firstname,
        lastname: lastname,
        email: email,
        contact: contact,
        sport: sport,
        court: court,
        address: address,
        street: street,
        landmark: landmark,
        city: city,
        password: hashedPassword,
        type: 1
      };

      const courtData = {
        name: data.court,
        sport: data.sport.toLowerCase(),
        ownerusername: data.username,
        address: null,
        imagepath: "/css/bg_image.jpg",
        slots: []
      };

      User.create(data, (err, data) => {
        if (err) {
          throw err;
        }
        console.log(data);
        console.log("Record Inserted Successfully");
      });

      Court.create(courtData, (err, data) => {
        if (err) throw err;
        console.log(data);
        console.log("Court created successfully!");
      });

      return res.redirect("/owner/login");
    } catch {
      console.log("Error in inserting record");
    }
  } else {
    return res.json({
      message: "Password error"
    });
  }
});

// Endpoint to GET owner's dashboard
app.get("/owner/dashboard", async (req, res) => {
  // console.log(username + " " + password);

  User.findOne({ email: session.email }, async (err, user) => {
    //  status codes -- 1 success, 2 not found, 3 incorrect password
    if (user === null) {
      return res.redirect("/owner/login"); // User not Found
    }

    try {
      // Login successful
      if (await bcrypt.compare(session.password, user.password)) {
        User.find({ email: session.email }, function (error, result) {
          res.render("Owner Dashboard", {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            contact: user.contact,
            sport: user.sport,
            court: user.court,
            address: user.address
          });
        });
      } else {
        return res.redirect("/owner/login");
      } // Incorrect Password
    } catch {
      res.json({ status: -1 }); // unknown error
    }
  });
});

// Endpoint to GET owner's profile
app.get("/owner/profile", async (req, res) => {
  // console.log(username + " " + password);

  User.findOne({ email: session.email }, async (err, user) => {
    //  status codes -- 1 success, 2 not found, 3 incorrect password
    if (user === null) {
      return res.redirect("/owner/login"); // User not Found
    }

    try {
      // Login successful
      if (await bcrypt.compare(session.password, user.password)) {
        User.find({ email: session.email }, function (error, result) {
          res.render("profile_owner", {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            contact: user.contact,
            sport: user.sport,
            court: user.court,
            address: user.address,
            street: user.street,
            landmark: user.landmark,
            city: user.city,
            description: user.description
          });
        });
      } else {
        return res.redirect("/owner/login");
      } // Incorrect Password
    } catch {
      res.json({ status: -1 }); // unknown error
    }
  });
});

app.get("/customer/dashboard", (req, res) => {
  if (session.username === undefined) {
    res.redirect("/customer/login");
  } else {
    res.render("customer-dashboard", { firstName: session.firstName });
  }
});

app.get("/customer/profile", (req, res) => {
  if (session.username === undefined) res.redirect("/customer/login");
  else res.render("profile");
});

// Endpoint for updating owner's info
app.all(
  "/update",

  async (req, res) => {
    User.findOne({ email: session.email }, async (err, user) => {
      //  status codes -- 1 success, 2 not found, 3 incorrect password
      if (user === null) {
        return res.redirect("/owner/login"); // User not Found
      }

      const username = req.body.username;
      const firstname = req.body.firstname;
      const lastname = req.body.lastname;
      const email = req.body.email;
      const contact = req.body.contact;
      const sport = req.body.sport;
      const court = req.body.court;
      const address = req.body.address;
      const street = req.body.street;
      const landmark = req.body.landmark;
      const city = req.body.city;
      const description = req.body.description;

      User.update(
        { email: email },
        {
          username: username,
          firstname: firstname,
          lastname: lastname,
          contact: contact,
          sport: sport,
          court: court,
          address: address,
          street: street,
          landmark: landmark,
          city: city,
          description: description
        },
        function (error, result) {
          res.render("profile_owner", {
            username: username,
            firstname: firstname,
            lastname: lastname,
            email: email,
            contact: contact,
            sport: sport,
            court: court,
            address: address,
            street: street,
            landmark: landmark,
            city: city,
            description: description
          });
        }
      );
    });
  }
);

app.get("/edit", async (req, res) => {
  // console.log(username + " " + password);

  User.findOne({ email: session.email }, async (err, user) => {
    //  status codes -- 1 success, 2 not found, 3 incorrect password
    if (user === null) {
      return res.redirect("/owner/login"); // User not Found
    }

    try {
      // Login successful
      if (await bcrypt.compare(session.password, user.password)) {
        User.find({ email: session.email }, function (error, result) {
          res.render("edit_profile", {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            contact: user.contact,
            sport: user.sport,
            court: user.court,
            address: user.address,
            street: user.street,
            landmark: user.landmark,
            city: user.city,
            description: user.description
          });
        });
      } else {
        return res.redirect("/owner/login");
      } // Incorrect Password
    } catch {
      res.json({ status: -1 }); // unknown error
    }
  });
});

app.get("/customer/bookings", (req, res) => {
  if (session.username === undefined) res.redirect("/customer/login");
  else {
    console.log(
      "Session username in customer/bookings is: " + session.username
    );
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
        past.sort(BookingCompare);
        upcoming.sort(BookingCompare);
        console.log("Past bookings: ", past);
        console.log("Upcoming bookings: ", upcoming);
        console.log(data);
        res.render("MyBookings", { past: past, upcoming: upcoming });
      }
    });
  }
});

// Adding slots - court owner end
app.all("/add_slot", async function (req, res) {
  const user = await User.findOne({ email: session.email });
  const court = await Court.findOne({ name: session.courtName });

  if (!user || !court) {
    return res.redirect("/owner/login");
  }

  const starthr = +req.body.starthr;
  const startmin = +req.body.startmin;
  const endhr = +req.body.endhr;
  const endmin = +req.body.endmin;
  const am = req.body.am;
  const pm = req.body.pm;
  console.log(starthr);

  if (req.body.starthr != undefined) {
    const slot = {
      startTime: {
        hours: starthr,
        minutes: startmin,
        am: am
      },
      endTime: {
        hours: endhr,
        minutes: endmin,
        pm: pm
      }
    };

    console.log(req.body.starthr);
    console.log(slot);
    user.slots.map(s => {
      console.log(s.startTime);
      console.log(slot.startTime);
      console.log(s.startTime === slot.startTime);
      if (
        (s.startTime.hours === slot.startTime.hours &&
          s.startTime.minutes === slot.startTime.minutes) ||
        (s.endTime.hours === slot.endTime.hours &&
          s.endTime.minutes === slot.endTime.minutes)
      ) {
        console.log("Invalid slot. Please try again.");
        res.redirect("/add_slot");
      }
    });
    user.slots = user.slots.concat(slot);
    court.slots = court.slots.concat(slot);
    await court.save();
    await user.save();
  }

  User.find(function (error, result) {
    if (error) {
      return res.json({
        status: false,
        message: "Fail..",
        error: error
      });
    }
    User.find({ email: session.email }, function (err, result) {
      past = [];
      for (var ob of result) {
        past.push(ob.slots);
      }
      res.render("add_slots", { past: past[0] });
    });
  });
});

app.get("/customer/court", (req, res) => {
  console.log("IN the req route", session.username);
  if (session.username === undefined) {
    console.log("I was here!");
    res.redirect("/customer/login");
  } else {
    Court.find({ sport: req.query.sport }, (err, data) => {
      if (err) throw err;
      else {
        res.render("Courts", { courts: data });
      }
    });
  }
});

app.get("/customer/court/:courtName/:sport", (req, res) => {
  if (session.username === undefined) res.redirect("/customer/login");
  Court.findOne(
    { name: req.params.courtName, sport: req.params.sport },
    (err, data) => {
      if (err) throw err;
      else {
        console.log("here");
        if (data != null) res.render("CourtDes", { court: data });
        // else {
        //   // 404 page
        // }
        // Check this once
      }
    }
  );
});

app.post("/customer/court/:courtName/:sport", (req, res) => {
  session.courtName = req.params.courtName;
  var date = req.body.date;
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
  if (session.morning == undefined) res.redirect("/customer/login");
  else {
    res.render("Slot", {
      booked: session.booked,
      morning: session.morning,
      afternoon: session.afternoon,
      evening: session.evening
    });
  }
});

// Testing signup
// app.get("/court/signup", (req, res) => {
//   res.sendFile(__dirname + "/form.html");
// });

// app.post("/court/signup", (req, res) => {
//   data = {
//     name: req.body.name,
//     sport: req.body.sport.toLowerCase(),
//     ownerusername: req.body.ownerusername,
//     address: {
//       flatno: req.body.flatno,
//       street: req.body.street,
//       city: req.body.city,
//       landmark: req.body.landmark
//     },
//     imagepath: "/css/bg_image.jpg",
//     slots: [
//       {
//         startTime: {
//           hours: 7,
//           minutes: 30
//         },
//         endTime: {
//           hours: 8,
//           minutes: 30
//         }
//       },
//       {
//         startTime: {
//           hours: 9,
//           minutes: 0
//         },
//         endTime: {
//           hours: 10,
//           minutes: 0
//         }
//       }
//     ]
//   };
//   Court.create(data, (err, data) => {
//     if (err) throw err;
//     else console.log("Court Added");
//   });
//   res.redirect("/court/signup");
// });

// Payment Gateway
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
        username: "", // placeholder
        date: session.date,
        courtName: session.courtName,
        ownerusername: session.ownerusername,
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

app.get("/offline", (req, res) => {
  if (session.email === undefined) res.redirect("/owner/login");
  console.log("here: ", session.courtName);
  Court.findOne({ name: session.courtName }, (err, data) => {
    if (err) throw err;
    else {
      console.log("here: ", data);
      res.render("OwnerOfflineBooking", { court: data });
    }
  });
});

// app.get("/:x", (req, res) => {
//   console.log("Hereerererere!");
//   res.redirect("/");
// });

app.listen(3000, () => console.log("Running on port 3000"));
