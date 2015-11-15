(function(){
  var dataReceiver = function(api_obj, option_obj){
        this.api_obj = api_obj;

        this._init(option_obj);
      },
      timeGetter = {};

  function dataReceiverFactory(api_obj, option_obj){
    var dataReceiverObj = new dataReceiver(api_obj, option_obj);

    dataReceiverObj.setPolling();
    dataReceiverObj.getMaxMinData();

  }

  dataReceiver.prototype._init = function(option_obj){
    var target_id = "#" + this.api_obj.target.id;
    var data_field = $(target_id).parent().next();

    this.field_name = option_obj.field_name;
    this.current_val_el = data_field.find(".current_val");
    this.max_value_el = data_field.find(".max_value");
    this.min_value_el = data_field.find(".min_value");

    if(option_obj){
      this.call_url = option_obj.call_url;
      this.column_name = option_obj.column_name;
    }
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

  dataReceiver.prototype.getData = function(callback){
    var self = this;

    var call_url = this.call_url;

    $.ajax({
      "url": call_url ,
      "type": "get"
    }).then(function(data){
      var list = self.parseList(data);
      var defaultTemplate = [[
            {label: 'temp', type: 'string'},
            {label: self.column_name, type: 'number'},
            {type: 'string', role: 'tooltip'}
            ]
          ],
          list_max = list.length;

      $.each(list, function(i, e){
        var list_property = e[self.field_name];

        if(list_property){
          list_property = parseInt(list_property);
          defaultTemplate.push(["", list_property , self.column_name + " : " + list_property + "\n" + moment(e["created_at"]).format("a hh:mm:ss")]);
        }

        if(i > list_max - 5 && list_property){
          self.current_val_el.html(parseFloat(list_property).toFixed(0));
        }
      });

      var data = new google.visualization.arrayToDataTable(defaultTemplate);

      self.api_obj.setData(data);
      self.api_obj.drawChart();
    });
  };

  dataReceiver.prototype.getMaxMinData  = function(){
    setInterval(this.getMaxMinDataFunc.bind(this), 10000);
  };

  dataReceiver.prototype.getMaxMinDataFunc = function(){
    var self = this;

    var start_temp = "{{start_time}}",
        end_temp = "{{end_time}}",
        call_url = this.call_url + "?start=" + start_temp + "&end=" + end_temp;
    call_url = call_url.replace(start_temp, timeGetter.getTimeStamp(true));
    call_url = call_url.replace(end_temp, timeGetter.getTimeStamp());

    $.ajax({
      "url": call_url,
      "type": "get"
    }).then(function(data){
      var list = self.parseList(data);
      var field_list = $.map(list, function(e, i){
        if(e[self.field_name]){
          return parseInt(e[self.field_name]);
        }
      });

      self.max_value_el.html(Math.max.apply(null, field_list));
      self.min_value_el.html(Math.min.apply(null, field_list));
    });
  };

  dataReceiver.prototype.setPolling = function(){
    setInterval(this.getData.bind(this), 2000);
  };

  dataReceiver.prototype.parseList = function (data){
    var feeds = data.feeds,
        self = this;

    var list = _.map(feeds, function(feed_d){
      return _.pick(feed_d, self.field_name, "created_at");
    });

    return list;
  };

  if(window.yeri){
    window.yeri.dataReceiver = dataReceiverFactory;
  } else {
    window.yeri = {};
    window.yeri.dataReceiver = dataReceiverFactory;
  }
})();