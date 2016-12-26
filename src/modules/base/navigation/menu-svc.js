(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("menuService", menuService);

    /*@ngInject*/
    function menuService() {

        /* Cache the reference to this pointer */
        var vm = this;

        vm.menus = [{
            label: 'Clusters',
            id: 'cluster',
            href: 'cluster',
            icon: 'pficon pficon-cluster',
            active: false
        }, {
            label: 'Hosts',
            id: 'host',
            href: 'host',
            icon: 'pficon pficon-container-node',
            active: false
        }, {
            label: 'File Shares',
            id: 'file-share',
            href: 'file-share',
            icon: 'fa fa-database',
            active: false
        }, {
            label: 'Pools',
            id: 'pool',
            href: 'pool',
            icon: 'fa fa-database',
            active: false
        }];

        vm.setActive = function(menuId) {
            vm.menus.map(function(menu){
                menu.active = menu.id === menuId;
                return menu;
            });
        }
        
        vm.getMenus = function() {
            return vm.menus;
        };
    }

})();