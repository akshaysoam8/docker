window.onload = function () {
  $.ajax({
    url: '/dockerData',
    type: 'get',
    dataType: 'json',
    contentType: 'application/json',
    success: function (data) {
      console.log('ajax success');
      console.log(data);

      var json = JSON.parse($.trim(data));

      $.each(json, function (index, value) {
        $('#dockerData').append('<tr><td>' + value.Command + '</td><td>' + value.Names[0] + '</td><td id = "id" onclick="toStatPage(\'' + value.Id + '\')">' + value.Id + '</td><td>' + value.Status + '</td></tr>');

        $('#id').mouseover(function () {
          $('#id').css('cursor', 'pointer');
        })
      });
    },
    error: function (xhr, text, error) {
      console.log('ajax error');

      console.log(text);
      console.log(error);
    }
  });
}

function toStatPage(id) {
    window.location.href = '/stat?id=' + id;
}
