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

function loginUser(email, password) {
  if (!email.value || !password.value) {
    toastr.info("Input your credentials to login. Thanks!", "Hello!");
  } else {
    $.ajax({
      url: "/api/login",
      method: "POST",
      dataType: "json",
      data: {
        email: email.value,
        password: password.value
      },
      success: function(res) {
        console.log(res);
        if (res.success) {
          toastr.options.onHidden = function() {
            window.location.href = "/home";
          };
          toastr.success(res.message, "Hooray!");
        } else {
          toastr.error(res.message, "Ops!");
        }
      },
      error: function(err) {
        toastr.error(
          "Please check your internet connection and login again. Thanks!",
          "Ops!"
        );
      }
    });
  }
}
