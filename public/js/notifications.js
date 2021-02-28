$("#notificationDropdown").on("click", function () {
  $.ajax({
    url: "/api/notifications",
    method: "PUT",
    data: {
      field: "count"
    },
    success: function (res) {
      if (res.success) {
        $("#notificationBadgeCount").html("");
      }
    }
  })
})

function updateNotificationSeen(id) {
  $.ajax({
    url: "/api/notifications",
    method: "PUT",
    data: {
      field: "seen",
      id: id
    },
    success: function (res) {
      if (res.success) {
        $("#notif_" + id).removeClass("not-seen");
      }
    }
  })
}