var map,
  markers = [],
  infoWindow = null,
  siteData = [],
  siteCategories = [],
  sitePhotos = [],
  siteProjectPhotos = [],
  possibleExecutions = [],
  selectedFilters = [],
  filteredSites = [],
  filtering = false;

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

$("#siteModal").on("hidden.bs.modal", function (e) {
  $("#possibleExecutionPhotos").fadeOut(150, function () {
    $("#possibleExecutionTable").fadeIn(150);
  });
});

$("#btnBackToPossibleExecution").click(function () {
  $("#possibleExecutionPhotos").fadeOut(150, function () {
    $("#possibleExecutionTable").fadeIn(150);
  });
});

function openPossibleExecutionPhotos(id) {
  var photos = [],
    projectPhotos = [],
    spDiv = $("#sitePhotosDiv"),
    sppDiv = $("#siteProjectPhotosDiv");
  for (var i = 0; i < sitePhotos.length; i++) {
    if (id == sitePhotos[i].site_id) {
      photos.push(sitePhotos[i]);
    }
  }

  for (var i = 0; i < siteProjectPhotos.length; i++) {
    if (id == siteProjectPhotos[i].site_id) {
      projectPhotos.push(siteProjectPhotos[i]);
    }
  }

  var spList = "";
  if (photos.length > 0) {
    for (var i = 0; i < photos.length; i++) {
      spList +=
        '<div class="col-md-4 mt-3"><img class="lazyload w-100" data-darkbox="' +
        photos[i].url +
        '" data-darkbox-group="possible-execution" src="' +
        photos[i].url +
        '"></div>';
    }
  } else {
    spList +=
      "<small class='col-md-12 mt-3'>No photo uploaded yet in this site. Please inform Business Development to add. Thanks!</small>";
  }

  var sppList = "";
  if (projectPhotos.length > 0) {
    for (var i = 0; i < projectPhotos.length; i++) {
      sppList +=
        '<div class="col-md-4 mt-3"><img class="lazyload w-100" data-darkbox="' +
        projectPhotos[i].url +
        '" data-darkbox-group="past-project" src="' +
        projectPhotos[i].url +
        '"></div>';
    }
  } else {
    sppList +=
      "<small class='col-md-12 mt-3'>No past project photo uploaded yet in this site. Please inform Business Development to add. Thanks!</small>";
  }

  for (var i = 0; i < possibleExecutions.length; i++) {
    var pe = possibleExecutions[i];
    if (id == pe.site_id) {
      var measurement =
        pe.measurement.replace(/\s/g, "") != "" ? " " + pe.measurement : "";
      $("#possibleExecutionPhotoTitle").html(
        "<b>" + pe.site + "</b> " + toTitleCase(pe.type) + measurement
      );
      break;
    }
  }
  spDiv.html(spList);
  sppDiv.html(sppList);

  $("#possibleExecutionTable").fadeOut(150, function () {
    $("#possibleExecutionPhotos").fadeIn(150);
  });
}

