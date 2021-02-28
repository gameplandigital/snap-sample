const express = require("express"),
  bodyParser = require("body-parser"),
  path = require("path"),
  session = require("express-session"),
  cors = require("cors"),
  moment = require("moment-timezone"),
  busboy = require("connect-busboy"),
  busboyBodyParser = require("busboy-body-parser"),
  AWS = require("aws-sdk"),
  Busboy = require("busboy"),
  geoip = require("geoip-lite"),
  macaddress = require("macaddress"),
  DeviceDetector = require("node-device-detector"),
  clientIp = require("client-ip"),
  publicIp = require("public-ip"),
  query = require("./database/query");

moment.tz.setDefault("Asia/Manila");

var app = express();

const server_port = process.env.PORT || this.SERVER_PORT || 9001;
const env = process.env.NODE_ENV || "development";

//View Engine
app.set("view engine", "ejs");
app.set("public", path.join(__dirname, "public"));

app.use(busboy());

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(busboyBodyParser());
app.use(
  session({
    secret: "Giro Pogi",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 31536000000 }
  })
);

app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

// Set Static Path
app.use(express.static(path.join(__dirname, "public")));

app.get("/screensaver-brand", function (req, res) {
  res.render("screensaver-brand");
});

app.get("/screensaver-logo", function (req, res) {
  res.render("screensaver-logo");
});

app.get("/", function (req, res) {
  res.redirect("/login");
});

var saveLog = (req, log, data) => {
  macaddress.all(function (err, all) {
    (async () => {
      const req_headers = JSON.stringify(req.headers),
        geo = geoip.lookup(await publicIp.v4())
          ? JSON.stringify(geoip.lookup(await publicIp.v4()))
          : "Unknown",
        detector = new DeviceDetector(),
        userAgent = req.headers["user-agent"],
        device = detector.detect(userAgent)
          ? JSON.stringify(detector.detect(userAgent))
          : "Unknown",
        mac_address = all ? JSON.stringify(all) : "Unknown";

      query.addLog(
        req.session.user_id,
        log,
        JSON.stringify(data),
        req_headers,
        geo,
        mac_address,
        device
      );
    })();
  });
};

app.get("/404", function (req, res) {
  if (req.session.user_id) {
    const first_name = req.session.first_name,
      last_name = req.session.last_name,
      role = req.session.role,
      profile_pic = req.session.profile_pic,
      department = req.session.department,
      position = req.session.position,
      scope = req.session.scope,
      location = "home";

    saveLog(req, "User went to 404.", { url: req.originalUrl });

    res.render("404", {
      first_name,
      last_name,
      role,
      profile_pic,
      department,
      position,
      scope,
      location
    });
  } else {
    res.redirect("/login");
  }
});

app.route("/home").get((req, res) => {
  if (req.session.user_id) {
    const first_name = req.session.first_name,
      last_name = req.session.last_name,
      role = req.session.role,
      profile_pic = req.session.profile_pic,
      department = req.session.department,
      position = req.session.position,
      scope = req.session.scope,
      location = "home";

    saveLog(req, "User went to home.", { url: req.originalUrl });

    query.getSites(sites => {
      query.getUserNotification(req.session.user_id, notifications => {
        res.render("home", {
          sites,
          moment,
          first_name,
          last_name,
          role,
          profile_pic,
          department,
          position,
          scope,
          location,
          notifications
        });
      })
    });
  } else {
    res.redirect("/login");
  }
});

app.route("/notifications").get((req, res) => {
  if (req.session.user_id) {
    const first_name = req.session.first_name,
      last_name = req.session.last_name,
      role = req.session.role,
      profile_pic = req.session.profile_pic,
      department = req.session.department,
      position = req.session.position,
      scope = req.session.scope,
      location = "home";

    saveLog(req, "User went to notifications.", { url: req.originalUrl });

    query.getUserNotification(req.session.user_id, notifications => {
      res.render("notifications", {
        moment,
        first_name,
        last_name,
        role,
        profile_pic,
        department,
        position,
        scope,
        location,
        notifications
      });
    })
  } else {
    res.redirect("/login");
  }
})

