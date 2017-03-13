(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("dashboardController", dashboardController);

    /*@ngInject*/
    function dashboardController($scope, $rootScope, $state, $interval, utils, config) {
        var vm = this;
            
        vm.chartData = [];

        vm.barChartTitleData = null;
        vm.barChartData = [];
        vm.horizontalBarChartData = [];

        init();

        function init() {
            utils.getObjectList("trends-chart")
                .then(function(data) {
                    vm.chartData = data[0].datapoints;
                });
            utils.getObjectList("bar-chart")
                .then(function(data) {
                    vm.barChartTitleData = data.chartTitleData;
                    vm.barChartData = data.chartData;
                    vm.horizontalBarChartData = data.horizontalBarChartData;
                });
        }

        vm.IOPSConfig = {
            "chartId": "IOPSTrendsChart",
            "layout": "small",
            "units": "K",
            "tooltipType": "actual",
            "title": "IOPS",
            "timeFrame": "Last 24 hours"
        };

        vm.latencyConfig = {
            "chartId": "LatencyTrendsChart",
            "layout": "small",
            "units": "ms",
            "tooltipType": "actual",
            "title": "Latency",
            "timeFrame": "Last 24 hours"
        };

        

    }

})();
