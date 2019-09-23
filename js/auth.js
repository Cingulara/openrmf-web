var keycloak = Keycloak({
    url: 'http://' + document.location.hostname+ ':9001/auth',
    realm: 'openrmf',
    clientId: 'openrmf'
});