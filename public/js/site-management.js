$(document).ready(function () {
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
});

lazyload();

var possibleExecution = [];
var selectedPossibleExecution = [];

var addSiteFormToggle = 0;
function goTo(link) {
  window.location.href = link;
}

$("#btnAddSiteFormToggle").click(function () {
  if (addSiteFormToggle == 0) {
    $("#site-table").slideUp("150", function () {
      $("#site-form").slideDown("150");
      $("#btnToggleFormText").html("Go Back");
      $("#btnToggleFormIcon").removeClass("fa-plus");
      $("#btnToggleFormIcon").addClass("fa-chevron-left");
      $("#btnAddSiteFormToggle").removeClass("btn-info");
      $("#btnAddSiteFormToggle").addClass("btn-danger");
    });
    addSiteFormToggle = 1;
  } else {
    $("#site-form").slideUp("150", function () {
      $("#site-table").slideDown("150");
      $("#btnToggleFormText").html("Add Site");
      $("#btnToggleFormIcon").removeClass("fa-chevron-left");
      $("#btnToggleFormIcon").addClass("fa-plus");
      $("#btnAddSiteFormToggle").removeClass("btn-danger");
      $("#btnAddSiteFormToggle").addClass("btn-info");
    });
    addSiteFormToggle = 0;
  }
});

$("#btnAddCategory").click(function () {
  var category = $("#txtCategory")
    .val()
    .toLowerCase();
  var type_id = $("#txtTypeId").val();

  $.ajax({
    url: "/api/category",
    method: "POST",
    dataType: "json",
    data: {
      category,
      type_id
    },
    success: function (res) {
      if (res.success) {
        toastr.options.onHidden = function () {
          window.location.reload();
        };
        toastr.success("New category was successfully added.", "Hooray!");
      } else {
        toastr.error(
          "Something went wrong. Please check your internet connection",
          "Ops!"
        );
      }
    },
    error: function (err) {
      toastr.error(
        "Something went wrong. Please check your internet connection",
        "Ops!"
      );
    }
  });
});

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
    success: function (res) {
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

function changeSiteType() {
  var siteType = $("#txtSiteType").val();
  var siteRentalRate = $("#txtRentalRate");
  var peRentalRate = $("#txtPossibleExecutionRentalRate");
  var dateContractDurationFrom = $("#dateContractDurationFrom");
  var dateContractDurationTo = $("#dateContractDurationTo");

  if (siteType == "property") {
    peRentalRate.attr("disabled", "disabled");
    peRentalRate.val("");
    siteRentalRate.removeAttr("disabled");
    dateContractDurationFrom.removeAttr("disabled");
    dateContractDurationTo.removeAttr("disabled");
  } else {
    siteRentalRate.attr("disabled", "disabled");
    siteRentalRate.val("");
    peRentalRate.removeAttr("disabled");
    dateContractDurationFrom.attr("disabled", "disabled");
    dateContractDurationTo.attr("disabled", "disabled");
    dateContractDurationFrom.val("");
    dateContractDurationTo.val("");
  }
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

getPossibleExecution();
setRegion();
changeSiteType();

function saveSite() {
  var st = $("#txtSiteType");
  var sn = $("#txtSiteName");
  var c = $("#txtCategory");
  var cid = $("#txtCategoryId");
  var sc = $("#txtSubCategory");
  var ft = $("#txtFootTraffic");
  var rr = $("#txtRentalRate");
  var cdf = $("#dateContractDurationFrom");
  var cdt = $("#dateContractDurationTo");
  var sr = $("#txtSiteRemark");
  var reg = $("#selectRegion option:selected").html();
  var prov = $("#selectProvince option:selected").html();
  var mun = $("#selectMunicipalityCity option:selected").html();
  var address = $("#txtAddress");
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
  } else if (rr.val() == "" && st.val() == "property") {
    toastr.error("Rental rate is required.", "Ops!");
    rr.focus();
  } else if (cdf.val() == "" && st.val() == "property") {
    toastr.error("Contract duration start is required.", "Ops!");
    cdf.focus();
  } else if (cdt.val() == "" && st.val() == "property") {
    toastr.error("Contrant duration end is required.", "Ops!");
    cdt.focus();
  } else if (address.val() == "") {
    toastr.error("Address is required.", "Ops!");
    address.focus();
  } else if (lat.val() == "") {
    toastr.error("Site address latitude is required.", "Ops!");
    lat.focus();
  } else if (long.val() == "") {
    toastr.error("Site address longitude is required.", "Ops!");
    long.focus();
  } else {
    $("#btnAddSite").attr("disabled", "disabled");
    var data = {
      type: st.val().toLowerCase(),
      site: sn.val(),
      category: c.val(),
      category_id: cid.val(),
      sub_category: sc.val(),
      foot_traffic: ft.val(),
      rental_rate: rr.val(),
      contract_duration_from: cdf.val() + " 00:00:00",
      contract_duration_to: cdt.val() + " 23:59:59",
      remark: sr.val(),
      region: reg,
      province: prov,
      municipality: mun,
      address: address.val(),
      latitude: lat.val() + "",
      longitude: long.val() + "",
      contact_person: cp.val(),
      designation: cd.val(),
      contact_number: cn.val(),
      email_address: ce.val(),
      officer_name: bdo.val(),
      possible_execution: selectedPossibleExecution
    };

    $.ajax({
      url: "/api/site",
      method: "post",
      dataType: "json",
      data: { data: JSON.stringify(data) },
      success: function (res) {
        if (res.success) {
          toastr.options.onHidden = function () {
            window.location.reload();
          };
          toastr.success("New site was successfully added.", "Hooray!");
        } else {
          toastr.error(
            "Something went wrong. Please check your internet connection",
            "Ops!"
          );
          $("#btnAddSite").removeAttr("disabled");
        }
      },
      error: function (err) {
        toastr.error(
          "Something went wrong. Please check your internet connection",
          "Ops!"
        );
        $("#btnAddSite").removeAttr("disabled");
      }
    });
  }
}

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
      success: function (res) {
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
      error: function (err) {
        toastr.error(
          "Something went wrong. Please check your internet connection",
          "Ops!"
        );
      }
    });
  }
}

function viewSiteDetail(type, category_id, site_id) {
  window.location.href =
    "/site-management/" + type + "/" + category_id + "/" + site_id;
}
