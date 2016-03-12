$(window).load(function () {

  $('#table').html('<img src="images/loader.gif" class="loader">');

  $.ajax({
    url : '/alertFromAllContainers',
    success : function (data) {
      console.log(data);

      $('#table').html('');

      for(container in data)
      {
        $('#table').append('<table id=\"' + container + '\"></table>');
        $('#' + container).append('<tr><td class="container" span="2">' + container + '</td></tr>');

        for(key in data[container])
          $('#' + container).append('<tr><td class="key-name">' + key + '</td><td class="key-value">' + data[container][key] + '</td></tr>');

        $('#table').append('<br />');
      }
    },
    error : function (jqXHR, status, text) {
      console.log(status);
    }
  });
});


// var html = '<table id="/'container/'"></table><tr span="2" class="container">' + container + '</tr>';
//
// for(key in data[container])
//   html += '<tr><td class="key-name">' + key + '</td><td class="key-value">' + data[container][key] + '</td></tr>';
//
// html += '</table><br />';
//
// $('#table').append(html);
//
// html = '';
