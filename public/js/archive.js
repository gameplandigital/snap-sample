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
});

function restoreSite(site_id) {
  $.ajax({
    url: "/api/archive/site",
    method: "PUT",
    data: {
      site_id
    },
    dataType: "json",
    success: function(res) {
      if (res.success) {
        $("#row_" + site_id).remove();
        toastr.success("Site has been successfully restore.", "Hooray!");
      } else {
        toastr.success("Something went wrong. Please try again.", "Oops!");
      }
    }
  });
}
