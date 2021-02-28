var isLocationRegionProvinceMunicipalityChanged = false;
$(document).ready(function() {
  toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: true,
    positionClass: "toast-bottom-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "500",
    timeOut: "1500",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
  };

  if ($('[type="date"]').prop("type") != "date") {
    $('[type="date"]').datepicker();
  }

  isLocationRegionProvinceMunicipalityChanged = false;
});

lazyload();

$("#txtSitePhotoTab").val("" + window.location.href);
$("#txtPastProjectPhotoTab").val("" + window.location.href);

var siteDetails = {};

var possibleExecution = [];
var selectedPossibleExecution = [];

function setLocationHasChanged() {
  isLocationRegionProvinceMunicipalityChanged = true;
}

function setMunicipalityCity() {
  var provinceVal = $("#selectProvince").val();
  var municipalityCity = $("#selectMunicipalityCity");
  municipalityCity.html("");

  var municipalityCityList = "";

  for (var i = 0; i < cities.length; i++) {
    if (provinceVal == cities[i].province) {
      municipalityCityList +=
        "<option value='" + cities[i].key + "'>" + cities[i].name + "</option>";
    }
  }
  municipalityCity.html(municipalityCityList);
  setLocationHasChanged();
}

function setProvince() {
  var regionVal = $("#selectRegion").val();
  var province = $("#selectProvince");
  province.html("");

  var provinceList = "";

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
  setMunicipalityCity();
  setLocationHasChanged();
}

function setRegion() {
  var region = $("#selectRegion");
  region.html("");

  var regionList = "";

  for (var i = 0; i < regions.length; i++) {
    regionList +=
      "<option value='" + regions[i].key + "'>" + regions[i].name + "</option>";
  }
  region.html(regionList);
  setProvince();
}

function setPossibleExecutionFormat() {
  var pecVal = $("#selectPossibleExecutionCategory").val();
  var pef = $("#selectPossibleExecutionFormat");
  pef.html("");

  var pefList = "";
  for (var i = 0; i < possibleExecution.length; i++) {
    if (pecVal == possibleExecution[i].category) {
      for (var x = 0; x < possibleExecution[i].type.length; x++) {
        pefList +=
          "<option value='" +
          possibleExecution[i].type[x].id +
          "'>" +
          possibleExecution[i].type[x].format +
          "</option>";
      }
    }
  }
  pef.html(pefList);
}

function setPossibleExecutionCategory() {
  var pec = $("#selectPossibleExecutionCategory");
  pec.html("");
  var aec = $("#addExecutionCategory");
  aec.html("");

  var pecList = "";

  for (var i = 0; i < possibleExecution.length; i++) {
    pecList +=
      "<option value='" +
      possibleExecution[i].category +
      "'>" +
      possibleExecution[i].category +
      "</option>";
  }
  pec.html(pecList);
  aec.html(pecList + "<option value='-new-category-'>New Category</option>");
  setPossibleExecutionFormat();
}

function getPossibleExecution() {
  possibleExecution = [];
  $.ajax({
    url: "/api/possible-execution",
    method: "GET",
    dataType: "json",
    success: function(res) {
      for (var i = 0; i < res.length; i++) {
        var isSeen = false;
        for (var x = 0; x < possibleExecution.length; x++) {
          if (res[i].category == possibleExecution[x].category) {
            isSeen = true;
            break;
          }
        }
        if (!isSeen) {
          possibleExecution.push({ category: res[i].category, type: [] });
        }
      }

      for (var i = 0; i < res.length; i++) {
        for (var x = 0; x < possibleExecution.length; x++) {
          if (res[i].category == possibleExecution[x].category) {
            possibleExecution[x].type.push({
              id: res[i].possible_execution_id,
              format: res[i].type
            });
          }
        }
      }
      setPossibleExecutionCategory();
    }
  });
}

function removeSelectedPossibleExecution(spe_id) {
  var t = [];
  var d = selectedPossibleExecution;
  for (var i = 0; i < d.length; i++) {
    if (spe_id != d[i].spe_id) {
      t.push(d[i]);
    }
  }
  selectedPossibleExecution = t;
  updateSelectedPossibleExecutionList();
}

