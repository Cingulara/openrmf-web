// Copyright (c) Cingulara LLC 2020 and Tutela LLC 2020. All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007 license. See LICENSE file in the project root for full license information.
var keycloak = Keycloak({
    url: 'http://' + document.location.hostname+ ':9001/auth',
    realm: 'openrmf',
    clientId: 'openrmf'
});