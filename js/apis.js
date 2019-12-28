// Copyright (c) Cingulara LLC 2019 and Tutela LLC 2019. All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007 license. See LICENSE file in the project root for full license information.

// loading all APIs here
// using a configmap in k8s and openshift to set these dynamically works better
// will be set in the template or xxxxx-configmap.yml file

// if the ports in the stack.yml are changed, this has to be modified as well. 
// anyone editing the YAML can edit this file.

// if this is the dev-stack.yml
if (window.location.port == 9080) { 
    var root = 'http://' + document.location.hostname
    var readAPI = root + ':9084'
    var scoreAPI = root + ':9090'
    var saveAPI = root + ':9082'
    var uploadAPI = root + ':9086'
    var templateAPI = root + ':9088'
    var complianceAPI = root + ':9092'
    var controlAPI = root + ':9094'
} 
// if this is the stack.yml, web, k8s, or other configuration use the real one
else { 
    var root = 'http://' + document.location.hostname
    var readAPI = root + ':8084'
    var scoreAPI = root + ':8090'
    var saveAPI = root + ':8082'
    var uploadAPI = root + ':8086'
    var templateAPI = root + ':8088'
    var complianceAPI = root + ':8092'
    var controlAPI = root + ':8094'
}