function updateSelectedPossibleExecutionList() {
  var list = $("#txtSelectedPossibleExecution");
  list.html("");
  var listTemp = "";

  var d = selectedPossibleExecution;

  for (var i = 0; i < d.length; i++) {
    listTemp +=
      "<button type='button' class='btn btn-sm btn-info mb-2' onclick='removeSelectedPossibleExecution(" +
      d[i].spe_id +
      ")'><span class='title-case'>" +
      d[i].category +
      " " +
      d[i].format +
      "</span> - " +
      d[i].measurement +
      " - P" +
      d[i].bd_rate +
      "</button>";
  }

  list.html(list.html() + listTemp);
}

function addSelectedPossibleExecution() {
  var siteType = $("#txtSiteType").val();
  var c = $("#selectPossibleExecutionCategory").val();
  var f = $("#selectPossibleExecutionFormat option:selected").html();
  var fid = $("#selectPossibleExecutionFormat").val();
  var m = $("#txtPossibleExecutionMeasurement").val();
  var rr1 = $("#txtRentalRate").val();
  var rr2 = $("#txtPossibleExecutionRentalRate").val();

  if (m == "") {
    toastr.error("Ops! Measurement is required.", "Ops!");
    $("#txtPossibleExecutionMeasurement").focus();
  } else if (rr1 == "" && siteType == "property") {
    toastr.error("Ops! Business dev rental rate is required.", "Ops!");
    $("#txtRentalRate").focus();
  } else if (rr2 == "" && siteType == "partner") {
    toastr.error("Ops! Format rate is required.", "Ops!");
    $("#txtPossibleExecutionRentalRate").focus();
  } else {
    if (siteType == "property") {
      selectedPossibleExecution.push({
        spe_id: selectedPossibleExecution.length + 1,
        possible_execution_id: fid,
        category: c,
        format: f,
        measurement: m,
        bd_rate: rr1
      });
    } else {
      selectedPossibleExecution.push({
        spe_id: selectedPossibleExecution.length + 1,
        possible_execution_id: fid,
        category: c,
        format: f,
        measurement: m,
        bd_rate: rr2
      });
    }
    updateSelectedPossibleExecutionList();
  }
}

function changeSiteType() {
  var siteType = $("#txtSiteType").val();
  var siteRentalRate = $("#txtRentalRate");
  var peRentalRate = $("#txtPossibleExecutionRentalRate");

  if (siteType == "property") {
    peRentalRate.attr("disabled", "disabled");
    peRentalRate.val("");
  } else {
    siteRentalRate.attr("disabled", "disabled");
    siteRentalRate.val("");
  }
}

getPossibleExecution();
changeSiteType();
setRegion();

$("#btnEdit").click(function() {
  $("#btnEdit").css("display", "none");
  $("#editOptions").css("display", "block");

  $("#txtSubCategory").removeAttr("disabled");
  $("#txtSiteName").removeAttr("disabled");
  $("#txtFootTraffic").removeAttr("disabled");
  if ($("#txtSiteType").val() == "property") {
    $("#txtRentalRate").removeAttr("disabled");
    $("#dateContractDurationFrom").removeAttr("disabled");
    $("#dateContractDurationTo").removeAttr("disabled");
  }
  $("#txtSiteRemark").removeAttr("disabled");
  $("#txtRegion").fadeOut(50, function() {
    $("#selectRegion").fadeIn(50);
  });
  $("#txtProvince").fadeOut(50, function() {
    $("#selectProvince").fadeIn(50);
  });
  $("#txtMunicipalityCity").fadeOut(50, function() {
    $("#selectMunicipalityCity").fadeIn(50);
  });
  $("#txtAddress").removeAttr("disabled");
  $("#txtLatitude").removeAttr("disabled");
  $("#txtLongitude").removeAttr("disabled");
  $("#txtContactPerson").removeAttr("disabled");
  $("#txtContactDesignation").removeAttr("disabled");
  $("#txtContactNumber").removeAttr("disabled");
  $("#txtContactEmail").removeAttr("disabled");
  $("#txtBDOfficerName").removeAttr("disabled");

  siteDetails = {
    t: $("#txtSiteType").val(),
    sc: $("#txtSubCategory").val(),
    sn: $("#txtSiteName").val(),
    ft: $("#txtFootTraffic").val(),
    rr: $("#txtRentalRate").val(),
    cdf: $("#dateContractDurationFrom").val(),
    cdt: $("#dateContractDurationTo").val(),
    r: $("#txtSiteRemark").val(),
    reg: $("#selectRegion option:selected").html(),
    prov: $("#selectProvince option:selected").html(),
    mun: $("#selectMunicipalityCity option:selected").html(),
    a: $("#txtAddress").val(),
    lat: $("#txtLatitude").val(),
    long: $("#txtLongitude").val(),
    cp: $("#txtContactPerson").val(),
    cd: $("#txtContactDesignation").val(),
    cn: $("#txtContactNumber").val(),
    ce: $("#txtContactEmail").val(),
    bdo: $("#txtBDOfficerName").val()
  };
});

