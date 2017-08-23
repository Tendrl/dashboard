(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("clusterDetail", {

            restrict: "E",
            templateUrl: "/modules/clusters/cluster-detail/cluster-detail.html",
            bindings: {},
            controller: clusterDetailController,
            controllerAs: "vm"
        });

    /*@ngInject*/
    function clusterDetailController($stateParams, $scope, $rootScope, $interval, utils, clusterStore, config) {

        var vm = this,
            clusterDetailTimer,
            alerts;


        vm.setTab = setTab;
        vm.isTabSet = isTabSet;
        vm.isDataLoading = true;

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf clusterDetailController
         */
        function init() {
            vm.clusterId = $stateParams.clusterId;
            if (!$rootScope.clusterData) {
                clusterStore.getClusterList()
                    .then(function(data) {
                        $rootScope.clusterData = data;
                        _setClusterDetail();
                        _makeTabList();
                        vm.isDataLoading = false;
                    });
            } else {
                _setClusterDetail();
                _makeTabList();
                vm.isDataLoading = false;
            }
        }

        /**
         * @name checkStatus
         * @desc returns status 
         * @memberOf clusterDetailController
         */
        function checkStatus(clusterObj) {
            var status;
            if (clusterObj.globaldetails.status === "healthy") {
                status = "HEALTH_OK";
            } else if (clusterObj.globaldetails.status === "unhealthy") {
                status = "HEALTH_ERR";
            } else {
                status = clusterObj.globaldetails.status;
            }
            return status;
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(clusterDetailTimer);
        });

        /**
         * @name setTab
         * @desc set tab for a cluster
         * @memberOf clusterDetailController
         */
        function setTab(newTab) {
            vm.activeTab = newTab;
        }

        /**
         * @name isTabSet
         * @desc check if the mentioned tab is set or not
         * @memberOf clusterDetailController
         */
        function isTabSet(tabNum) {
            return vm.activeTab === tabNum;
        }

        /***Private Functions***/

        /**
         * @name _makeTabList
         * @desc returns tab list based on sds name
         * @memberOf clusterDetailController
         */
        function _makeTabList() {
            if(vm.clusterObj.sds_name === "gluster") {
                 vm.tabList = {
                    "Hosts": 1,
                    "Volumes": 2
                };
            } else {
                vm.tabList = {
                    "Hosts": 1,
                    "Pools": 2,
                    "RBDs": 3
                };
            }
            vm.activeTab = vm.tabList["Hosts"];
        }

        /**
         * @name _setClusterDetail
         * @desc set cluster detail
         * @memberOf clusterDetailController
         */
        function _setClusterDetail() {
            vm.clusterObj = clusterStore.getClusterDetails(vm.clusterId);
            vm.clusterName = vm.clusterObj.cluster_name || "NA";
            vm.clusterStatus = checkStatus(vm.clusterObj);
        }

    }

})();
