window.onload = function () {
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

  var cpuChart = new CanvasJS.Chart("cpuChartContainer", {
    title: {
        text: "CPU Usage"
    },
    width: $(window).width() * 0.75,
    data: [{
      type: "spline",
      dataPoints: [
		    { y: 0 },
		    { y: 0 },
    		{ y: 0 },
    		{ y: 0 }
      ]}
    ]
  });

  cpuChart.render();

  var memoryChart = new CanvasJS.Chart("memoryChartContainer", {
    title: {
      text: "Memory Usage"
    },
    width: $(window).width() * 0.75,
    data: [{
      type: "splineArea",
      dataPoints: [
		    { y: 0 },
		    { y: 0 },
		    { y: 0 },
		    { y: 0 }
      ]}
    ]
  });

  memoryChart.render();

  var networkChart = new CanvasJS.Chart("networkChartContainer",
  {
    title:{
      text: "Network Usage"
    },
    width: $(window).width() * 0.75,
    data: [
    {
      type: "spline",
      showInLegend: true,
      name: "Received KBs per Second",
      markerSize: 0,
      dataPoints: [
        { y: 0 },
		    { y: 0 },
		    { y: 0 },
		    { y: 0 }
      ]
    },
    {
      type: "spline",
      showInLegend: true,
      name: "Sent KBs Per Second",
      markerSize: 0,
      dataPoints: [
        { y: 0 },
		    { y: 0 },
		    { y: 0 },
		    { y: 0 }
      ]
    }]
  });

  var ioChart = new CanvasJS.Chart("ioChartContainer",
  {
    title:{
      text: "IO Usage"
    },
    width: $(window).width() * 0.75,
    data: [
    {
      type: "spline",
      showInLegend: true,
      name: "Read",
      markerSize: 0,
      dataPoints: [
        { y: 0 },
		    { y: 0 },
		    { y: 0 },
		    { y: 0 }
      ]
    },
    {
      type: "spline",
      showInLegend: true,
      name: "Write",
      markerSize: 0,
      dataPoints: [
        { y: 0 },
		    { y: 0 },
		    { y: 0 },
		    { y: 0 }
      ]
    },
    {
      type: "spline",
      showInLegend: true,
      name: "Sync",
      markerSize: 0,
      dataPoints: [
        { y: 0 },
		    { y: 0 },
		    { y: 0 },
		    { y: 0 }
      ]
    },
    {
      type: "spline",
      showInLegend: true,
      name: "Async",
      markerSize: 0,
      dataPoints: [
        { y: 0 },
		    { y: 0 },
		    { y: 0 },
		    { y: 0 }
      ]
    },
    {
      type: "spline",
      showInLegend: true,
      name: "Total",
      markerSize: 0,
      dataPoints: [
        { y: 0 },
		    { y: 0 },
		    { y: 0 },
		    { y: 0 }
      ]
    }
  ]
  });

  var perCpuChart = new CanvasJS.Chart("perCpuChartContainer",
  {
    title:{
      text: "Per Cpu Usage"
    },
    width: $(window).width() * 0.75,
    data: [
    {
      type: "spline",
      showInLegend: true,
      name: "Core 0",
      markerSize: 0,
      dataPoints: [
        { y: 0 },
        { y: 0 },
        { y: 0 },
        { y: 0 }
      ]
    },
    {
      type: "spline",
      showInLegend: true,
      name: "Core 1",
      markerSize: 0,
      dataPoints: [
        { y: 0 },
        { y: 0 },
        { y: 0 },
        { y: 0 }
      ]
    },
    {
      type: "spline",
      showInLegend: true,
      name: "Core 2",
      markerSize: 0,
      dataPoints: [
        { y: 0 },
        { y: 0 },
        { y: 0 },
        { y: 0 }
      ]
    },
    {
      type: "spline",
      showInLegend: true,
      name: "Core 3",
      markerSize: 0,
      dataPoints: [
        { y: 0 },
        { y: 0 },
        { y: 0 },
        { y: 0 }
      ]
    }
  ]
  });

  var socket = io.connect();

  var url = window.location.href;
  var id = url.substr(url.indexOf('=') + 1);

  socket.emit('get memory usage', JSON.stringify({ 'id': id }));
  socket.emit('get cpu usage', JSON.stringify({ 'id': id }));
  socket.emit('get network usage', JSON.stringify({ 'id': id }));
  socket.emit('get io usage', JSON.stringify({ 'id': id }));
  socket.emit('get per cpu usage', JSON.stringify({ 'id': id }));

  socket.on('memory data changed', function (data) {
    var json = JSON.parse(data);

    memoryChart.options.data[0].dataPoints.push({ y: json.memory_usage });

    memoryChart.render();
  });

  socket.on('cpu data changed', function (data) {
    var json = JSON.parse(data);

    cpuChart.options.data[0].dataPoints.push({ y: json.cpu_usage });
    cpuChart.render();
  });

  socket.on('network data changed', function (data) {

    var json = JSON.parse(data);

    networkChart.options.data[0].dataPoints.push({ y: json.received_usage });
    networkChart.options.data[1].dataPoints.push({ y: json.sent_usage });

    networkChart.render();
  });

  socket.on('io data changed', function (data) {

    var json = JSON.parse(data);

    ioChart.options.data[0].dataPoints.push({ y: json.Read });
    ioChart.options.data[1].dataPoints.push({ y: json.Write });
    ioChart.options.data[2].dataPoints.push({ y: json.Sync });
    ioChart.options.data[3].dataPoints.push({ y: json.Async });
    ioChart.options.data[4].dataPoints.push({ y: json.Total });

    ioChart.render();
  });

  socket.on('per cpu data changed', function (data) {
    var json = JSON.parse(data);

    if(json)
    {
      json.forEach(function (element, index) {
        perCpuChart.options.data[index].dataPoints.push({ y: element });
      });
    }

    perCpuChart.render();
  });

  $('#timerDropdown').change(function () {
    if($(this).val() == 0)
    {
      memoryChart.options.data[0].dataPoints = [];
      memoryChart.render();

      cpuChart.options.data[0].dataPoints = [];
      cpuChart.render();

      ioChart.options.data[0].dataPoints = [];
      ioChart.options.data[1].dataPoints = [];
      ioChart.options.data[2].dataPoints = [];
      ioChart.options.data[3].dataPoints = [];
      ioChart.options.data[4].dataPoints = [];
      ioChart.render();

      perCpuChart.options.data[0].dataPoints = [];
      perCpuChart.options.data[1].dataPoints = [];
      perCpuChart.options.data[2].dataPoints = [];
      perCpuChart.options.data[3].dataPoints = [];
      perCpuChart.render();

      networkChart.options.data[0].dataPoints = [];
      networkChart.options.data[1].dataPoints = [];
      networkChart.render();

      $('#user-defined-time').hide();
    }

    else if($(this).val() == 8)
      $('#user-defined-time').show();

    else
    {
      $('#user-defined-time').hide();

      $.ajax({
        url : '/memoryData',
        data : { Id : id, timer : $(this).val() },
        success : function (data) {
          console.log(data);

          var json = JSON.parse(data);

          memoryChart.options.data[0].dataPoints = [];

          json.forEach(function (element, index) {
            memoryChart.options.data[0].dataPoints.push({ y: element.memory_usage });
          });

          memoryChart.render();
        },
        error : function (jqXHR, text, status) {
          console.log(jqXHR);
        }
      });

      $.ajax({
        url : '/cpuData',
        data : { Id : id, timer : $(this).val() },
        success : function (data) {
          console.log(data);

          var json = JSON.parse(data);

          cpuChart.options.data[0].dataPoints = [];

          json.forEach(function (element, index) {
            cpuChart.options.data[0].dataPoints.push({ y: element.cpu_usage });
          });

          cpuChart.render();
        },
        error : function (jqXHR, text, status) {
          console.log(jqXHR);
        }
      });

      $.ajax({
        url : '/ioData',
        data : { Id : id, timer : $(this).val() },
        success : function (data) {

          var json = JSON.parse(data);

          ioChart.options.data[0].dataPoints = [];
          ioChart.options.data[1].dataPoints = [];
          ioChart.options.data[2].dataPoints = [];
          ioChart.options.data[3].dataPoints = [];
          ioChart.options.data[4].dataPoints = [];

          json.forEach(function (element, index) {
            ioChart.options.data[0].dataPoints.push({ y: element.read });
            ioChart.options.data[1].dataPoints.push({ y: element.write });
            ioChart.options.data[2].dataPoints.push({ y: element.sync });
            ioChart.options.data[3].dataPoints.push({ y: element.async });
            ioChart.options.data[4].dataPoints.push({ y: element.total });
          });

          ioChart.render();
        },
        error : function (jqXHR, text, status) {
          console.log(jqXHR);
        }
      });

      $.ajax({
        url : '/percpuData',
        data : { Id : id, timer : $(this).val() },
        success : function (data) {

          var json = JSON.parse(data);

          perCpuChart.options.data[0].dataPoints = [];
          perCpuChart.options.data[1].dataPoints = [];
          perCpuChart.options.data[2].dataPoints = [];
          perCpuChart.options.data[3].dataPoints = [];

          json.forEach(function (element, index) {
            perCpuChart.options.data[0].dataPoints.push({ y: element.Core0 });
            perCpuChart.options.data[1].dataPoints.push({ y: element.Core1 });
            perCpuChart.options.data[2].dataPoints.push({ y: element.Core2 });
            perCpuChart.options.data[3].dataPoints.push({ y: element.Core3 });
          });

          perCpuChart.render();
        },
        error : function (jqXHR, text, status) {
          console.log(jqXHR);
        }
      });

      $.ajax({
        url : '/networkData',
        data : { Id : id, timer : $(this).val() },
        success : function (data) {
          var json = JSON.parse(data);

          networkChart.options.data[0].dataPoints = [];
          networkChart.options.data[1].dataPoints = [];

          json.forEach(function (element, index) {
            networkChart.options.data[0].dataPoints.push({ y: element.received_usage });
            networkChart.options.data[1].dataPoints.push({ y: element.sent_usage });
          });

          networkChart.render();
        },
        error : function (jqXHR, text, status) {
          console.log(jqXHR);
        }
      });
    }
  });

  $('#unitDropdown').change(function () {
    if($('#user-given-interval').val() <= 0)
      $('#error').text('Please enter a Positive intergral Value');

    else {
      $('#error').text('');

      var timer_interval = $('#user-given-interval').val() * Math.pow(60, $('#unitDropdown').val()) * 1000;
      console.log(timer_interval);

      setInterval(function () {
        $.ajax({
          url : '/customData',
          data : { Id : id },
          success : function (data) {
            console.log('custom timer monitor executed');
            var json = JSON.parse(data);

            cpuChart.options.data[0].dataPoints = [];
            cpuChart.options.data[0].dataPoints.push({ y: json.cpu_usage });
            cpuChart.render();

            memoryChart.options.data[0].dataPoints = [];
            memoryChart.options.data[0].dataPoints.push({ y: json.memory_usage });
            memoryChart.render();

            ioChart.options.data[0].dataPoints = [];
            ioChart.options.data[1].dataPoints = [];
            ioChart.options.data[2].dataPoints = [];
            ioChart.options.data[3].dataPoints = [];
            ioChart.options.data[4].dataPoints = [];
            ioChart.options.data[0].dataPoints.push({ y: json.io.Read });
            ioChart.options.data[1].dataPoints.push({ y: json.io.Write });
            ioChart.options.data[2].dataPoints.push({ y: json.io.Sync });
            ioChart.options.data[3].dataPoints.push({ y: json.io.Async });
            ioChart.options.data[4].dataPoints.push({ y: json.io.Total });
            ioChart.render();

            perCpuChart.options.data[0].dataPoints = [];
            perCpuChart.options.data[1].dataPoints = [];
            perCpuChart.options.data[2].dataPoints = [];
            perCpuChart.options.data[3].dataPoints = [];
            json.percpu_usage.forEach(function (element, index) {
              perCpuChart.options.data[index].dataPoints.push({ y: element });
            });
            perCpuChart.render();

            networkChart.options.data[0].dataPoints = [];
            networkChart.options.data[1].dataPoints = [];
            networkChart.options.data[0].dataPoints.push({ y: json.network.received_bytes_per_second });
            networkChart.options.data[1].dataPoints.push({ y: json.network.sent_bytes_per_second });
            networkChart.render();
          },
          error : function (jqXHR, text, status) {
            console.log(jqXHR);
          }
        });
      }, timer_interval);
    }
  });
}