function openSiteModal(id) {
  var userDepartment = $("#loading-screen").html();
  var details,
    executions = [],
    photos = [],
    projectPhotos = [],
    crlInd = $("#carousel-indicators"),
    crlInn = $("#carousel-inner"),
    mt = $("#siteModalTitle"),
    t = $("#dType"),
    c = $("#dCategory"),
    sc = $("#dSubCategory"),
    n = $("#dName"),
    ft = $("#dFootTraffic"),
    reg = $("#dRegion"),
    prov = $("#dProvince"),
    mun = $("#dMunicipality"),
    address = $("#dAddress"),
    peb = $("#possibleExecutionBody");

  for (var i = 0; i < siteData.length; i++) {
    if (id == siteData[i].site_id) {
      details = siteData[i];
    }
  }

  for (var i = 0; i < sitePhotos.length; i++) {
    if (id == sitePhotos[i].site_id) {
      photos.push(sitePhotos[i]);
    }
  }

  for (var i = 0; i < siteProjectPhotos.length; i++) {
    if (id == siteProjectPhotos[i].site_id) {
      projectPhotos.push(siteProjectPhotos[i]);
    }
  }

  for (var i = 0; i < possibleExecutions.length; i++) {
    if (
      details.latitude == possibleExecutions[i].latitude &&
      details.longitude == possibleExecutions[i].longitude
    ) {
      executions.push(possibleExecutions[i]);
    }
  }

  var executionList = "";
  if (executions.length > 0) {
    for (var i = 0; i < executions.length; i++) {
      var e = executions[i],
        rate,
        sales_rate =
          e.sales_rate != undefined ? e.sales_rate.toLocaleString() : "0",
        measurement =
          e.measurement.replace(/\s/g, "") != "" ? e.measurement : "-";

      if (userDepartment == "Business Development") {
        rate = "<td>P " + e.bd_rate.toLocaleString() + "</td>";
      } else if (userDepartment == "Sales") {
        rate = "<td>P " + sales_rate + "</td>";
      } else if (userDepartment == "Executives") {
        rate =
          "<td>P " +
          e.bd_rate.toLocaleString() +
          "</td><td>P " +
          sales_rate +
          "</td>";
      } else {
        rate = "";
      }

      executionList +=
        "<tr><td scope='row'>" +
        (i + 1) +
        "</td><td>" +
        toTitleCase(e.type) +
        "</td><td>" +
        measurement +
        "</td>" +
        rate +
        "<td><button class='btn btn-sm btn-info' title='View Photos' onclick='openPossibleExecutionPhotos(" +
        e.site_id +
        ")'><i class='fas fa-image'></i></button></td></tr>";
    }
  } else {
    executionList +=
      "<tr><th scope='row' colspan='5'>No possible execution found in this site. Please contact Business Development to add.</th></tr>";
  }

  var crlIndList = "";
  for (var i = 0; i < photos.length; i++) {
    if (i == 0) {
      crlIndList +=
        '<li data-target="#sitePhotoIndicators" data-slide-to="' +
        i +
        '" class="active"></li>';
    } else {
      crlIndList +=
        '<li data-target="#sitePhotoIndicators" data-slide-to="' +
        i +
        '"></li>';
    }
  }

  var crlInnList = "";
  if (photos.length > 0) {
    for (var i = 0; i < photos.length; i++) {
      if (i == 0) {
        crlInnList +=
          '<div class="carousel-item active"><img class="lazyload d-block w-100" data-src="' +
          photos[i].url +
          '" src="' +
          photos[i].url +
          '" height="320"></div>';
      } else {
        crlInnList +=
          '<div class="carousel-item"><img class="lazyload d-block w-100" data-src="' +
          photos[i].url +
          '" src="' +
          photos[i].url +
          '" height="320"></div>';
      }
    }
  }

  crlInd.html(crlIndList);
  crlInn.html(crlInnList);
  peb.html(executionList);
  $(".carousel").carousel();
  mt.html(details.site);
  t.html(toTitleCase(details.type));
  c.html(toTitleCase(details.category));
  sc.html(details.sub_category);
  n.html(details.site);
  ft.html(details.foot_traffic.toLocaleString());
  reg.html(details.region);
  prov.html(details.province);
  mun.html(details.municipality);
  address.html(toTitleCase(details.address));
  $("#siteModal").modal("show");
}

function imageString(path) {
  var image_url;
  if (path !== "") {
    image_url =
      '<img class="lazyload w-100" src="' +
      path +
      '" data-src="' +
      path +
      '" alt="" style="max-width:300px; max-height: 200px"></img>';
  } else {
    image_url =
      '<img class="lazyload w-100" src="img/default.jpg" alt="" style="max-width:300px max-height: 200px"></img>';
  }
  return image_url;
}

