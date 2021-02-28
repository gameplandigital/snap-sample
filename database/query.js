"use strict";

const moment = require("moment-timezone"),
  conn = require("./connection");

let con = conn.connection;

moment.tz.setDefault("Asia/Manila");

var getType = (t, cb) => {
  con.query("SELECT type_id FROM type WHERE type = ?", [t], (err, result) => {
    if (err) throw err;
    cb(result);
  });
};

var getTypes = cb => {
  con.query(
    "SELECT t.type_id, t.type, COUNT(c.category_id) as 'total' FROM type t LEFT JOIN category c ON t.type_id = c.type_id  GROUP BY t.type_id",
    (err, result) => {
      if (err) throw err;
      cb(result);
    }
  );
};

var getCategory = (category_id, cb) => {
  con.query(
    "SELECT category FROM category WHERE category_id = ?",
    [category_id],
    (err, result) => {
      if (err) throw err;
      cb(result[0].category);
    }
  );
};

var getCategories = (t, cb) => {
  con.query(
    "SELECT c.category_id, c.category, COUNT(s.site_id) as 'total' FROM type t JOIN category c ON t.type_id = c.type_id LEFT JOIN site s ON s.category_id = c.category_id AND s.is_archived = 0 WHERE t.type = ? GROUP BY c.category_id",
    [t],
    (err, result) => {
      if (err) throw err;
      cb(result);
    }
  );
};

var addCategory = (d, cb) => {
  con.query(
    "INSERT INTO category (type_id, category) VALUES (?, ?)",
    [d.type_id, d.category],
    (err, result) => {
      if (err) throw err;
      cb(result.affectedRows);
    }
  );
};

var getSiteDetail = (id, cb) => {
  con.query("SELECT * FROM site WHERE site_id = ?", [id], (err, result) => {
    if (err) throw err;
    cb(result[0]);
  });
};

var getSitesByCategory = (category_id, cb) => {
  con.query(
    "SELECT pe.category, pe.type as format, spe.measurement, spe.bd_rate, spe.sales_rate, s.* FROM site s LEFT JOIN site_possible_execution spe ON s.site_id = spe.site_id LEFT JOIN possible_execution pe ON pe.possible_execution_id = spe.possible_execution_id WHERE s.category_id = ? AND s.is_archived = 0",
    [category_id],
    (err, result) => {
      if (err) throw err;
      cb(result);
    }
  );
};

var getPossibleExecution = cb => {
  con.query("SELECT * FROM possible_execution", (err, result) => {
    if (err) throw err;
    cb(result);
  });
};

var addPossibleExecution = (d, cb) => {
  con.query(
    "INSERT INTO possible_execution (category, type) VALUES (?, ?)",
    [d.category, d.type],
    (err, result) => {
      if (err) throw err;
      cb(result.affectedRows);
    }
  );
};

var addSite = (d, cb) => {
  con.query(
    "INSERT INTO site (category_id, sub_category, type, site, address, municipality, province, region, latitude, longitude, foot_traffic, contact_person, designation, contact_number, email_address, officer_name, rental_rate, contract_duration_from, contract_duration_to, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      d.category_id,
      d.sub_category,
      d.type,
      d.site,
      d.address,
      d.municipality,
      d.province,
      d.region,
      d.latitude,
      d.longitude,
      d.foot_traffic,
      d.contact_person,
      d.designation,
      d.contact_number,
      d.email_address,
      d.officer_name,
      d.rental_rate,
      d.contract_duration_from,
      d.contract_duration_to,
      d.remark
    ],
    (err, result) => {
      if (err) throw err;
      if (d.possible_execution.length > 0) {
        let query = "";
        for (var i = 0; i < d.possible_execution.length; i++) {
          query +=
            "INSERT INTO site_possible_execution (site_id, possible_execution_id, measurement, bd_rate) VALUES (" +
            result.insertId +
            ", " +
            d.possible_execution[i].possible_execution_id +
            ", '" +
            d.possible_execution[i].measurement +
            "', " +
            d.possible_execution[i].bd_rate +
            "); ";
        }
        con.query(query, (err2, result2) => {
          if (err2) throw err2;
        });
      } else {
        cb(result.insertId);
      }
    }
  );
};

var login = (d, cb) => {
  con.query(
    "SELECT * FROM user WHERE email = ? AND password = ?",
    [d.email, d.password],
    (err, result) => {
      if (err) throw err;
      cb(result[0]);
    }
  );
};

var getSites = cb => {
  con.query("SELECT * FROM site WHERE is_archived = 0", (err, result) => {
    if (err) throw err;
    cb(result);
  });
};

var addLog = (user_id, log, data, request_header, geo, mac_address, device) => {
  con.query(
    "INSERT INTO user_log (user_id, log, data, request_header, geo, mac_address, device, date_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      user_id,
      log,
      data,
      request_header,
      geo,
      mac_address,
      device,
      moment().format("YYYY/MM/DD HH:mm:ss")
    ],
    (err, result) => {
      if (err) throw err;
      if (result.affectedRows > 0) {
        console.log("Added a log!");
      }
    }
  );
};