$("#btnEditCancel").click(function() {
  $("#btnEdit").css("display", "block");
  $("#editOptions").css("display", "none");

  $("#txtSubCategory").attr("disabled", "disabled");
  $("#txtSiteName").attr("disabled", "disabled");
  $("#txtFootTraffic").attr("disabled", "disabled");
  if ($("#txtSiteType").val() == "property") {
    $("#txtRentalRate").attr("disabled", "disabled");
    $("#dateContractDurationFrom").attr("disabled", "disabled");
    $("#dateContractDurationTo").attr("disabled", "disabled");
  }
  $("#txtSiteRemark").attr("disabled", "disabled");
  $("#selectRegion").fadeOut(50, function() {
    $("#txtRegion").fadeIn(50);
  });
  $("#selectProvince").fadeOut(50, function() {
    $("#txtProvince").fadeIn(50);
  });
  $("#selectMunicipalityCity").fadeOut(50, function() {
    $("#txtMunicipalityCity").fadeIn(50);
  });
  $("#txtAddress").attr("disabled", "disabled");
  $("#txtLatitude").attr("disabled", "disabled");
  $("#txtLongitude").attr("disabled", "disabled");
  $("#txtContactPerson").attr("disabled", "disabled");
  $("#txtContactDesignation").attr("disabled", "disabled");
  $("#txtContactNumber").attr("disabled", "disabled");
  $("#txtContactEmail").attr("disabled", "disabled");
  $("#txtBDOfficerName").attr("disabled", "disabled");

  $("#txtSiteType").val(siteDetails.t);
  $("#txtSubCategory").val(siteDetails.sc);
  $("#txtSiteName").val(siteDetails.sn);
  $("#txtFootTraffic").val(siteDetails.ft);
  $("#txtRentalRate").val(siteDetails.rr);
  $("#dateContractDurationFrom").val(siteDetails.cdf);
  $("#dateContractDurationTo").val(siteDetails.cdt);
  $("#txtSiteRemark").val(siteDetails.r);
  $("#txtAddress").val(siteDetails.a);
  $("#txtLatitude").val(siteDetails.lat);
  $("#txtLongitude").val(siteDetails.long);
  $("#txtContactPerson").val(siteDetails.cp);
  $("#txtContactDesignation").val(siteDetails.cd);
  $("#txtContactNumber").val(siteDetails.cn);
  $("#txtContactEmail").val(siteDetails.ce);
  $("#txtBDOfficerName").val(siteDetails.bdo);
});