function viewSiteInfo(
  marker,
  type,
  category_id,
  site_id,
  category,
  sub_category,
  siteName,
  footTraffic,
  address,
  municipality,
  province,
  region
) {
  var content = "";

  if (infoWindow) {
    infoWindow.close();
  }

  var imagePath = "";
  for (var i = 0; i < sitePhotos.length; i++) {
    if (site_id == sitePhotos[i].site_id) {
      imagePath = sitePhotos[i].url;
      break;
    }
  }

  content =
    "<div class='scrollFix map-info-window'><h5>" +
    siteName +
    "</h5>" +
    imageString(imagePath) +
    "<hr/><table><tr><td class='miw-c1'>Type: </td><td class='miw-c2'>" +
    toTitleCase(type) +
    "</td></tr><tr><td class='miw-c1'>Category: </td><td class='miw-c2'>" +
    toTitleCase(category) +
    "</td></tr><tr><td class='miw-c1'>Sub Category: </td><td class='miw-c2'>" +
    sub_category +
    "</td></tr><tr><td class='miw-c1'>Address: </td><td class='miw-c2'>" +
    toTitleCase(address + ", " + municipality + ", " + province) +
    "</td></tr><tr><td class='miw-c1'>Region: </td><td class='miw-c2'>" +
    region +
    "</td></tr><tr><td class='miw-c1'>Foot Traffic: </td><td class='miw-c2'>" +
    footTraffic.toLocaleString() +
    "</td></tr></table><br/><button class='btn btn-sm btn-info' onclick='openSiteModal(" +
    site_id +
    ")'>View Full Details</button></div>";

  infoWindow = new google.maps.InfoWindow({
    minWidth: 300,
    maxWidth: 300,
    content: content
  });

  infoWindow.open(map, marker);
}

function categoryMarkerIcon(category) {
  var icon = "";
  if (category == "aircast") {
    icon = "/img/markers/aircast.png";
  } else if (category == "large format") {
    icon = "/img/markers/large-format.png";
  } else if (category == "lighted lamp post") {
    icon = "/img/markers/lighted-lamp-post.png";
  } else if (category == "footbridge") {
    icon = "/img/markers/footbridge.png";
  } else if (category == "waiting shed") {
    icon = "/img/markers/waiting-shed.png";
  } else if (category == "gasoline station") {
    icon = "/img/markers/gasoline-station.png";
  } else if (category == "public market") {
    icon = "/img/markers/public-market.png";
  } else if (category == "hospitals") {
    icon = "/img/markers/hospitals.png";
  } else if (category == "clinics") {
    icon = "/img/markers/clinics.png";
  } else if (category == "corporate offices") {
    icon = "/img/markers/corporate-offices.png";
  } else if (category == "government offices") {
    icon = "/img/markers/government-offices.png";
  } else if (category == "supermarkets") {
    icon = "/img/markers/supermarkets.png";
  } else if (category == "malls") {
    icon = "/img/markers/malls.png";
  } else if (category == "terminals") {
    icon = "/img/markers/terminals.png";
  } else if (category == "universities") {
    icon = "/img/markers/universities.png";
  } else if (category == "villages") {
    icon = "/img/markers/villages.png";
  } else if (category == "public transportation") {
    icon = "/img/markers/public-transportation.png";
  } else if (category == "convenience store") {
    icon = "/img/markers/convenience-store.png";
  } else {
    icon = "/img/markers/default.png";
  }
  return icon;
}

function addMarkers(d, timeout) {
  var latlong = { lat: parseFloat(d.latitude), lng: parseFloat(d.longitude) };
  setTimeout(() => {
    var marker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: latlong,
      map: map,
      icon: categoryMarkerIcon(d.category),
      title: d.site
    });
    google.maps.event.addListener(marker, "click", function (event) {
      viewSiteInfo(
        marker,
        d.type,
        d.category_id,
        d.site_id,
        d.category,
        d.sub_category,
        d.site,
        d.foot_traffic,
        d.address,
        d.municipality,
        d.province,
        d.region
      );
    });
    markers.push(marker);
    $("#txtTotalSites").html(markers.length.toLocaleString());
    if (filtering == true) {
      if (filteredSites.length == markers.length) {
        $("#btnFilter").removeAttr("disabled");
        filtering = false;
        $("#loading-screen").fadeOut(150);
      } else if (siteData.length == markers.length) {
        $("#btnFilter").removeAttr("disabled");
        filtering = false;
        $("#loading-screen").fadeOut(150);
      }
    }
  }, timeout);
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