var updateSiteDetail = (d, cb) => {
  con.query(
    "UPDATE site SET sub_category = ?, site = ?, foot_traffic = ?, rental_rate = ?, contract_duration_from = ?, contract_duration_to = ?, remark = ?, region = ?, province = ?, municipality = ?, address = ?, latitude = ?, longitude = ?, contact_person = ?, designation = ?, contact_number = ?, email_address = ?, officer_name = ? WHERE site_id = ?",
    [
      d.sub_category,
      d.site,
      d.foot_traffic,
      d.rental_rate,
      d.contract_duration_from,
      d.contract_duration_to,
      d.remark,
      d.region,
      d.province,
      d.municipality,
      d.address,
      d.latitude,
      d.longitude,
      d.contact_person,
      d.designation,
      d.contact_number,
      d.email_address,
      d.officer_name,
      d.site_id
    ],
    (err, result) => {
      if (err) throw err;
      if (d.type == "property") {
        con.query(
          "UPDATE site_possible_execution SET bd_rate = ? WHERE site_id = ?",
          [d.rental_rate, d.site_id],
          (err2, result2) => {
            if (err2) throw err2;
          }
        );
      }
      cb(result.affectedRows);
    }
  );
};

var deleteSite = (d, cb) => {
  con.query(
    "UPDATE site SET is_archived = 1 WHERE site_id = ?",
    [d.site_id],
    (err, result) => {
      if (err) throw err;
      cb(result.affectedRows);
    }
  );
};

var getSitePossibleExecutions = (site_id, cb) => {
  con.query(
    "SELECT pe.category, pe.type, spe.* FROM `site_possible_execution` spe JOIN `possible_execution` pe ON spe.possible_execution_id = pe.possible_execution_id WHERE spe.site_id = ?",
    [site_id],
    (err, result) => {
      if (err) throw err;
      cb(result);
    }
  );
};

var updateSitePossibleExecution = (d, cb) => {
  con.query(
    "UPDATE site_possible_execution SET measurement = ?, bd_rate = ? WHERE spe_id = ?",
    [d.measurement, d.bd_rate, d.spe_id],
    (err, result) => {
      if (err) throw err;
      cb(result.affectedRows);
    }
  );
};

var updateSitePossibleExecutionSalesRate = (d, cb) => {
  con.query(
    "UPDATE site_possible_execution SET production_rate = ?, sales_rate = ? WHERE spe_id = ?",
    [d.production_rate, d.sales_rate, d.spe_id],
    (err, result) => {
      if (err) throw err;
      cb(result.affectedRows);
    }
  );
};

var addSitePhoto = (site_id, url, cb) => {
  con.query(
    "INSERT INTO site_photo (site_id, url) VALUES (?, ?)",
    [site_id, url],
    (err, result) => {
      if (err) throw err;
      cb(result.affectedRows);
    }
  );
};

var getSitePhotos = (site_id, cb) => {
  con.query(
    "SELECT * FROM site_photo WHERE site_id = ?",
    [site_id],
    (err, result) => {
      if (err) throw err;
      cb(result);
    }
  );
};

var deleteSitePhoto = (photo_id, cb) => {
  con.query(
    "DELETE FROM site_photo WHERE photo_id = ?",
    photo_id,
    (err, result) => {
      if (err) throw err;
      cb(result.affectedRows);
    }
  );
};

var addSitePastProjectPhoto = (site_id, url, cb) => {
  con.query(
    "INSERT INTO site_past_project_execution (site_id, url) VALUES (?, ?)",
    [site_id, url],
    (err, result) => {
      if (err) throw err;
      cb(result.affectedRows);
    }
  );
};

var getSitePastProjectPhotos = (site_id, cb) => {
  con.query(
    "SELECT * FROM site_past_project_execution WHERE site_id = ?",
    [site_id],
    (err, result) => {
      if (err) throw err;
      cb(result);
    }
  );
};

var deleteSitePastProjectPhoto = (photo_id, cb) => {
  con.query(
    "DELETE FROM site_past_project_execution WHERE photo_id = ?",
    photo_id,
    (err, result) => {
      if (err) throw err;
      cb(result.affectedRows);
    }
  );
};

var addSitePossibleExecution = (d, cb) => {
  var query = "";
  for (var i = 0; i < d.possible_execution.length; i++) {
    query +=
      "INSERT INTO site_possible_execution (site_id, possible_execution_id, measurement, bd_rate) VALUES (" +
      d.site_id +
      ", " +
      d.possible_execution[i].possible_execution_id +
      ", '" +
      d.possible_execution[i].measurement +
      "', " +
      d.possible_execution[i].bd_rate +
      "); ";
  }

  con.query(query, (err, result) => {
    if (err) throw err;
    cb(1);
  });
};

var deleteSitePossibleExecution = (spe_id, cb) => {
  con.query(
    "DELETE FROM site_possible_execution WHERE spe_id = ?",
    spe_id,
    (err, result) => {
      if (err) throw err;
      cb(result.affectedRows);
    }
  );
};

