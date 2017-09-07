(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("clusterStore", clusterStore);

    /*@ngInject*/
    function clusterStore($state, $q, $rootScope, nodeStore, clusterFactory) {
        var store = this;

        /**
         * @name getClusterList
         * @desc store for GetClusterList
         * @memberOf clusterStore
         */
        store.getClusterList = function() {
            var deferred;

            deferred = $q.defer();
            clusterFactory.getClusterList()
                .then(function(data) {
                    //list = data ? _formatClusterData(data.clusters) : [];
                    $rootScope.clusterData = data.clusters;
                    deferred.resolve(data.clusters);
                });

            return deferred.promise;
        };

        store.formatClusterData = function(data) {
            var len = data.length,
                res = [],
                temp = {},
                i;

            for (i = 0; i < len; i++) {
                temp = {};
                temp.integrationId = data[i].integration_id;
                temp.sdsVersion = data[i].sds_version;
                temp.sdsName = data[i].sds_name;
                temp.name = data[i].cluster_name;
                temp.clusterId = data[i].cluster_id;
                temp.isProfilingEnabled = data[i].enable_volume_profiling === "yes" ? "Enabled" : "Disabled";
                temp.managed = data[i].is_managed === "yes" ? "Yes" : "No";

                if (temp.managed === "Yes") {
                    if (temp.sdsName === "gluster") {
                        if (data[i].globaldetails.status === "healthy") {
                            temp.status = "HEALTH_OK";
                        } else if (data[i].globaldetails.status === "unhealthy") {
                            temp.status = "HEALTH_ERR";
                        }
                    } else {
                        temp.status = data[i].globaldetails.status;
                    }
                }

                temp.errors = data[i].errors ? data[i].errors : [];

                if (temp.managed === "No") {
                    temp.message = temp.errors.length ? "Cluster Misconfigured" : "Ready to Import";
                } else {
                    temp.message = "Ready to Use";
                }
                temp.hosts = store.getAssociatedHosts(data[i]);
                temp.activeTab = 1;
                res.push(temp);
            }
            return res;
        };

        /**
         * @name getAssociatedHosts
         * @desc returns the associated host with a cluster
         * @memberOf clusterStore
         */
        store.getAssociatedHosts = function(data) {
            var hostList = [],
                keys = Object.keys(data.nodes),
                len = keys.length,
                temp,
                obj,
                tags,
                i;

            for (i = 0; i < len; i++) {
                obj = data.nodes[keys[i]];
                temp = {};
                temp.nodeId = obj.node_id;
                temp.fqdn = obj.fqdn;
                temp.status = obj.status;
                tags = nodeStore.findRole(obj.tags);
                temp.role = tags.role;
                temp.release = tags.release !== "NA" ? (tags.release + " " + data.sds_version) : "NA";
                hostList.push(temp)
            }

            return hostList;
        };

        /**
         * @name importCluster
         * @desc store for import cluster
         * @memberOf clusterStore
         */
        store.importCluster = function(cluster, enableProfiling) {
            var requestData = {
                    "Cluster.enable_volume_profiling": enableProfiling ? "yes" : "no"
                },
                deferred;

            deferred = $q.defer();
            clusterFactory.importCluster(requestData, cluster.clusterId)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;
        };

        /**
         * @name getClusterDetails
         * @desc return details of a cluster
         * @memberOf clusterStore
         */
        store.getClusterDetails = function(clusterId) {
            var clusterObj,
                clusterData,
                len,
                i;

            if ($rootScope.clusterData !== null && typeof clusterId !== "undefined") {
                clusterData = $rootScope.clusterData;
                len = clusterData.length;

                for (i = 0; i < len; i++) {

                    if (clusterData[i].cluster_id === clusterId) {
                        clusterObj = clusterData[i];
                        break;
                    }
                }
            }

            return clusterObj;
        };

        /**
         * @name doProfilingAction
         * @desc enable/disable volume profile for cluster
         * @memberOf clusterStore
         */
        store.doProfilingAction = function(clusterId, action) {
            var deferred;

            deferred = $q.defer();
            clusterFactory.doProfilingAction(clusterId, action)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;
        };

    }

})();
