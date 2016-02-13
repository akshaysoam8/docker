var request = require('request');
var chalk = require('chalk');
var nconf = require('nconf');

var Cpu_usage_schema = require('../model/cpu_usage');
var Memory_usage_schema = require('../model/memory_usage');
var Network_usage_schema = require('../model/network_usage');
var PerCpu_usage_schema = require('../model/percpu_usage');
var IO_usage_schema = require('../model/io_usage');

nconf.file("db", './config/config.json');

var one_minute = 5*1000;
var five_minute = 10*1000;
var half_hour = 15*1000;
var one_hour = 30*1000;
var twelve_hours = 45*1000;
var one_day = 60*1000;
var one_week = 75*1000;

var mongoose;

var timer = [one_minute, five_minute, half_hour, one_hour, twelve_hours, one_day, one_week ];

function monitor(_mongoose) {
  var url = 'http://' + nconf.get('anish-pc-college') +'/containers/json';

  mongoose = _mongoose;

  request(url, function (error, response, body) {
    if(error)
      console.log(error);
    else {
      JSON.parse(body).forEach(function (element, index) {
        startMonitor(element.Id);
      });
    }
  });
}

function startMonitor (Id) {
  timer.forEach(function (element, index) {
    setInterval(function () {
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

        var MEMORY_USAGE = mongoose.model('Memory_usage', Memory_usage_schema, element + '_Memory');

        var Memory_usage = new MEMORY_USAGE();

        Memory_usage.container_Id = Id;
        Memory_usage.memory_usage = memory_usage;

        Memory_usage.save(function (err) {
          if(err) {
            console.log('memory usage db connection error');
            console.log(err);
          }
        });

        var NETWORK_USAGE = mongoose.model('Network_usage', Network_usage_schema, element + '_Network');

        var Network_usage = new NETWORK_USAGE();

        Network_usage.container_Id = Id;
        Network_usage.received_usage = received_bytes_per_second;
        Network_usage.sent_usage = sent_bytes_per_second;

        Network_usage.save(function (err) {
          if(err) {
            console.log('network usage db connection error');
            console.log(err);
          }
        });

        var PERCPU_USAGE = mongoose.model('Percpu_usage', PerCpu_usage_schema, element + '_Percpu');

        var Percpu_usage = new PERCPU_USAGE();

        Percpu_usage.container_Id = Id;
        Percpu_usage.Core0 = percpu_usage[0];
        Percpu_usage.Core1 = percpu_usage[1];
        Percpu_usage.Core2 = percpu_usage[2];
        Percpu_usage.Core3 = percpu_usage[3];

        Percpu_usage.save(function (err) {
          if(err) {
            console.log('per cpu usage db connection error');
            console.log(err);
          }
        });

        var IO_USAGE = mongoose.model('IO_usage', IO_usage_schema, element + '_IO');

        var IO_usage = new IO_USAGE();

        IO_usage.container_Id = Id;
        IO_usage.read = read_io_usage;
        IO_usage.write = write_io_usage;
        IO_usage.sync = sync_io_usage;
        IO_usage.async = async_io_usage;
        IO_usage.total = total_io_usage

        IO_usage.save(function (err) {
          if(err) {
            console.log('io usage db connection error');
            console.log(err);
          }
        });

        setTimeout(function () {
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

          var CPU_USAGE = mongoose.model('Cpu_usage', Cpu_usage_schema, element + '_Cpu');

          var Cpu_usage = new CPU_USAGE();

          Cpu_usage.container_Id = Id;
          Cpu_usage.cpu_usage = cpu_usage;

          Cpu_usage.save(function (err) {
            if(err) {
              console.log('cpu usage db connection error');
              console.log(err);
            }
          });

        });
      }, 1000);
      });
    }, element);
  });
}

module.exports = monitor;
