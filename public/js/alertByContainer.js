$(window).load(function () {
  $.ajax({
    url: '/nodeList',
    dataType: 'json',
    contentType: 'application/json',
    success: function (data) {
      var json = JSON.parse(data);

      var number_of_nodes, count = 0;

      $.each(json.DriverStatus, function (index, value) {
        if (value[0] == '\bNodes') {
          number_of_nodes = value[1];

          console.log(number_of_nodes);

          for (i = 1; count < number_of_nodes; i += 5, count++) {
            var client = json.DriverStatus[index + i];

            console.log(client);

            var colon_index = client[1].indexOf(':');

            var pc_name = client[0];
            var ip_address = client[1].slice(0, colon_index);
            var port = client[1].slice(colon_index + 1);

            var containers = json.DriverStatus[index + i + 1][1];

            $('.nodeList').append('<div class="client"><div class="pc_name"><img src="/images/pc.png" height="30px" width="30px"><label style="margin: 4px;">' + pc_name + '</label></div><div class="ip_address_port_number"><label><b>IP </b> : ' + ip_address + '</label><br /><label><b>Port</b> : ' + port + '</label><br /><label><b>Containers</b> : ' + containers + '</label></div></div>');

            $('.pc_name').hover(function () {
                $('.ip_address_port_number').show();
            }, function () {
                $('.ip_address_port_number').hide();
            });
          }

          return false;
        }
      });
    },
    error: function (xhr, status, error) {
      console.log(status);
    }
  });

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
    },
    complete : function () {
      console.log($(document).height());
      console.log($(window).height());
    }
  });
});
