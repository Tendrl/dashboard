(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("editUser", {

            restrict: "E",
            templateUrl: "/modules/users/edit-user/edit-user.html",
            bindings: {},
            controller: editUserController,
            controllerAs: "editUserCntrl"
        });

    /*@ngInject*/
    function editUserController($rootScope, $scope, $interval, $state, $stateParams, userStore, config, utils) {

        var vm = this,
            userDetail;

        vm.typePassword = false;
        vm.confirmPassword = false;
        vm.userDetail = [];
        vm.isDataLoading = true;
        vm.user = {};
        vm.errorMsg = "";
        vm.username = $stateParams.userId;
        vm.toggleTypePassword = toggleTypePassword;
        vm.toggleConfirmPassword = toggleConfirmPassword;
        vm.editUser = editUser;

        init();

        function init() {
            if (!userStore.users.length) {
                userStore.getUserList()
                    .then(function(data) {
                        vm.isDataLoading = false;
                        vm.user = userStore.getUserDetail(vm.username);
                        vm.user.emailNotification = vm.user.emailNotification === "enabled" ? true : false;
                        vm.user.status = vm.user.status === "enabled" ? true : false;
                    });
            } else {
                vm.isDataLoading = false;
                vm.user = userStore.getUserDetail(vm.username);
                vm.user.emailNotification = vm.user.emailNotification === "enabled" ? true : false;
                vm.user.status = vm.user.status === "enabled" ? true : false;
            }
        }

        function editUser() {
            if (_validateUIFields()) {
                userStore.editUser(vm.user)
                    .then(function(data) {
                        $rootScope.notification.type = "success";
                        $rootScope.notification.message = "User Succesfully Updated.";
                        $state.go("users");
                    }).catch(function(e) {
                        $rootScope.notification.type = "error";
                        $rootScope.notification.message = "Failed to update User.";
                    });
            } else {
                vm.formSubmitInProgress = false;
            }
        }

        function toggleTypePassword() {
            vm.typePassword = !vm.typePassword;
        }

        function toggleConfirmPassword() {
            vm.confirmPassword = !vm.confirmPassword;
        }


        /***Private Functions***/

        function _validateUIFields() {
            var isFormValid = true,
                form = vm.editUserForm;

            if (form.firstName.$invalid) {
                vm.errorMsg = "Please specify valid First Name."
                isFormValid = false;
            } else if (form.password.$invalid || form.confirmPassword.$invalid) {
                vm.errorMsg = "Please specify valid Password."
                isFormValid = false;
            } else if (!_isPasswordSame()) {
                vm.errorMsg = "Password and Confirm Password doesn't match.";
                isFormValid = false;
            }

            return isFormValid;
        }

        function _isPasswordSame() {
            if (vm.user.password == vm.user.confirmPassword) {
                return true;
            } else {
                return false;
            }
        }
    }

})();