// Copyright (c) Cingulara LLC 2020 and Tutela LLC 2020. All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007 license. See LICENSE file in the project root for full license information.

// loading all APIs here
// using a configmap in k8s and openshift to set these dynamically works better
// will be set in the template or xxxxx-configmap.yml file

    var root = document.location.protocol + '//' + document.location.host;
    var readAPI = root + '/api/read/artifact/';
    var scoreAPI = root + '/api/scoring/';
    var saveAPI = root + '/api/read/save/';
    var uploadAPI = root + '/api/read/upload/';
    var templateAPI = root + '/api/template/';
    var complianceAPI = root + '/api/read/compliance/';
    var controlAPI = root + '/api/control/';
    var auditAPI = root + '/api/audit/';
    var reportAPI = root + '/api/report/';

    // menu link to load Keycloak Groups and Users
    var urlKeycloakMenuLink = document.location.protocol + '//' + document.location.host + "/auth/admin/master/console/#/openrmf/users";
    // menu link to load Grafana Metrics
    var urlMetricsMenuLink = document.location.protocol + '//' + document.location.host + "/metrics/";