function setFilterMunicipalityCity() {
  var provinceVal = $("#selectFilterProvince").val();
  var municipalityCity = $("#selectFilterMunicipalityCity");
  municipalityCity.html("");

  var municipalityCityList = "<option value='all'>All</option>";

  for (var i = 0; i < cities.length; i++) {
    if (provinceVal == cities[i].province) {
      municipalityCityList +=
        "<option value='" + cities[i].key + "'>" + cities[i].name + "</option>";
    }
  }
  municipalityCity.html(municipalityCityList);
}

function setFilterProvince() {
  var regionVal = $("#selectFilterRegion").val();
  var province = $("#selectFilterProvince");
  province.html("");

  var provinceList = "<option value='all'>All</option>";

  for (var i = 0; i < provinces.length; i++) {
    if (regionVal == provinces[i].region) {
      provinceList +=
        "<option value='" +
        provinces[i].key +
        "'>" +
        provinces[i].name +
        "</option>";
    }
  }
  province.html(provinceList);
  setFilterMunicipalityCity();
}

function setFilterRegion() {
  var region = $("#selectFilterRegion");
  region.html("");

  var regionList = "<option value='all'>All</option>";

  for (var i = 0; i < regions.length; i++) {
    if (regions[i].name == "NCR") {
      regionList +=
        "<option value='" +
        regions[i].key +
        "' selected>" +
        regions[i].name +
        "</option>";
    } else {
      regionList +=
        "<option value='" +
        regions[i].key +
        "'>" +
        regions[i].name +
        "</option>";
    }
  }
  region.html(regionList);
  setFilterProvince();
}

setFilterRegion();

function setFilterCategory() {
  var typeVal = $("#selectFilterType").val();
  var category = $("#selectFilterCategory");
  category.html("");

  var categoryList = "<option value='all'>All</option>";

  for (var i = 0; i < siteCategories.length; i++) {
    if (typeVal == siteCategories[i].type) {
      categoryList +=
        "<option value='" +
        siteCategories[i].category_id +
        "'>" +
        siteCategories[i].category +
        "</option>";
    }
  }
  category.html(categoryList);
}

