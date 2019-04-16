// loading all APIs here
// using a configmap in k8s and openshift to set these dynamically works better
// will be set in the template or xxxxx-configmap.yml file

// if the ports in the stack.yml are changed, this has to be modified as well. 
// anyone editing the YAML can edit this file.

// if this is the stack.yml
if (window.location.port == 8080) { 
    var readAPI = 'http://localhost:8084'
    var scoreAPI = 'http://localhost:8090'
    var saveAPI = 'http://localhost:8082'
    var uploadAPI = 'http://localhost:8086'
    var templateAPI = 'http://localhost:8088'
    var complianceAPI = 'http://localhost:8092'
    var controlAPI = 'http://localhost:8094'
} 
// if this is the dev-stack.yml
else {
    var readAPI = 'http://localhost:9084'
    var scoreAPI = 'http://localhost:9090'
    var saveAPI = 'http://localhost:9082'
    var uploadAPI = 'http://localhost:9086'
    var templateAPI = 'http://localhost:9088'
    var complianceAPI = 'http://localhost:9092'
    var controlAPI = 'http://localhost:9094'
}