$("#btnEditSave").click(function() {
  var sid = $("#txtSiteId");
  var t = $("#txtSiteType");
  var sc = $("#txtSubCategory");
  var sn = $("#txtSiteName");
  var ft = $("#txtFootTraffic");
  var rr = $("#txtRentalRate");
  var cdf = $("#dateContractDurationFrom");
  var cdt = $("#dateContractDurationTo");
  var r = $("#txtSiteRemark");
  var reg = "";
  var prov = "";
  var mun = "";
  if (isLocationRegionProvinceMunicipalityChanged) {
    reg = $("#selectRegion option:selected").html();
    prov = $("#selectProvince option:selected").html();
    mun = $("#selectMunicipalityCity option:selected").html();
  } else {
    reg = $("#txtRegion").val();
    prov = $("#txtProvince").val();
    mun = $("#txtMunicipalityCity").val();
  }
  var a = $("#txtAddress");
  var lat = $("#txtLatitude");
  var long = $("#txtLongitude");
  var cp = $("#txtContactPerson");
  var cd = $("#txtContactDesignation");
  var cn = $("#txtContactNumber");
  var ce = $("#txtContactEmail");
  var bdo = $("#txtBDOfficerName");

  if (sn.val() == "") {
    toastr.error("Site name is required.", "Ops!");
    sn.focus();
  } else if (ft.val() == "") {
    toastr.error("Foot traffic is required.", "Ops!");
    ft.focus();
  } else if (rr.val() == "" && t.val() == "property") {
    toastr.error("Rental rate is required.", "Ops!");
    rr.focus();
  } else if (cdf.val() == "" && t.val() == "property") {
    toastr.error("Contract duration start is required.", "Ops!");
    cdf.focus();
  } else if (cdt.val() == "" && t.val() == "property") {
    toastr.error("Contrant duration end is required.", "Ops!");
    cdt.focus();
  } else if (a.val() == "") {
    toastr.error("Address is required.", "Ops!");
    a.focus();
  } else if (lat.val() == "") {
    toastr.error("Site address latitude is required.", "Ops!");
    lat.focus();
  } else if (long.val() == "") {
    toastr.error("Site address longitude is required.", "Ops!");
    long.focus();
  } else {
    var data = {
      type: t.val(),
      site_id: sid.val(),
      sub_category: sc.val(),
      site: sn.val(),
      foot_traffic: ft.val(),
      rental_rate: rr.val(),
      contract_duration_from: cdf.val() + " 00:00:00",
      contract_duration_to: cdt.val() + " 23:59:59",
      remark: r.val(),
      region: reg,
      province: prov,
      municipality: mun,
      address: a.val(),
      latitude: lat.val() + "",
      longitude: long.val() + "",
      contact_person: cp.val(),
      designation: cd.val(),
      contact_number: cn.val(),
      email_address: ce.val(),
      officer_name: bdo.val()
    };

    $.ajax({
      url: "/api/site",
      method: "put",
      dataType: "json",
      data: data,
      success: function(res) {
        if (res.success) {
          toastr.options.onHidden = function() {
            window.location.href =
              window.location.href.substring(
                0,
                window.location.href.indexOf("?")
              ) + "?tab=details";
          };
          toastr.success("Site was updated successfully.", "Hooray!");
        } else {
          toastr.error(
            "Something went wrong. Please check your internet connection",
            "Ops!"
          );
        }
      },
      error: function(err) {
        toastr.error(
          "Something went wrong. Please check your internet connection",
          "Ops!"
        );
      }
    });
  }
});

function savePossibleExecutionChanges(id) {
  var sid = $("#txtSiteId"),
    category = $("txtSpeCategory_" + id).html(),
    type = $("txtSpeType_" + id).html(),
    measurement = $("#txtSpeMeasurement_" + id),
    bdRate = $("#txtSpeBDRate_" + id);

  if (measurement.val() == "") {
    toastr.error("Measurement name is required.", "Ops!");
    measurement.focus();
  } else if (bdRate.val() == "") {
    toastr.error("Business development rate is required.", "Ops!");
    bdRate.focus();
  } else {
    $.ajax({
      url: "/api/site/possible-execution",
      method: "put",
      dataType: "json",
      data: {
        site_id: sid.val(),
        spe_id: id,
        category: category,
        type: type,
        measurement: measurement.val(),
        bd_rate: bdRate.val()
      },
      success: function(res) {
        if (res.success) {
          toastr.success(
            "Site possible execution was updated successfully.",
            "Hooray!"
          );
        } else {
          toastr.error(
            "Something went wrong. Please check your internet connection",
            "Ops!"
          );
        }
      },
      error: function(err) {
        toastr.error(
          "Something went wrong. Please check your internet connection",
          "Ops!"
        );
      }
    });
  }
}

