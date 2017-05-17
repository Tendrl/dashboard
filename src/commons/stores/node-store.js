(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("nodeStore", nodeStore);

    /*@ngInject*/
    function nodeStore($state, $q, utils) {
        var store = this;

        store.generateJournalConf = function(hostList) {
            var list,
                deferred,
                requestData;
                
            deferred = $q.defer();
            requestData = _createJournalPostData(hostList);
            utils.generateJournalConf(requestData)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;
        };

        function _createJournalPostData(hostList) {
            var len,
                i,
                requestData = {
                    "Cluster.node_configuration": {}
                };

            if(hostList.constructor === Array) {
                len = hostList.length;

                for ( i = 0; i < len; i++) {
                    if(hostList[i].selectedRole === "OSD Host" && hostList[i].storage_disks.length) {
                        requestData["Cluster.node_configuration"][hostList[i].node_id] = {storage_disks: hostList[i].storage_disks};
                    }
                }
            } else if(hostList.constructor === Object) {
                if(hostList.selectedRole === "OSD Host" && hostList.storage_disks.length) {
                    requestData["Cluster.node_configuration"][hostList.node_id] = {storage_disks: hostList.storage_disks};
                }
            }

            return requestData;
        }

    }

})();