function filterSites() {
  filteredSites = [];
  clearMarkers();
  filtering = true;
  $("#loading-screen").fadeIn(150);
  // $("html, body").animate(
  //   {
  //     scrollTop: $("#map").offset().top
  //   },
  //   500,
  //   "linear"
  // );
  $("#btnFilter").attr("disabled", "disabled");
  var onFilterSites = siteData;
  var r = $("#selectFilterRegion option:selected").html(),
    p = $("#selectFilterProvince option:selected").html(),
    m = $("#selectFilterMunicipalityCity option:selected").html(),
    t = $("#selectFilterType").val(),
    c = $("#selectFilterCategory").val();
  for (var x = 0; x < onFilterSites.length; x++) {
    var d = onFilterSites[x],
      isLatLongSeen = false;
    if (r != "All") {
      if (r == d.region) {
        if (p != "All") {
          if (p == d.province) {
            if (m != "All") {
              if (m == d.municipality) {
                if (t != "all") {
                  if (t == d.type) {
                    if (c != "all") {
                      if (c == d.category_id) {
                        for (var i = 0; i < filteredSites.length; i++) {
                          if (
                            d.latitude == filteredSites[i].latitude &&
                            d.longitude == filteredSites[i].longitude
                          ) {
                            isLatLongSeen = true;
                          }
                        }
                        if (!isLatLongSeen) {
                          filteredSites.push(d);
                        }
                      }
                    } else {
                      for (var i = 0; i < filteredSites.length; i++) {
                        if (
                          d.latitude == filteredSites[i].latitude &&
                          d.longitude == filteredSites[i].longitude
                        ) {
                          isLatLongSeen = true;
                        }
                      }
                      if (!isLatLongSeen) {
                        filteredSites.push(d);
                      }
                    }
                  }
                } else {
                  for (var i = 0; i < filteredSites.length; i++) {
                    if (
                      d.latitude == filteredSites[i].latitude &&
                      d.longitude == filteredSites[i].longitude
                    ) {
                      isLatLongSeen = true;
                    }
                  }
                  if (!isLatLongSeen) {
                    filteredSites.push(d);
                  }
                }
              }
            } else {
              if (t != "all") {
                if (t == d.type) {
                  if (c != "all") {
                    if (c == d.category_id) {
                      for (var i = 0; i < filteredSites.length; i++) {
                        if (
                          d.latitude == filteredSites[i].latitude &&
                          d.longitude == filteredSites[i].longitude
                        ) {
                          isLatLongSeen = true;
                        }
                      }
                      if (!isLatLongSeen) {
                        filteredSites.push(d);
                      }
                    }
                  } else {
                    for (var i = 0; i < filteredSites.length; i++) {
                      if (
                        d.latitude == filteredSites[i].latitude &&
                        d.longitude == filteredSites[i].longitude
                      ) {
                        isLatLongSeen = true;
                      }
                    }
                    if (!isLatLongSeen) {
                      filteredSites.push(d);
                    }
                  }
                }
              } else {
                for (var i = 0; i < filteredSites.length; i++) {
                  if (
                    d.latitude == filteredSites[i].latitude &&
                    d.longitude == filteredSites[i].longitude
                  ) {
                    isLatLongSeen = true;
                  }
                }
                if (!isLatLongSeen) {
                  filteredSites.push(d);
                }
              }
            }
          }
        } else {
          if (t != "all") {
            if (t == d.type) {
              if (c != "all") {
                if (c == d.category_id) {
                  for (var i = 0; i < filteredSites.length; i++) {
                    if (
                      d.latitude == filteredSites[i].latitude &&
                      d.longitude == filteredSites[i].longitude
                    ) {
                      isLatLongSeen = true;
                    }
                  }
                  if (!isLatLongSeen) {
                    filteredSites.push(d);
                  }
                }
              } else {
                for (var i = 0; i < filteredSites.length; i++) {
                  if (
                    d.latitude == filteredSites[i].latitude &&
                    d.longitude == filteredSites[i].longitude
                  ) {
                    isLatLongSeen = true;
                  }
                }
                if (!isLatLongSeen) {
                  filteredSites.push(d);
                }
              }
            }
          } else {
            for (var i = 0; i < filteredSites.length; i++) {
              if (
                d.latitude == filteredSites[i].latitude &&
                d.longitude == filteredSites[i].longitude
              ) {
                isLatLongSeen = true;
              }
            }
            if (!isLatLongSeen) {
              filteredSites.push(d);
            }
          }
        }
      }
    } else {
      if (t != "all") {
        if (t == d.type) {
          if (c != "all") {
            if (c == d.category_id) {
              for (var i = 0; i < filteredSites.length; i++) {
                if (
                  d.latitude == filteredSites[i].latitude &&
                  d.longitude == filteredSites[i].longitude
                ) {
                  isLatLongSeen = true;
                }
              }
              if (!isLatLongSeen) {
                filteredSites.push(d);
              }
            }
          } else {
            for (var i = 0; i < filteredSites.length; i++) {
              if (
                d.latitude == filteredSites[i].latitude &&
                d.longitude == filteredSites[i].longitude
              ) {
                isLatLongSeen = true;
              }
            }
            if (!isLatLongSeen) {
              filteredSites.push(d);
            }
          }
        }
      } else {
        for (var i = 0; i < filteredSites.length; i++) {
          if (
            d.latitude == filteredSites[i].latitude &&
            d.longitude == filteredSites[i].longitude
          ) {
            isLatLongSeen = true;
          }
        }
        if (!isLatLongSeen) {
          filteredSites.push(d);
        }
      }
    }
  }
  var center;

  if (r == "All") {
    map.setZoom(6);
    center = { lat: 11.79252, lng: 123.082396 };
  } else if (r == "NCR") {
    map.setZoom(11);
    center = { lat: 14.567456, lng: 121.026135 };
  } else if (r == "CAR") {
    map.setZoom(8);
    center = { lat: 17.345229, lng: 121.062324 };
  } else if (r == "Region I") {
    map.setZoom(8);
    center = { lat: 17.040916, lng: 120.481166 };
  } else if (r == "Region II") {
    map.setZoom(8);
    center = { lat: 16.998332, lng: 121.965007 };
  } else if (r == "Region III") {
    map.setZoom(10);
    center = { lat: 15.359587, lng: 120.773761 };
  } else if (r == "Region IV-A") {
    map.setZoom(10);
    center = { lat: 14.109504, lng: 121.572498 };
  } else if (r == "Region IV-B") {
    map.setZoom(7);
    center = { lat: 10.931521, lng: 119.385567 };
  } else if (r == "Region V") {
    map.setZoom(9);
    center = { lat: 13.325094, lng: 123.484243 };
  } else if (r == "Region VI") {
    map.setZoom(9);
    center = { lat: 10.649696, lng: 122.675997 };
  } else if (r == "Region VII") {
    map.setZoom(9);
    center = { lat: 9.917772, lng: 123.659578 };
  } else if (r == "Region VIII") {
    map.setZoom(8);
    center = { lat: 11.453989, lng: 125.030665 };
  } else if (r == "Region IX") {
    map.setZoom(9);
    center = { lat: 7.845058, lng: 122.744684 };
  } else if (r == "Region X") {
    map.setZoom(9);
    center = { lat: 8.127291, lng: 124.621811 };
  } else if (r == "Region XI") {
    map.setZoom(9);
    center = { lat: 6.883283, lng: 125.765608 };
  } else if (r == "Region XII") {
    map.setZoom(9);
    center = { lat: 6.505986, lng: 124.785843 };
  } else if (r == "Region XIII") {
    map.setZoom(9);
    center = { lat: 8.705471, lng: 125.711096 };
  } else if (r == "ARMM") {
    map.setZoom(8);
    center = { lat: 6.4063269, lng: 119.2868908 };
  }
  map.panTo(center);

  if (filteredSites.length > 0) {
    for (var i = 0; i < filteredSites.length; i++) {
      addMarkers(filteredSites[i], i * 7.5);
    }
  } else {
    $("#txtTotalSites").html(filteredSites.length.toLocaleString());
    $("#btnFilter").removeAttr("disabled");
    filtering = false;
    $("#loading-screen").fadeOut(150);
  }
}