function savePossibleExecutionChangesSales(id) {
  var sid = $("#txtSiteId"),
    category = $("txtSpeCategory_" + id).html(),
    type = $("txtSpeType_" + id).html(),
    measurement = $("#txtSpeMeasurement_" + id),
    bdRate = $("#txtSpeBDRate_" + id),
    prodRate = $("#txtSpeProductionRate_" + id),
    salesRate = $("#txtSpeSalesRate_" + id);

  if (prodRate.val() == "") {
    toastr.error("Production rate is required.", "Ops!");
    prodRate.focus();
  } else if (prodRate.val() < 0) {
    toastr.error("Invalid production rate.", "Ops!");
    prodRate.focus();
  } else if (salesRate.val() == "") {
    toastr.error("Sales rate is required.", "Ops!");
    salesRate.focus();
  } else if (parseInt(salesRate.val()) < parseInt(bdRate.val())) {
    toastr.error(
      "Sales rate must be higher than business development rate.",
      "Ops!"
    );
    salesRate.focus();
  } else {
    $.ajax({
      url: "/api/site/possible-execution/sales-rate",
      method: "put",
      dataType: "json",
      data: {
        site_id: sid.val(),
        spe_id: id,
        category: category,
        type: type,
        measurement: measurement.val(),
        production_rate: prodRate.val(),
        sales_rate: salesRate.val()
      },
      success: function(res) {
        if (res.success) {
          toastr.success(
            "Site possible execution sales rate was updated successfully.",
            "Hooray!"
          );
        } else {
          toastr.error(
            "Something went wrong. Please check your internet connection",
            "Ops!"
          );
        }
      },
      error: function(err) {
        toastr.error(
          "Something went wrong. Please check your internet connection",
          "Ops!"
        );
      }
    });
  }
}

function deletePossibleExecutionChanges(id) {
  var sid = $("#txtSiteId"),
    category = $("txtSpeCategory_" + id).html(),
    type = $("txtSpeType_" + id).html(),
    measurement = $("#txtSpeMeasurement_" + id);

  $.ajax({
    url: "/api/site/possible-execution",
    method: "delete",
    dataType: "json",
    data: {
      site_id: sid.val(),
      spe_id: id,
      category: category,
      type: type,
      measurement: measurement.val()
    },
    success: function(res) {
      if (res.success) {
        toastr.success(
          "Successfully removed a possible execution in this site.",
          "Hooray!"
        );
        $("#possibleExecutionRow_" + id).remove();
      } else {
        toastr.error(
          "Something went wrong. Please check your internet connection",
          "Ops!"
        );
      }
    },
    error: function(err) {
      toastr.error(
        "Something went wrong. Please check your internet connection",
        "Ops!"
      );
    }
  });
}

function deleteSitePhoto(id) {
  var sid = $("#txtSiteId"),
    imageUrl = $("#sitePhoto_" + id)[0].currentSrc;

  $.ajax({
    url: "/api/site/gallery",
    method: "delete",
    dataType: "json",
    data: {
      site_id: sid.val(),
      photo_id: id,
      url: imageUrl
    },
    success: function(res) {
      if (res.success) {
        toastr.success(
          "Successfully removed a site photo in this site.",
          "Hooray!"
        );
        $("#photo_" + id).remove();
      } else {
        toastr.error(
          "Something went wrong. Please check your internet connection",
          "Ops!"
        );
      }
    },
    error: function(err) {
      toastr.error(
        "Something went wrong. Please check your internet connection",
        "Ops!"
      );
    }
  });
}

function deleteSitePastProjectPhoto(id) {
  var sid = $("#txtSiteId"),
    imageUrl = $("#sitePastProjectPhoto_" + id)[0].currentSrc;

  $.ajax({
    url: "/api/site/past-project",
    method: "delete",
    dataType: "json",
    data: {
      site_id: sid.val(),
      photo_id: id,
      url: imageUrl
    },
    success: function(res) {
      if (res.success) {
        toastr.success(
          "Successfully removed a site past project photo in this site.",
          "Hooray!"
        );
        $("#pp_photo_" + id).remove();
      } else {
        toastr.error(
          "Something went wrong. Please check your internet connection",
          "Ops!"
        );
      }
    },
    error: function(err) {
      toastr.error(
        "Something went wrong. Please check your internet connection",
        "Ops!"
      );
    }
  });
}

$("#btnAddPossibleExecutionFormToggle").click(function() {
  $("#listPossibleExecutionDiv").fadeOut(150, function() {
    $("#addPossibleExecutionDiv").fadeIn(150);
  });
});

$("#btnAddPossibleExecutionFormCancel").click(function() {
  $("#addPossibleExecutionDiv").fadeOut(150, function() {
    $("#listPossibleExecutionDiv").fadeIn(150);
  });
});

function checkExecutionCategory() {
  var aec = $("#addExecutionCategory").val();

  if (aec == "-new-category-") {
    $("#addExecutionNewCategoryContainer").slideDown(250);
  } else {
    $("#addExecutionNewCategoryContainer").slideUp(250);
    $("#addExecutionNewCategory").val("");
  }
}