var getAllSites = cb => {
  con.query(
    "SELECT c.category, s.* FROM site s JOIN category c ON s.category_id = c.category_id WHERE s.is_archived = 0",
    (err, result) => {
      if (err) throw err;
      cb(result);
    }
  );
};

var getAllCategoryWithType = cb => {
  con.query(
    "SELECT t.*, c.category_id, c.category FROM category c JOIN type t ON c.type_id = t.type_id",
    (err, result) => {
      if (err) throw err;
      cb(result);
    }
  );
};

var getAllSitePhotos = cb => {
  con.query("SELECT * FROM site_photo", (err, result) => {
    if (err) throw err;
    cb(result);
  });
};

var getAllSiteProjectPhotos = cb => {
  con.query("SELECT * FROM site_past_project_execution", (err, result) => {
    if (err) throw err;
    cb(result);
  });
};

var getAllSitePossibleExecution = cb => {
  con.query(
    "SELECT s.site_id, s.site, s.latitude, s.longitude, pe.category, pe.type, spe.measurement, spe.bd_rate, spe.sales_rate FROM `possible_execution` pe JOIN `site_possible_execution` spe ON pe.possible_execution_id = spe.possible_execution_id JOIN `site` s ON spe.site_id = s.site_id",
    (err, result) => {
      if (err) throw err;
      cb(result);
    }
  );
};

var getAllArchivedSites = cb => {
  con.query(
    "SELECT pe.category, pe.type as format, spe.measurement, spe.bd_rate, spe.sales_rate, s.* FROM site s LEFT JOIN site_possible_execution spe ON s.site_id = spe.site_id LEFT JOIN possible_execution pe ON pe.possible_execution_id = spe.possible_execution_id WHERE s.is_archived = 1",
    (err, result) => {
      if (err) throw err;
      cb(result);
    }
  );
};

var restoreArchivedSite = (id, cb) => {
  con.query(
    "UPDATE site SET is_archived = 0 WHERE site_id = ?",
    [id],
    (err, result) => {
      if (err) throw err;
      cb(result.affectedRows);
    }
  );
};

var getUserNotification = (id, cb) => {
  con.query("SELECT un.un_id, n.type, n.text, n.link, n.date_time, un.is_seen, un.count FROM user_notification un JOIN notification n ON un.notification_id = n.notification_id WHERE un.user_id = ? ORDER BY n.date_time DESC",
    [id],
    (err, result) => {
      if (err) throw err;
      cb(result);
    })
}

var updateUserNotificationSeen = (id, cb) => {
  con.query("UPDATE user_notification SET is_seen = 1 WHERE un_id = ?",
    [id],
    (err, result) => {
      if (err) throw err;
      cb(1);
    })
}

var updateUserNotificationCount = (id, cb) => {
  con.query("UPDATE user_notification SET count = 0 WHERE user_id = ?",
    [id],
    (err, result) => {
      if (err) throw err;
      cb(1)
    })
}

var broadcastNotification = (nid) => {
  con.query("SELECT user_id FROM user", (err1, result1) => {
    if (err1) throw err1;
    let queryString = "";
    for (var i = 0; i < result1.length; i++) {
      const uid = result1[i].user_id;
      queryString += "INSERT INTO user_notification(user_id, notification_id, is_seen, count) VALUES (" + uid + ", " + nid + ", 0, 1);";
    }
    con.query(queryString, (err2, result2) => {
      if (err2) throw err2;
      console.log("Notification sent to " + result2.length + " users.");
    })
  })
}

var createNotification = (d) => {
  con.query("INSERT INTO notification(type, text, link, date_time) VALUES (?, ?, ?, ?)",
    [
      d.type,
      d.text,
      d.link,
      moment().format("YYYY/MM/DD HH:mm:ss")
    ],
    (err, result) => {
      if (err) throw err;
      broadcastNotification(result.insertId);
      if (result) {
        console.log("Notification created.");
      }
    })
}

module.exports = {
  getType,
  getTypes,
  getCategory,
  getCategories,
  addPossibleExecution,
  addCategory,
  getSiteDetail,
  getSitesByCategory,
  getPossibleExecution,
  addSite,
  login,
  getSites,
  addLog,
  updateSiteDetail,
  deleteSite,
  getSitePossibleExecutions,
  updateSitePossibleExecution,
  updateSitePossibleExecutionSalesRate,
  addSitePhoto,
  getSitePhotos,
  deleteSitePhoto,
  addSitePastProjectPhoto,
  getSitePastProjectPhotos,
  deleteSitePastProjectPhoto,
  addSitePossibleExecution,
  deleteSitePossibleExecution,
  getAllSites,
  getAllCategoryWithType,
  getAllSitePhotos,
  getAllSiteProjectPhotos,
  getAllSitePossibleExecution,
  getAllArchivedSites,
  restoreArchivedSite,
  getUserNotification,
  updateUserNotificationSeen,
  updateUserNotificationCount,
  createNotification
};
