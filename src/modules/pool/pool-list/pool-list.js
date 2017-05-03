(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("poolController", poolController);

    /*@ngInject*/
    function poolController($scope, $rootScope, $state, $interval, config, utils) {
        var vm = this,
            key,
            len,
            poolList = [],
            pool,
            list,
            i,
            poolListTimer,
            clusterObj,
            powValue = 7;

        vm.createPool = createPool;
        vm.onOpenGrowPGModal = onOpenGrowPGModal;
        vm.onOpenPoolEditModal = onOpenPoolEditModal;
        vm.growPGs = growPGs;
        vm.EditPool =EditPool;
        vm.viewTaskProgress = viewTaskProgress;
        vm.getpgCountValue = getpgCountValue;
        vm.revertReplicasValue = revertReplicasValue;

        vm.isDataLoading = true;
        vm.errorInProcess = false;
        vm.showClusterNAMsg = false;
        vm.errorInProcess = false;

        init();

        function init() {
            list = utils.getPoolDetails($scope.clusterId);
            _createPoolList(list);
            vm.isDataLoading = false;
            startTimer();
        }

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function (event, data) {
            /* Forward to home view if we don't have any cluster */    
            if($rootScope.clusterData === null || $rootScope.clusterData.clusters.length === 0){
                $state.go("home");
            } else {
                init();
            }
        });

        function startTimer() {

            poolListTimer = $interval(function() {
                // if (!$rootScope.clusterData) {
                    utils.getObjectList("Cluster")
                        .then(function(data) {
                            $interval.cancel(poolListTimer);
                            $rootScope.clusterData = data;
                            init();
                        });
                // }

            }, 1000 * config.refreshIntervalTime, 1);
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(poolListTimer);
        });


        function _createPoolList(list) {

            len = list.length;
            poolList = [];

            for ( i = 0; i < len; i++) {
                pool = {};
                clusterObj = {};
                pool.clusterName = "Unassigned";
                pool.name = list[i].pool_name;
                pool.clusterId = list[i].cluster_id;
                pool.pgCount = list[i].pg_num;
                pool.id = list[i].pool_id;
                pool.minSize = list[i].min_size;
                clusterObj = utils.getClusterDetails(list[i].cluster_id);
                if(typeof clusterObj !== "undefined") {
                    pool.clusterName = clusterObj.cluster_name;
                    pool.utilizationAvailable = clusterObj.utilization.available;
                }
                pool.status = "NA";
                pool.type = list[i].type;
                pool.utilization = {"percent_used": list[i].percent_used };
                if (list[i].type === "erasure_coded"){
                    pool.type = "Erasure Coded";
                    if(list[i].erasure_code_profile === "default"){
                        pool.ECProfile = "2+1";
                    } else {
                        pool.ECProfile = list[i].erasure_code_profile;
                    }
                } else {
                    pool.replicaCount = list[i].size;
                }
                pool.minReplicaCount = list[i].min_size;
                pool.osdCount = "NA";
                pool.quotas = "NA";
                pool.quota_enabled = list[i].quota_enabled;
                if(list[i].quota_enabled){
                    if(list[i].quota_enabled.toLowerCase() === "false") {
                        pool.quotas = "Disabled";
                        pool.quota_max_objects = list[i].quota_max_objects;
                        pool.quota_max_bytes = list[i].quota_max_bytes;

                    } else if(list[i].quota_enabled.toLowerCase() === "true") {
                        pool.quota_max_objects = list[i].quota_max_objects;
                        pool.quota_max_bytes = list[i].quota_max_bytes;
                        if(pool.quota_max_bytes !== "0" && pool.quota_max_objects !=="0"){
                            pool.quotas = pool.quota_max_bytes + "%, " + pool.quota_max_objects + " objects"
                        }
                        else if(pool.quota_max_bytes !== "0"){
                            pool.quotas = pool.quota_max_bytes + "%";
                        }
                        else if(pool.quota_max_objects !== "0"){
                            pool.quotas = pool.quota_max_objects + " objects";
                        }
                    }
                }
                pool.alertCount = "NA";
                
                poolList.push(pool);
                
            }
            vm.poolList = poolList;
        }


        function onOpenPoolEditModal(pool)
        { 
            vm.editPoolObj = {};
            vm.editPoolStep = 1;
            vm.editPoolObj = pool;
            vm.editPoolObj.poolName = pool.name;
            vm.editPoolObj.pgCount = pool.pgCount;
            vm.editPoolObj.utilization = pool.utilizationAvailable;
            vm.editPoolObj.quota_max_bytes = 1;
            vm.editPoolObj.checkboxModelQuotasValue = (vm.editPoolObj.quota_enabled === "True") ? true : false;
            vm.editPoolObj.checkboxModelQuotasMaxObjectValue = false;
            vm.editPoolObj.checkboxModelQuotasMaxPercentageValue = false;
            vm.editPoolObj.checkboxModelReplicas = false;
            vm.editPoolObj.defaultReplicaCount = parseInt(pool.replicaCount);
            vm.editPoolObj.defaultMinReplicaCount = parseInt(pool.minReplicaCount);
            vm.editPoolObj.editReplicaCount = parseInt(pool.replicaCount);
            vm.editPoolObj.editMinReplicaCount = parseInt(pool.minReplicaCount);
            vm.editPoolObj.quota_max_objects = parseInt(vm.editPoolObj.quota_max_objects);
            vm.editPoolObj.quota_max_bytes = parseInt(vm.editPoolObj.quota_max_bytes);
            vm.editPoolObj.checkboxModelNoChange = false;
            vm.editPoolObj.checkboxModelNoDelete = false;
            vm.editPoolObj.checkboxModelNoScrub = false;
            vm.editPoolObj.checkboxModelNoDeepScrub = false;
        }

        function revertReplicasValue(){
            if(vm.editPoolObj.checkboxModelReplicas === true){
                vm.editPoolObj.editReplicaCount = vm.editPoolObj.defaultReplicaCount;
                vm.editPoolObj.editMinReplicaCount = vm.editPoolObj.editMinReplicaCount;
            }
        }

        function EditPool(){
            var postData;

            postData = {
                        "Pool.pool_id": parseInt(vm.editPoolObj.id),
                        "Pool.min_size": parseInt(vm.editPoolObj.editMinReplicaCount),
                        "Pool.size": parseInt(vm.editPoolObj.editReplicaCount)
                        };
            if(vm.editPoolObj.checkboxModelQuotasValue){
                postData["Pool.quota_enabled"] = vm.editPoolObj.checkboxModelQuotasValue;
                if(vm.editPoolObj.checkboxModelQuotasMaxPercentageValue){
                    postData["Pool.quota_max_bytes"] = vm.editPoolObj.quota_max_bytes;
                }
                if(vm.editPoolObj.checkboxModelQuotasMaxObjectValue){
                    postData["Pool.quota_max_objects"] = vm.editPoolObj.quota_max_objects;
                }
            }
            
            utils.takeAction(postData, "CephUpdatePool", "PUT", vm.editPoolObj.clusterId)
                .then(function(response) {
                    // $rootScope.notification.type = "success";
                    // $rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
                    vm.editPoolStep = 4;
                    vm.jobId = response.job_id;
                })
                .catch(function(error) {
                    vm.errorInProcess = true;
                    vm.editPoolStep = 4;
                });
            
            }

        function onOpenGrowPGModal(pool) {
            vm.growPGStep = 1;
            vm.growPGtaskSubmitted = false;
            vm.growPGPool = pool;
            vm.updatedPool = {};
            vm.updatedPool.pgCount = vm.growPGPool.pgCount = parseInt(vm.growPGPool.pgCount);
            vm.updatedPool.incPGCnt = "immediate";

        }

        function getpgCountValue(pgCount){
            var number;
            number = Math.pow(2,powValue);
            if(number < pgCount){
                powValue += 1
            }else if(number > pgCount){
                 powValue -= 1
            }
            vm.updatedPool.pgCount = parseInt(Math.pow(2,powValue).toFixed(0));
        }

        function growPGs() {
            var postData;

            postData = { "Pool.pool_id": parseInt(vm.growPGPool.id), "Pool.pg_num": vm.updatedPool.pgCount};
            
            utils.takeAction(postData, "CephUpdatePool", "PUT", vm.growPGPool.clusterId)
                .then(function(response) {
                    // $rootScope.notification.type = "success";
                    // $rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
                    vm.growPGStep = 2;
                    vm.jobId = response.job_id;
                })
                .catch(function(error) {
                    vm.errorInProcess = true;
                    vm.growPGStep = 2;
                });
        }

        function viewTaskProgress(modalId) {
            $(modalId).modal("hide");
            
            setTimeout(function() {
                $state.go("task-detail", {taskId: vm.jobId});
            },1000);
        }

        function createPool() {
            $state.go("create-pool");
        }
    }

})();