app.route("/site-management").get((req, res) => {
  if (req.session.user_id) {
    const first_name = req.session.first_name,
      last_name = req.session.last_name,
      role = req.session.role,
      profile_pic = req.session.profile_pic,
      department = req.session.department,
      position = req.session.position,
      scope = req.session.scope,
      location = "site-management";

    saveLog(req, "User went to site management.", { url: req.originalUrl });

    query.getTypes(types => {
      query.getUserNotification(req.session.user_id, notifications => {
        res.render("site-management", {
          moment,
          types,
          first_name,
          last_name,
          role,
          profile_pic,
          department,
          position,
          scope,
          location,
          notifications
        });
      });
    });
  } else {
    res.redirect("/login");
  }
});

app.route("/site-management/:type").get((req, res) => {
  if (req.session.user_id) {
    const first_name = req.session.first_name,
      last_name = req.session.last_name,
      role = req.session.role,
      profile_pic = req.session.profile_pic,
      department = req.session.department,
      position = req.session.position,
      scope = req.session.scope,
      location = "site-management";

    const type = req.params.type;

    saveLog(
      req,
      "User went to site management, explored " + type + " categories.",
      { url: req.originalUrl }
    );

    if (type) {
      query.getType(type, result => {
        if (result.length > 0) {
          query.getCategories(type, categories => {
            query.getUserNotification(req.session.user_id, notifications => {
              res.render("site-management-category", {
                categories,
                type_id: result[0].type_id,
                type,
                moment,
                first_name,
                last_name,
                role,
                profile_pic,
                department,
                position,
                scope,
                location,
                notifications
              });
            });
          });
        } else {
          res.redirect("/404");
        }
      });
    } else {
      res.redirect("/404");
    }
  } else {
    res.redirect("/login");
  }
});

app.route("/site-management/:type/:category_id").get((req, res) => {
  if (req.session.user_id) {
    const first_name = req.session.first_name,
      last_name = req.session.last_name,
      role = req.session.role,
      profile_pic = req.session.profile_pic,
      department = req.session.department,
      position = req.session.position,
      scope = req.session.scope,
      location = "site-management";

    const type = req.params.type,
      category_id = req.params.category_id;

    if (type && category_id) {
      query.getCategory(category_id, category => {
        saveLog(
          req,
          "User went to site management, explored " +
          type +
          " and viewed " +
          category +
          " sites.",
          { url: req.originalUrl }
        );
        query.getSitesByCategory(category_id, sites => {
          query.getUserNotification(req.session.user_id, notifications => {
            res.render("site-management-site", {
              sites,
              type,
              category_id,
              category,
              moment,
              first_name,
              last_name,
              role,
              profile_pic,
              department,
              position,
              scope,
              location,
              notifications
            });
          });
        });
      });
    } else {
      res.redirect("/404");
    }
  } else {
    res.redirect("/login");
  }
});

app.route("/site-management/:type/:category_id/:site_id").get((req, res) => {
  if (req.session.user_id) {
    const first_name = req.session.first_name,
      last_name = req.session.last_name,
      role = req.session.role,
      profile_pic = req.session.profile_pic,
      department = req.session.department,
      position = req.session.position,
      scope = req.session.scope,
      location = "site-management";

    const type = req.params.type,
      category_id = req.params.category_id,
      site_id = req.params.site_id;

    const tab = req.query.tab ? req.query.tab : "details";

    if (type && category_id && site_id) {
      query.getCategory(category_id, category => {
        query.getSiteDetail(site_id, detail => {
          saveLog(
            req,
            "User went to site management page, explored " +
            type +
            ", viewed " +
            category +
            " and checked " +
            detail.site +
            " with the site id of " +
            site_id +
            ".",
            { url: req.originalUrl }
          );
          query.getSitePossibleExecutions(site_id, possibleExecutions => {
            query.getSitePhotos(site_id, photos => {
              query.getSitePastProjectPhotos(site_id, pp_photos => {
                query.getUserNotification(req.session.user_id, notifications => {
                  res.render("site-management-view", {
                    detail,
                    type,
                    category_id,
                    category,
                    possibleExecutions,
                    photos,
                    pp_photos,
                    moment,
                    tab,
                    first_name,
                    last_name,
                    role,
                    profile_pic,
                    department,
                    position,
                    scope,
                    location,
                    notifications
                  });
                });
              });
            });
          });
        });
      });
    } else {
      res.redirect("/404");
    }
  } else {
    res.redirect("/login");
  }
});

