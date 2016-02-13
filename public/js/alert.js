$(window).load(function () {
  $.ajax({
    url : '/getAlertData',
    success : function (data) {
      console.log(data);
      data.forEach(function (element, index) {
        var idx = element.type.indexOf('[');
        var temp = (idx == -1) ? ('.' + element.type + '_alert') : ('.' + element.type.substr(0, idx) + '_alert');

        $(temp).text(element.count);
      });
    },
    error : function (jqXHR, text, status) {
      console.log(text);
    }
  });

  $('#addParam').click(function (event) {
    $('#new-parameter').toggle();
  });

  $('.nodeList').height(($(document).height() + 10) + 'px');

  $('#network-dropdown').change(function (event) {
    var element = '<tr class="network"><td></td><td>' + event.target.value +'</td><td>' + $('#threshold_period').val()+ '</td><td>0</td></tr>';

    $('table > tbody > tr').eq($('.network:last').index()).after(element);
  });

  $('#cpu-dropdown').change(function (event) {
    var element = '<tr class="cpu"><td></td><td>' + event.target.value +'</td><td>' + $('#threshold_period').val()+ '</td><td>0</td></tr>';

    $('table > tbody > tr').eq($('.cpu:last').index()).after(element);
  });

  $('#memory-dropdown').change(function (event) {
    var element = '<tr class="memory"><td></td><td>' + event.target.value +'</td><td>' + $('#threshold_period').val()+ '</td><td>0</td></tr>';

    $('table > tbody > tr').eq($('.memory:last').index()).after(element);
  });

  $('input:radio').change(function (e) {
    if(e.target.value == 'network') {
      $('#network-div').show();
      $('#cpu-div').hide();
      $('#memory-div').hide();
    }

    else if(e.target.value == 'cpu') {
      $('#cpu-div').show();
      $('#memory-div').hide();
      $('#network-div').hide();
    }

    else if(e.target.value == 'memory') {
      $('#memory-div').show();
      $('#network-div').hide();
      $('#cpu-div').hide();
    }
  });

  var threshold_dropdown_id = ['#received-threshold-dropdown', '#sent-threshold-dropdown', '#total-io-threshold-dropdown', '#async-io-threshold-dropdown', '#sync-io-threshold-dropdown', '#write-io-threshold-dropdown', '#read-io-threshold-dropdown', '#percpu-threshold-dropdown', '#cpu-threshold-dropdown', '#memory-threshold-dropdown'];

  threshold_dropdown_id.forEach(function (element, index) {
    $(element).change(function (e) {
      var type = $(e.target.parentNode.parentNode).attr('class').split(' ').pop();

      $.ajax({
        url : '/threshold_changed',
        data : { type : type, new_value : e.target.value },
        success : function () {
          console.log(type + ' threshold updated');
        },
        error : function (jqXHR, text, status) {
          console.log(text);
        }
      });
    });
  });

  console.log(JSON.stringify([{ container : "b42837512ea241492c2fdeb0dc8bc211ccbc8119489e837616031ddbcbe48845" }]));

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
          }

          return false;
        }
      });
    },
    error: function (xhr, status, error) {
      console.log(status);
    }
  });
});
