(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("generateForm", generateForm);

    /*@ngInject*/
    function generateForm() {

        return {
            restrict: "E",

            scope: {
                formAttributes: "=",
                submitBtnName: "@"
            },

            replace: false,  

            controller: function($scope, actionStore) {

                $scope.performAction = function() {
                    $scope.requestData = _manipulateData();
                    actionStore.takeAction($scope.requestData);
                };

                function _manipulateData() {
                    var keys = Object.keys($scope.formAttributes),
                        len = keys.length,
                        i, 
                        requestData = {};

                    for (i = 0; i < len; i++) {
                        requestData[keys[i]] = $scope.formAttributes[keys[i]].value;
                    }
                    return requestData;
                }
            },

            link: function(scope, element, attrs) {

            },

            template: "<div class='container'>" + 
                                    "<div class='col-md-offset-2 col-md-8'>" +
                                        "<form class='form-horizontal' role='form' ng-submit='performAction()'>" +
                                            "<div class='form-group' ng-repeat='attribute in formAttributes'>" +
                                                "<label class='col-sm-3 control-label'>{{attribute.name}}</label>" +
                                                "<generate-form-field attribute-details='attribute' field-name='key'></generate-form-field>" +
                                            "</div>" +
                                            "<div class='form-group'>" +
                                                "<div class='col-sm-9 col-sm-offset-3'>" +
                                                    "<button type='submit' class='btn btn-primary btn-block'>{{submitBtnName}}</button> " +
                                                "</div>" +
                                            "</div>" +
                                        "</form>" +
                                    "</div>" +
                                "</div>"

        };
    }

}());
