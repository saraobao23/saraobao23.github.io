(function(){
  var api = {};

  api.init = function(callback, target){
    this._setVariable(target);
    this._load();
  };

  api._setVariable = function(target){
    this.target = target;

    this.options = {
      'width':"100%",
      'height':400,
      "colors": ['#FEDA24','#004411'],
      "areaOpacity": ["0.6"],

    };
  };

  api._setInitData = function(){
    this.data = new google.visualization.arrayToDataTable([
      ['Year', 'sales'],
      ['',  1000],
      ['',  1170],
      ['',  660],
      ['',  1030]
    ]);
  };

  api._load = function(){
    google.load('visualization', '1', {'packages':['corechart']});
    //google.setOnLoadCallback(this._init.bind(this));
  }

  api._init = function(){
    this._setInitData();
    this.drawChart();
  };

  api.drawChart = function () {
    var  _drawChart = this.chart || new google.visualization.AreaChart(this.target);
    _drawChart.draw(api.data, api.options);
  };

  api.getOptions = function(){
    return this.options;
  };

  api.setOptions = function(options){
    $.extend(this.option || {}, options);
  };

  api.getData = function(){
    return this.data;
  };

  api.setData = function(data){
    this.data = data;
  };

  if(window.yeri){
    window.yeri.googleChart = api;
  } else {
    window.yeri = {};
    window.yeri.googleChart = api;
  }
})();