app.route("/archive").get((req, res) => {
  if (req.session.user_id) {
    const first_name = req.session.first_name,
      last_name = req.session.last_name,
      role = req.session.role,
      profile_pic = req.session.profile_pic,
      department = req.session.department,
      position = req.session.position,
      scope = req.session.scope,
      location = "archive";

    saveLog(req, "User went to archive.", { url: req.originalUrl });

    query.getAllArchivedSites(sites => {
      query.getUserNotification(req.session.user_id, notifications => {
        res.render("archive", {
          sites,
          moment,
          first_name,
          last_name,
          role,
          profile_pic,
          department,
          position,
          scope,
          location,
          notifications
        });
      });
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/login", function (req, res) {
  if (req.session.user_id) {
    var first_name = req.session.first_name,
      last_name = req.session.last_name,
      role = req.session.role,
      profile_pic = req.session.profile_pic,
      department = req.session.department,
      position = req.session.position,
      scope = req.session.scope,
      location = "home";

    saveLog(req, "User went to home.", { url: req.originalUrl });

    query.getSites(sites => {
      res.render("home", {
        sites,
        moment,
        first_name,
        last_name,
        role,
        profile_pic,
        department,
        position,
        scope,
        location
      });
    });
  } else {
    res.render("login");
  }
});

app.get("/logout", function (req, res) {
  if (req.session.user_id) {
    saveLog(req, "User logged out.", { url: req.originalUrl });
    req.session.destroy(() => {
      console.log("SESSION DESTROYED");
      res.redirect("/login");
    });
  } else {
    res.render("login");
  }
});

app.route("/api/category").post((req, res) => {
  if (req.session.user_id) {
    const d = req.body;
    query.addCategory(d, result => {
      if (result > 0) {
        res.send({ success: true });
        saveLog(req, "User added a category " + d.category + ".", d);
      } else {
        res.send({ success: false });
      }
    });
  } else {
    res.render("login");
  }
});

app
  .route("/api/possible-execution")
  .get((req, res) => {
    if (req.session.user_id) {
      query.getPossibleExecution(possibleExecution => {
        res.send(possibleExecution);
      });
    } else {
      res.render("login");
    }
  })
  .post((req, res) => {
    if (req.session.user_id) {
      var d = req.body;
      query.addPossibleExecution(d, result => {
        if (result > 0) {
          res.send({ success: true });
          saveLog(
            req,
            "User added a possible execution " +
            d.category +
            " " +
            d.type +
            ".",
            d
          );
        } else {
          res.send({ success: false });
        }
      });
    } else {
      res.render("login");
    }
  });

app
  .route("/api/site")
  .post((req, res) => {
    if (req.session.user_id) {
      const data = req.body.data;
      const d = JSON.parse(data);
      query.addSite(d, result => {
        if (result) {
          res.send({ success: true });
          query.createNotification({
            type: "acquired",
            text: req.session.first_name + " " + req.session.last_name + " added a new " + d.type + " " + d.category + " in " + d.municipality + ", " + d.province + " named " + d.site + ".",
            link: "/site-management/" + d.type + "/" + d.category_id + "/" + result
          });
          saveLog(
            req,
            "User added a site " +
            d.site +
            " in " +
            d.type +
            " category id " +
            d.category_id +
            ".",
            d
          );
        } else {
          res.send({ success: false });
        }
      });
    } else {
      res.render("login");
    }
  })
  .put((req, res) => {
    if (req.session.user_id) {
      const d = req.body;
      query.updateSiteDetail(d, result => {
        if (result > 0) {
          res.send({ success: true });
          saveLog(
            req,
            "User updated a site with the id of " + d.site_id + ".",
            d
          );
        } else {
          res.send({ success: false });
        }
      });
    } else {
      res.render("login");
    }
  })
  .delete((req, res) => {
    if (req.session.user_id) {
      const d = req.body;
      query.deleteSite(d, result => {
        if (result > 0) {
          res.send({ success: true });
          saveLog(
            req,
            "User deleted a site with the id of " + d.site_id + ".",
            d
          );
        } else {
          res.send({ success: false });
        }
      });
    } else {
      res.render("login");
    }
  });

app
  .route("/api/site/possible-execution")
  .post((req, res) => {
    if (req.session.user_id) {
      const data = req.body.data;
      const d = JSON.parse(data);
      query.addSitePossibleExecution(d, result => {
        if (result > 0) {
          res.send({ success: true });
          saveLog(
            req,
            "User added possible executions site with the id of " +
            d.site_id +
            ".",
            d
          );
        } else {
          res.send({ success: false });
        }
      });
    } else {
      res.render("login");
    }
  })
  .put((req, res) => {
    if (req.session.user_id) {
      var d = req.body;
      query.updateSitePossibleExecution(d, result => {
        if (result > 0) {
          res.send({ success: true });
          saveLog(
            req,
            "User updated a possible execution in a site with the id of " +
            d.site_id +
            ".",
            d
          );
        } else {
          res.send({ success: false });
        }
      });
    } else {
      res.render("login");
    }
  })
  .delete((req, res) => {
    if (req.session.user_id) {
      const spe_id = req.body.spe_id,
        site_id = req.body.site_id;
      query.deleteSitePossibleExecution(spe_id, result => {
        if (result) {
          res.send({ success: true });
          saveLog(
            req,
            "User deleted a possible execution in a site with the id of " +
            site_id +
            ".",
            req.body
          );
        } else {
          res.send({ success: false });
        }
      });
    } else {
      res.render("login");
    }
  });

app.route("/api/site/possible-execution/sales-rate").put((req, res) => {
  if (req.session.user_id) {
    var d = req.body;
    query.updateSitePossibleExecutionSalesRate(d, result => {
      if (result > 0) {
        res.send({ success: true });
        saveLog(
          req,
          "User updated a possible execution production and sales rate in a site with id of " +
          d.site_id +
          ".",
          d
        );
      } else {
        res.send({ success: false });
      }
    });
  } else {
    res.render("login");
  }
});

var uploadToS3Gallery = file => {
  const BUCKET_NAME = "rpitv/PMS/Gallery";
  const IAM_USER_KEY = "AKIAJAT7YUJSVKTNAO2A";
  const IAM_USER_SECRET = "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";

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
    Bucket: BUCKET_NAME,
    ContentType: "img/png"
  });

  s3bucket.createBucket(function () {
    var params = {
      Bucket: BUCKET_NAME,
      Key: file.name,
      Body: file.data
    };
    s3bucket.upload(params, function (err, data) {
      if (err) {
        console.log("error in callback");
        console.log(err);
      }
      console.log("success");
      console.log(data);
      return data;
    });
  });
};

app
  .route("/api/site/gallery")
  .post((req, res) => {
    if (req.session.user_id) {
      const uploadFile = req.files.file;

      var busboy = new Busboy({ headers: req.headers });

      if (uploadFile) {
        busboy.on("file", function (
          fieldname,
          file,
          filename,
          encoding,
          mimetype
        ) {
          console.log(
            "File [" +
            fieldname +
            "]: filename: " +
            filename +
            ", encoding: " +
            encoding +
            ", mimetype: " +
            mimetype
          );
          file.on("data", function (data) {
            console.log(
              "File [" + fieldname + "] got " + data.length + " bytes"
            );
          });
          file.on("end", function () {
            console.log("File [" + fieldname + "] Finished");
          });
        });

        busboy.on("field", function (
          fieldname,
          val,
          fieldnameTruncated,
          valTruncated,
          encoding,
          mimetype
        ) {
          console.log("Field [" + fieldname + "]: value: " + inspect(val));
        });

        busboy.on("finish", function () {
          let url = "https://rpitv.s3.amazonaws.com/PMS/Gallery/";
          let data = req.body;

          let dtTemp = moment().format("YYYY MM DD HH mm ss");
          let dt = dtTemp.replace(/ /g, "");
          let n = data.site_id + "_" + dt;

          let extension = ".png";
          let complete_url = `${url}${n}${extension}`;

          req.files.file.name = `${n}${extension}`;
          uploadToS3Gallery(uploadFile);

          query.addSitePhoto(data.site_id, complete_url, result => {
            if (result) {
              if (req.body.tab.indexOf("?") > 0) {
                res.redirect(
                  req.body.tab.substring(0, req.body.tab.indexOf("?")) +
                  "?tab=gallery"
                );
              } else {
                res.redirect(req.body.tab + "?tab=gallery");
              }
            } else {
              if (req.body.tab.indexOf("?") > 0) {
                res.redirect(
                  req.body.tab.substring(0, req.body.tab.indexOf("?")) +
                  "?tab=gallery"
                );
              } else {
                res.redirect(req.body.tab + "?tab=gallery");
              }
            }
            saveLog(
              req,
              "User uploaded a site photo with a url " +
              complete_url +
              " in a site with the id of " +
              data.site_id +
              ".",
              data
            );
          });
        });
        req.pipe(busboy);
      }
    } else {
      res.render("login");
    }
  })
  .delete((req, res) => {
    if (req.session.user_id) {
      const photo_id = req.body.photo_id,
        url = req.body.url,
        site_id = req.body.site_id;
      query.deleteSitePhoto(photo_id, result => {
        if (result) {
          res.send({ success: true });
          saveLog(
            req,
            "User deleted a site photo with a url " +
            url +
            " in a site with the id of " +
            site_id +
            ".",
            req.body
          );
        } else {
          res.send({ success: false });
        }
      });
    } else {
      res.render("login");
    }
  });

var uploadToS3PastProject = file => {
  const BUCKET_NAME = "rpitv/PMS/PastProject";
  const IAM_USER_KEY = "AKIAJAT7YUJSVKTNAO2A";
  const IAM_USER_SECRET = "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";

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
    Bucket: BUCKET_NAME,
    ContentType: "img/png"
  });

  s3bucket.createBucket(function () {
    var params = {
      Bucket: BUCKET_NAME,
      Key: file.name,
      Body: file.data
    };
    s3bucket.upload(params, function (err, data) {
      if (err) {
        console.log("error in callback");
        console.log(err);
      }
      console.log("success");
      console.log(data);
      return data;
    });
  });
};

