(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("volumeList", {

            restrict: "E",
            templateUrl: "/modules/volumes/volume-list/volume-list.html",
            bindings: {
                clusterId: "=?"
            },
            controller: volumeController,
            controllerAs: "volumeCntrl"
        });

    /*@ngInject*/
    function volumeController($scope, $rootScope, $state, $interval, utils, config, volumeStore) {
        var vm = this,
            volumeTimer,
            volumeList;

        vm.isDataLoading = true;
        vm.flag = false;
        vm.volumeList = [];
        vm.filtersText = "";
        vm.filters = [];

        vm.getRebalStatus = volumeStore.getRebalStatus;
        vm.redirectToGrafana = redirectToGrafana;
        vm.goToVolumeDetail = goToVolumeDetail;
        vm.addTooltip = addTooltip;
        vm.toggleProfiling = toggleProfiling;
        vm.goToTaskDetail = goToTaskDetail;
        vm.filteredVolumeList = [];
        vm.showDisableBtn = showDisableBtn;
        vm.showEnableBtn = showEnableBtn;

        vm.sortConfig = {
            fields: [{
                id: "name",
                title: "Name",
                sortType: "alpha"
            }, {
                id: "status",
                title: "Status",
                sortType: "alpha"
            }],
            onSortChange: _sortChange,
            currentField: {
                id: "name",
                title: "Name",
                sortType: "alpha"
            },
            isAscending: true
        };

        vm.filterConfig = {
            fields: [{
                id: "name",
                title: "Name",
                placeholder: "Filter by Name",
                filterType: "text"
            }, {
                id: "status",
                title: "Status",
                placeholder: "Filter by Status",
                filterType: "select",
                filterValues: ["Started", "Stopped"]
            }, {
                id: "type",
                title: "Type",
                placeholder: "Filter by Type",
                filterType: "select",
                filterValues: ["Distribute", "Replicated", "Dispersed", "Distributed-Dispersed"]
            }],
            appliedFilters: [],
            onFilterChange: _filterChange
        };

        init();

        function init() {

            volumeStore.getVolumeList(vm.clusterId)
                .then(function(data) {
                    $interval.cancel(volumeTimer);
                    vm.volumeList = data;
                    vm.filteredVolumeList = vm.volumeList;
                    _filterChange(vm.filters);
                    _sortChange(vm.sortConfig.currentField.id, vm.sortConfig.isAscending);
                    vm.isDataLoading = false;
                    startTimer();
                });
        }

        function toggleProfiling(volume, action, $event) {

            volumeStore.toggleProfiling(volume, action, vm.clusterId)
                .then(function(data) {
                    volume.disableAction = true;
                    $interval.cancel(volumeTimer);
                    startTimer();
                });

            $event.stopPropagation();
        }

        function goToTaskDetail(volume) {
            $rootScope.selectedClusterOption = vm.clusterId;
            $state.go("task-detail", { clusterId: vm.clusterId, taskId: volume.currentTask.job_id });
        }

        function startTimer() {
            volumeTimer = $interval(function() {
                init();
            }, 1000 * config.volumeRefreshInterval, 1);
        }

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function(event, data) {
            /* Forward to home view if we don't have any cluster */
            if ($rootScope.clusterData === null || $rootScope.clusterData.length === 0) {
                $state.go("clusters");
            } else {
                init();
            }
        });

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(volumeTimer);
        });

        function redirectToGrafana(volume, $event) {
            utils.redirectToGrafana("volumes", $event, {
                clusterId: vm.clusterId,
                volumeName: volume.name
            });
        }

        function goToVolumeDetail(volume) {
            if (vm.clusterId) {
                $state.go("volume-detail", { clusterId: vm.clusterId, volumeId: volume.volumeId });
            }
        }

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }

        function showDisableBtn(volume) {
            return (volume.profileStatus === "Enabled" ||
                (volume.currentTask.job_name === "StopProfiling" &&
                    volume.currentTask.status === "in_progress"));
        }

        function showEnableBtn(volume) {
            return (volume.profileStatus === "Disabled" ||
                (volume.currentTask.job_name === "StartProfiling" &&
                    volume.currentTask.status === "in_progress"));
        }

        /*****Private Functions******/

        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");

            if (filter.id === "name") {
                match = item.name.match(re) !== null;
            } else if (filter.id === "status") {
                match = item.status === filter.value.id || item.status === filter.value;
            } else if (filter.id === "type") {
                match = item["type"] === filter.value.id || item["type"].toLowerCase() === filter.value.toLowerCase();
            }
            return match;
        }

        function _matchesFilters(item, filters) {
            var matches = true;

            filters.forEach(function(filter) {
                if (!_matchesFilter(item, filter)) {
                    matches = false;
                    return false;
                }
            });
            return matches;
        }

        function _applyFilters(filters) {
            vm.filteredVolumeList = [];
            if (filters && filters.length > 0) {
                vm.volumeList.forEach(function(item) {
                    if (_matchesFilters(item, filters)) {
                        vm.filteredVolumeList.push(item);
                    }
                });
            } else {
                vm.filteredVolumeList = vm.volumeList;
            }
            vm.filterConfig.resultsCount = vm.filteredVolumeList.length;
        }

        function _filterChange(filters) {
            vm.filtersText = "";
            vm.filters = filters;
            filters.forEach(function(filter) {
                vm.filtersText += filter.title + " : ";
                if (filter.value.filterCategory) {
                    vm.filtersText += ((filter.value.filterCategory.title || filter.value.filterCategory) +
                        filter.value.filterDelimiter + (filter.value.filterValue.title || filter.value.filterValue));
                } else if (filter.value.title) {
                    vm.filtersText += filter.value.title;
                } else {
                    vm.filtersText += filter.value;
                }
                vm.filtersText += "\n";
            });

            _applyFilters(filters);
        }

        function _compareFn(item1, item2) {
            var compValue = 0,
                sortId = vm.sortConfig.currentField.id;

            compValue = item1[sortId].localeCompare(item2[sortId]);

            if (!vm.sortConfig.isAscending) {
                compValue = compValue * -1;
            }

            return compValue;
        }

        function _sortChange(sortId, isAscending) {
            vm.volumeList.sort(_compareFn);
        }

    }

})();
