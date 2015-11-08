(function(){
  var dataReceiver = {},
      timeGetter = {},
      $dom = {};

  $dom.init = function(){
    this.current_val = $(".current_val");
    this.max_value = $(".max_value");
    this.min_value = $(".min_value");
  };

  timeGetter.getTimeStamp = function(is_first){
    var d = new Date();

    var s =
        this.leadingZeros(d.getFullYear(), 4) + '-' +
        this.leadingZeros(d.getMonth() + 1, 2) + '-' +
        this.leadingZeros(d.getDate(), 2) + ' ';

        if(is_first){
          s += "00:00:00";
        } else {
          s += "23:59:59";
        }

    return s;
  };

  timeGetter.leadingZeros = function (n, digits) {
    var zero = '';
    n = n.toString();

    if (n.length < digits) {
      for (i = 0; i < digits - n.length; i++)
        zero += '0';
    }
    return zero + n;
  };

  dataReceiver.getData = function(callback){
    var call_url = "http://api.thingspeak.com/channels/55251/feed.json";

    $.ajax({
      "url": call_url ,
      "type": "get"
    }).then(function(data){
      var list = dataReceiver.parseList(data);
      var defaultTemplate = [['Year', '오염도']],
          list_max = list.length;

      $.each(list, function(i, e){
        if(e.field2){
          defaultTemplate.push(["", parseInt(e.field2)]);
        }

        if(i > list_max - 5 && e.field2){
          $dom.current_val.html(e.field2);
        }
      });

      var data = new google.visualization.arrayToDataTable(defaultTemplate);

      yeri.googleChart.setData(data);
      yeri.googleChart.drawChart();
    });
  };

  dataReceiver.getMaxMinData = function(){
    $dom.init();
    dataReceiver.getMaxMinDataFunc();
    setInterval(this.getMaxMinDataFunc, 10000);
  };

  dataReceiver.getMaxMinDataFunc = function(){
    var start_temp = "{{start_time}}",
        end_temp = "{{end_time}}",
        call_url = "https://thingspeak.com/channels/55251/feed.json?start=" + start_temp + "&end=" + end_temp;
    call_url = call_url.replace(start_temp, timeGetter.getTimeStamp(true));
    call_url = call_url.replace(end_temp, timeGetter.getTimeStamp());

    $.ajax({
      "url": call_url,
      "type": "get"
    }).then(function(data){
      var list = dataReceiver.parseList(data);
      var field2_list = $.map(list, function(e, i){
        if(e.field2){
          return parseInt(e.field2);
        }
      });

      $dom.max_value.html(Math.max.apply(null, field2_list));
      $dom.min_value.html(Math.min.apply(null, field2_list));
    });
  };

  dataReceiver.setPolling = function(callback){
    setInterval(this.getData, 2000);
  };

  dataReceiver.parseList = function (data){
    var feeds = data.feeds;

    var list = _.map(feeds, function(feed_d){
      return _.pick(feed_d, "field1", "field2");
    });

    return list;
  };

  if(window.yeri){
    window.yeri.dataReceiver = dataReceiver;
  } else {
    window.yeri = {};
    window.yeri.dataReceiver = dataReceiver;
  }
})();