app
  .route("/api/site/past-project")
  .post((req, res) => {
    if (req.session.user_id) {
      const uploadFile = req.files.file;

      var busboy = new Busboy({ headers: req.headers });

      if (uploadFile) {
        busboy.on("file", function (
          fieldname,
          file,
          filename,
          encoding,
          mimetype
        ) {
          console.log(
            "File [" +
            fieldname +
            "]: filename: " +
            filename +
            ", encoding: " +
            encoding +
            ", mimetype: " +
            mimetype
          );
          file.on("data", function (data) {
            console.log(
              "File [" + fieldname + "] got " + data.length + " bytes"
            );
          });
          file.on("end", function () {
            console.log("File [" + fieldname + "] Finished");
          });
        });

        busboy.on("field", function (
          fieldname,
          val,
          fieldnameTruncated,
          valTruncated,
          encoding,
          mimetype
        ) {
          console.log("Field [" + fieldname + "]: value: " + inspect(val));
        });

        busboy.on("finish", function () {
          let url = "https://rpitv.s3.amazonaws.com/PMS/PastProject/";
          let data = req.body;

          let dtTemp = moment().format("YYYY MM DD HH mm ss");
          let dt = dtTemp.replace(/ /g, "");
          let n = data.site_id + "_" + dt;

          let extension = ".png";
          let complete_url = `${url}${n}${extension}`;

          req.files.file.name = `${n}${extension}`;
          uploadToS3PastProject(uploadFile);

          query.addSitePastProjectPhoto(data.site_id, complete_url, result => {
            if (result) {
              if (req.body.tab.indexOf("?") > 0) {
                res.redirect(
                  req.body.tab.substring(0, req.body.tab.indexOf("?")) +
                  "?tab=projects"
                );
              } else {
                res.redirect(req.body.tab + "?tab=projects");
              }
            } else {
              if (req.body.tab.indexOf("?") > 0) {
                res.redirect(
                  req.body.tab.substring(0, req.body.tab.indexOf("?")) +
                  "?tab=projects"
                );
              } else {
                res.redirect(req.body.tab + "?tab=projects");
              }
            }
            saveLog(
              req,
              "User uploaded a past project photo with a url " +
              complete_url +
              " in a site with the id of " +
              data.site_id +
              ".",
              data
            );
          });
        });
        req.pipe(busboy);
      }
    } else {
      res.render("login");
    }
  })
  .delete((req, res) => {
    if (req.session.user_id) {
      const photo_id = req.body.photo_id,
        url = req.body.url,
        site_id = req.body.site_id;
      query.deleteSitePastProjectPhoto(photo_id, result => {
        if (result) {
          res.send({ success: true });
          saveLog(
            req,
            "User deleted a site past project photo with a url " +
            url +
            " in a site with the id of " +
            site_id +
            ".",
            req.body
          );
        } else {
          res.send({ success: false });
        }
      });
    } else {
      res.render("login");
    }
  });

