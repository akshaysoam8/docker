module.exports  = function (app, mongoose) {
  var request = require('request');
  var chalk = require('chalk');
  var nconf = require('nconf');
  var nodemailer = require('nodemailer');

  var alert_schema = require('../model/alert');
  var ALERT = mongoose.model('alert', alert_schema, 'Alerts');

  nconf.file("db", './config/config.json');

  var cpu_usage_threshold = 0.002;

  var percpu_usage_threshold = 34000000;

  var memory_usage_threshold = 4;

  var read_io_usage_threshold = 5000000;
  var write_io_usage_threshold = 5000000;
  var async_io_usage_threshold = 5000000;
  var sync_io_usage_threshold = 5000000;
  var total_io_usage_threshold = 5000000;

  var sent_usage_threshold = 10;
  var received_usage_threshold = 10;

  var monitoring_period = 1*1000;

  var intervalId;

  var url = 'http://' + nconf.get('anish-pc-college') +'/containers/json';

  request(url, function (error, response, body) {
    if(error)
      console.log(error);
    else {
      JSON.parse(body).forEach(function (element, index) {
        startAlert(element.Id);
      });
    }
  });

  function startAlert (Id) {
    intervalId = setInterval(function () {
      var url = 'http://' + nconf.get('anish-pc-college') + '/containers/' + Id + '/stats?stream=false';
      var previous_total_usage;
      var previous_system_cpu_usage;
      var number_of_cores;

      request(url, function (error, response, body) {
        if(error)
          console.log(error);

        var json = JSON.parse(body);

        var memory_usage = json.memory_stats.usage / 1024 / 1024;
        var received_bytes_per_second = json.networks.eth0.rx_bytes;
        var sent_bytes_per_second = json.networks.eth0.tx_bytes;
        var percpu_usage = json.precpu_stats.cpu_usage.percpu_usage;
        var read_io_usage = json.blkio_stats.io_service_bytes_recursive[0].value;
        var write_io_usage = json.blkio_stats.io_service_bytes_recursive[1].value;
        var sync_io_usage = json.blkio_stats.io_service_bytes_recursive[2].value;
        var async_io_usage = json.blkio_stats.io_service_bytes_recursive[3].value;
        var total_io_usage = json.blkio_stats.io_service_bytes_recursive[4].value;

        previous_total_usage = json.precpu_stats.cpu_usage.total_usage;
        previous_system_cpu_usage = json.precpu_stats.system_cpu_usage;
        number_of_cores = json.precpu_stats.cpu_usage.percpu_usage.length;

        if(memory_usage > memory_usage_threshold)
          raise_alert(Id, 'memory_usage', memory_usage_threshold, memory_usage);

        if(received_bytes_per_second > received_usage_threshold)
          raise_alert(Id, 'received_usage', received_usage_threshold, received_bytes_per_second);

        if(sent_bytes_per_second > sent_usage_threshold)
          raise_alert(Id, 'sent_usage', sent_usage_threshold, sent_bytes_per_second);

        percpu_usage.forEach(function (element, index) {
          if(element > percpu_usage_threshold)
            raise_alert(Id, 'percpu[' + index + ']', percpu_usage_threshold, element);
        });

        if(read_io_usage > read_io_usage_threshold)
          raise_alert(Id, 'read_io', read_io_usage_threshold, read_io_usage);

        if(write_io_usage > write_io_usage_threshold)
          raise_alert(Id, 'write_io', write_io_usage_threshold, write_io);

        if(sync_io_usage > sync_io_usage_threshold)
          raise_alert(Id, 'sync_io', sync_io_usage_threshold, sync_io_usage);

        if(async_io_usage > async_io_usage_threshold)
          raise_alert(Id, 'async_io', async_io_usage_threshold, async_io_usage);

        if(total_io_usage > total_io_usage_threshold)
          raise_alert(Id, 'total_io', total_io_usage_threshold, total_io_usage);

        request(url, function (error, response, body) {
          if(error)
            console.log(error);

          var json = JSON.parse(body);

          var total_usage = json.precpu_stats.cpu_usage.total_usage;
          var system_cpu_usage = json.precpu_stats.system_cpu_usage;

          var total_usage_delta = total_usage - previous_total_usage;
          var system_cpu_usage_delta = system_cpu_usage - previous_system_cpu_usage;

          if ((system_cpu_usage_delta <= 0) || (total_usage_delta <= 0))
              cpu_usage = 0;

          else
              cpu_usage = total_usage_delta / system_cpu_usage_delta * number_of_cores * 100;

          if(cpu_usage > cpu_usage_threshold)
            raise_alert(Id, 'cpu', cpu_usage_threshold, cpu_usage);
        });
      });
    }, monitoring_period);
  }

  function raise_alert(Id, type, threshold_value, current_value) {
    // var transporter = nodemailer.createTransport({
    //     service: 'Gmail',
    //     auth: {
    //         user: 'dockerresourcemanagement@gmail.com',
    //         pass: 'akshayamitanishvivek'
    //     }
    // });
    //
    // var mailOptions = {
    //   from: 'Akshay Soam <akshaysoam8@gmail.com>',
    //   to: 'dockerresourcemanagement@gmail.com',
    //   subject: 'Docker Container Alert',
    //   text: 'It has been observed that Container ID : ' + Id + 'is exceeding the thresholds.\n',
    //   html: '<b>Parameter Type : </b>' + type + '<br /><b>Threshold Value : </b>' + threshold_value + '<br /><b>Current Value : </b>' + current_value
    // };
    //
    // transporter.sendMail(mailOptions, function (error, info) {
    //   console.log('Sending the mail');
    //
    //   if (error)
    //     console.log('Error : ' + error);
    //
    //   else
    //     console.log('Message sent : ' + info.response);
    // });

    var alert = new ALERT();

    alert.container_Id = Id;
    alert.type = type;
    alert.threshold = threshold_value;
    alert.current_value = current_value;
    alert.time = Date();

    alert.save(function (err) {
      if(err) {
        console.log('error while storing alerts');
        console.log(err);
      }
    });
  }

  app.get('/threshold_changed', function (req, res) {
    var parameter_type = req.query.type;
    var new_value = req.query.new_value;

    if(parameter_type == 'cpu')
      cpu_usage_threshold = new_value;

    else if(parameter_type == 'memory')
      memory_usage_threshold = new_value;

    else if(parameter_type == 'read_io_usage')
      read_io_usage_threshold = new_value;

    else if(parameter_type == 'write_io_usage')
      write_io_usage_threshold = new_value;

    else if(parameter_type == 'async_io_usage')
      async_io_usage_threshold = new_value;

    else if(parameter_type == 'sync_io_usage')
      sync_io_usage_threshold = new_value;

    else if(parameter_type == 'total_io_usage')
      total_io_usage_threshold = new_value;

    else if(parameter_type == 'received_usage')
      received_usage_threshold = new_value;

    else if(parameter_type == 'sent_usage')
      sent_usage_threshold = new_value;

    else if(parameter_type == 'cpu')
      cpu_usage_threshold = new_value;

    console.log(parameter_type + ' new value : ' + new_value);
    console.log(read_io_usage_threshold);

    res.end();
  });

  app.get('/monitoring_period_changed', function (req, res) {
    monitoring_period = req.query.new_value * 1000;

    clearInterval(intervalId);
    alert();

    res.end();
  });

  (function (json, key) {
    var id = '20f1654007c11e2fc18d1ebe54190e1b05bce6bfa5be7b359f235d46f9f9c064';
    var url = 'http://' + nconf.get('anish-pc-college') + '/containers/' + id + '/stats?stream=false';
    var key = 'rss';

    request(url, function (error, response, body) {
      if(error)
        console.log(error);

      else {
        var json = JSON.parse(body);
        console.log(json);
        var result = (json instanceof Array) ? array_iterate(json, key) : object_iterate(json, key);

        console.log(result);
      }
    });
  })();

  function array_iterate(obj, key)
  {
    console.log('in array');

    obj.forEach(function (element, index)
    {
      if(element == key)
        return element;

      else if(element.constructor === Array)
        return array_iterate(element, key);

      else if(element.constructor === Object)
        return object_iterate(element, key);
    });

    return null;
  }

  function object_iterate(obj, key)
  {
    console.log('in obj');

    for(var i in obj)
    {
      console.log(i + ' ' + typeof i);

      if(i == 'precpu_stats')
      {
        console.log(i instanceof Object);
      }

      if(i == key)
        return obj[i];

      else if(i.constructor === Array)
        return array_iterate(i, key);

      else if (typeof i == "object")
        return object_iterate(i, key);
    }

    return null;
  }

  app.get('/getAlertData', function (req, res) {
    ALERT.find({}, function (err, docs) {
      var data = [];

      docs.forEach (function (element, index) {
        var temp = false;

        data.forEach(function (obj, ind) {
          if(obj.type == element.type) {
            obj.count++;

            temp = true;

            return false;
          }
        });

        if(temp == false) {
          data.push({ type : element.type, count : 1 });
        }

        if(docs.length == index + 1) {
          console.log(data);
          res.send(data);
        }
      });
    });
  });
}