function addNewExecution() {
  var category = $("#addExecutionCategory");
  var newCategory = $("#addExecutionNewCategory");
  var f = $("#addExecutionFormat");

  var c = "";

  if (category.val() == "-new-category-" && newCategory.val() == "") {
    toastr.error("New category is required.", "Ops!");
    newCategory.focus();
  } else if (f.val() == "") {
    toastr.error("Execution format is required.", "Ops!");
    f.focus();
  } else {
    if (category.val() == "-new-category-") {
      c = newCategory.val();
    } else {
      c = category.val();
    }

    $.ajax({
      url: "/api/possible-execution",
      method: "POST",
      dataType: "json",
      data: {
        category: c.toLowerCase(),
        type: f.val().toLowerCase()
      },
      success: function(res) {
        if (res.success) {
          $("#addExecutionModal").modal("hide");
          $("#addExecutionNewCategoryContainer").slideUp(250);
          newCategory.val("");
          f.val("");
          toastr.success("New execution was successfully added.", "Hooray!");
          getPossibleExecution();
        } else {
          toastr.error(
            "Something went wrong. Please check your internet connection",
            "Ops!"
          );
        }
      },
      error: function(err) {
        toastr.error(
          "Something went wrong. Please check your internet connection",
          "Ops!"
        );
      }
    });
  }
}

function saveSeletectedPossibleExecution(site_id) {
  var data = {
    site_id: site_id,
    possible_execution: selectedPossibleExecution
  };
  if (selectedPossibleExecution.length > 0) {
    $.ajax({
      url: "/api/site/possible-execution",
      method: "post",
      dataType: "json",
      data: { data: JSON.stringify(data) },
      success: function(res) {
        if (res.success) {
          toastr.options.onHidden = function() {
            window.location.href =
              window.location.href.substring(
                0,
                window.location.href.indexOf("?")
              ) + "?tab=execution";
          };
          toastr.success(
            "New possible execution was successfully added.",
            "Hooray!"
          );
        } else {
          toastr.error(
            "Something went wrong. Please check your internet connection",
            "Ops!"
          );
        }
      },
      error: function(err) {
        toastr.error(
          "Something went wrong. Please check your internet connection",
          "Ops!"
        );
      }
    });
  } else {
    toastr.error(
      "No possible execution added on the selected box. Please add, thanks!",
      "Ops!"
    );
  }
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
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

var map;
function initMap() {
  var latitude = parseFloat($("#txtLatitude").val());
  var longitude = parseFloat($("#txtLongitude").val());
  var category = $("#txtCategory").val();
  var siteName = $("#txtSiteName").val();

  var latlong = { lat: latitude, lng: longitude };

  map = new google.maps.Map(document.getElementById("map"), {
    center: latlong,
    zoom: 19
  });

  new google.maps.Marker({
    position: latlong,
    map: map,
    icon: categoryMarkerIcon(category),
    title: toTitleCase(category) + " | " + toTitleCase(siteName)
  });
}

function viewInMap() {
  $("#nav-map-tab").click();
}

$("#btnDeleteSite").click(function() {
  $("#btnDeleteSite").attr("disabled", "disabled");
  var sid = $("#txtSiteId");
  var vsid = $("#txtDeleteSiteId");

  if (sid.val() != vsid.val()) {
    toastr.error(
      "Site ID doesn't match to the site you want to delete. Please check, thanks!",
      "Ops!"
    );
    $("#btnDeleteSite").removeAttr("disabled");
    vsid.focus();
  } else {
    $.ajax({
      url: "/api/site",
      method: "delete",
      dataType: "json",
      data: {
        site_id: sid.val()
      },
      success: function(res) {
        if (res.success) {
          toastr.options.onHidden = function() {
            window.location.href = window.location.href.substring(
              0,
              window.location.href.indexOf("/" + sid.val())
            );
          };
          toastr.success("Site was deleted successfully.", "Hooray!");
        } else {
          toastr.error(
            "You need to delete all Site Photos, Possible Executions and Past Project Photos of this site before able to delete this site.",
            "Ops!"
          );
          $("#btnDeleteSite").removeAttr("disabled");
        }
      },
      error: function(err) {
        toastr.error(
          "Something went wrong. Please check your internet connection",
          "Ops!"
        );
        $("#btnDeleteSite").removeAttr("disabled");
      }
    });
  }
});