app.route("/api/home/sites").get((req, res) => {
  if (req.session.user_id) {
    query.getAllSites(sites => {
      res.send({ sites: sites });
    });
  } else {
    res.render("login");
  }
});

app.route("/api/home/categories").get((req, res) => {
  if (req.session.user_id) {
    query.getAllCategoryWithType(categories => {
      res.send({ categories: categories });
    });
  } else {
    render.render("login");
  }
});

app.route("/api/home/site-photos").get((req, res) => {
  if (req.session.user_id) {
    query.getAllSitePhotos(photos => {
      res.send({ photos: photos });
    });
  } else {
    render.render("login");
  }
});

app.route("/api/home/possible-executions").get((req, res) => {
  if (req.session.user_id) {
    query.getAllSitePossibleExecution(executions => {
      res.send({ executions: executions });
    });
  } else {
    render.render("login");
  }
});

app.route("/api/home/site-project-photos").get((req, res) => {
  if (req.session.user_id) {
    query.getAllSiteProjectPhotos(photos => {
      res.send({ photos: photos });
    });
  } else {
    render.render("login");
  }
});

app.route("/api/archive/site").put((req, res) => {
  if (req.session.user_id) {
    const site_id = req.body.site_id;
    query.restoreArchivedSite(site_id, result => {
      if (result) {
        res.send({ success: true });
      } else {
        res.send({ success: false });
      }
    });
  } else {
    render.render("login");
  }
});

