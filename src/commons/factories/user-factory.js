(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("userFactory", userFactory);

    /*@ngInject*/
    function userFactory($state, $q, $http, utils, config) {
        var vm = this;

        /**
         * @name getUserList
         * @desc Perform user operations
         * @memberOf userFactory
         */
        vm.getUserList = function(data) {
            var url,
                userRequest,
                request;

            //url = config.baseUrl + "users";
            url = "/api/GetUserList.json";

            userRequest = {
                method: "GET",
                url: url,
                data: data
            };

            request = angular.copy(userRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
                return null;
            });
        };

        vm.createUser = function(data) {
            var url,
                actionRequest,
                request;

            url = config.baseUrl + "users";

            actionRequest = {
                method: "POST",
                url: url,
                data: data
            };
            request = angular.copy(actionRequest);
            console.log(request);

            return $http(request).then(function(response) {
                console.log(request);
                console.log(response);
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
            });
        };
    }

})();