var chevDown = true;
$("#btnMapFiltersCollapse").click(function () {
  if (chevDown) {
    $("#btnFilterChevron").removeClass("fa-chevron-down");
    $("#btnFilterChevron").addClass("fa-chevron-up");
    chevDown = false;
  } else {
    $("#btnFilterChevron").removeClass("fa-chevron-up");
    $("#btnFilterChevron").addClass("fa-chevron-down");
    chevDown = true;
  }
  $("#btnFilterChevron");
});

function getAllSitePossibleExecution() {
  $.ajax({
    url: "/api/home/possible-executions",
    method: "get",
    success: function (res) {
      var d = res.executions;
      possibleExecutions = d;
    }
  });
}

function getAllSiteProjectPhotos() {
  getAllSitePossibleExecution();
  $.ajax({
    url: "/api/home/site-project-photos",
    method: "get",
    success: function (res) {
      var d = res.photos;
      siteProjectPhotos = d;
    }
  });
}

function getAllSitePhotos() {
  getAllSiteProjectPhotos();
  $.ajax({
    url: "/api/home/site-photos",
    method: "get",
    success: function (res) {
      var d = res.photos;
      sitePhotos = d;
    }
  });
}

function getAllCategories() {
  getAllSitePhotos();
  $.ajax({
    url: "/api/home/categories",
    method: "get",
    success: function (res) {
      var d = res.categories;
      siteCategories = d;
    }
  });
}

function getAllSites() {
  filtering = true;
  $("#btnFilter").attr("disabled", "disabled");
  getAllCategories();
  $.ajax({
    url: "/api/home/sites",
    method: "get",
    success: function (res) {
      var d = res.sites;
      siteData = d;
      filterSites();
    }
  });
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 14.567456, lng: 121.026135 },
    zoom: 11,
    fullscreenControl: false
  });

  google.maps.event.addListener(map, "click", function () {
    infoWindow.close();
  });

  getAllSites();
}

lazyload();