app.route("/api/notifications").put((req, res) => {
  if (req.session.user_id) {
    const f = req.body.field;
    if (f == "count") {
      query.updateUserNotificationCount(req.session.user_id, result => {
        if (result) {
          res.send({ success: true });
        } else {
          res.send({ success: false });
        }
      });
    } else if (f == "seen") {
      const id = req.body.id;
      query.updateUserNotificationSeen(id, result => {
        if (result) {
          res.send({ success: true });
        } else {
          res.send({ success: false });
        }
      });
    }
  } else {
    render.render("login");
  }
})

app.route("/api/login").post((req, res) => {
  const d = req.body;
  query.login(d, result => {
    if (result) {
      if (result.is_approved) {
        const scope = result.scope.split(","),
          hasUserReadAccess = scope.find(function (scope) {
            return scope == "read" ? true : false;
          });
        if (hasUserReadAccess) {
          req.session.user_id = result.user_id;
          req.session.role = result.role;
          req.session.first_name = "" + result.first_name;
          req.session.last_name = "" + result.last_name;
          req.session.profile_pic = "" + result.profile_pic;
          req.session.department = "" + result.department;
          req.session.position = "" + result.position;
          req.session.scope = scope;
          req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000;
          res.send({ message: "Logging in...", success: true });
          saveLog(req, "User logged in.", d);
        } else {
          res.send({
            message:
              "Your account has no read access to the system. Please request access to the Administrator.",
            success: false
          });
        }
      } else {
        res.send({
          message: "Your account is not yet approved by the Administrator.",
          success: false
        });
      }
    } else {
      res.send({
        message: "Incorrect email or password. Please try again.",
        success: false
      });
    }
  });
});

app.get("*", function (req, res) {
  if (req.session.user_id) {
    const first_name = req.session.first_name,
      last_name = req.session.last_name,
      role = req.session.role,
      profile_pic = req.session.profile_pic,
      department = req.session.department,
      position = req.session.position,
      scope = req.session.scope,
      location = "home";

    saveLog(req, "User redirected to /404", { url: req.originalUrl });

    res.render("404", {
      first_name,
      last_name,
      role,
      profile_pic,
      department,
      position,
      scope,
      location
    });
  } else {
    res.render("login");
  }
});

app.listen(server_port, function () {
  console.log("Server started on port " + server_port + ".");
});
