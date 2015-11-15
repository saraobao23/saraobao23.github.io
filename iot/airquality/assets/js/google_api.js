(function(){
  var api = function(callback, target){
    this._load();
    this._setVariable(target);
  };

  function api_factory(callback, target){
    return new api(callback, target);
  }

  api.prototype._setVariable = function(target){
    this.target = target;

    this.options = {
      'width':500,
      'height':250,
      "colors": ['#FEDA24', '#004411'],
      "areaOpacity": ["0.6"]
    };
  };

  api.prototype._setInitData = function(){
    this.data = new google.visualization.arrayToDataTable([
      ['Year', 'sales'],
      ['',  1000],
      ['',  1170],
      ['',  660],
      ['',  1030]
    ]);
  };

  api.prototype._load = function(){
    //google.setOnLoadCallback(this._init.bind(this));
  };

  api.prototype.drawChart = function () {
    var  _drawChart = this.chart || new google.visualization.AreaChart(this.target);
    _drawChart.draw(this.data, this.options);
  };

  api.prototype.getOptions = function(){
    return this.options;
  };

  api.prototype.setOptions = function(options){
    $.extend(this.option || {}, options);
  };

  api.prototype.getData = function(){
    return this.data;
  };

  api.prototype.setData = function(data){
    this.data = data;
  };

  if(window.yeri){
    window.yeri.googleChart = api_factory;
  } else {
    window.yeri = {};
    window.yeri.googleChart = api_factory;
  }
})();