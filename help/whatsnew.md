---
layout: default
title: What's New in v1.5
nav_order: 2
---

# What's New with OpenRMF

Please refer to the <a href="https://github.com/Cingulara?tab=projects" target="_blank">OpenRMF Projects listing on GitHub</a> for more information on feature updates and timeline.
## Version 1.5
Version 1.5 included one added feature:
* Updated base image and application container image to use Alpine and self-contained application executables for reduced scanning surface and size
* Bug fix for the Reporting when you upgrade to a new STIG Checklist release with changing Vulnerability IDs
* Auto-logoff after 15 minutes
* Auto-refresh of the Keycloak token when on a page longer than 5 minutes

## Version 1.4
Version 1.4 included one added feature:
* Feature #216: Ability to upload OpenSCAP results XCCDF XML file to create Checklists, along with Nessus and DISA SCAP XCCDF XML results

## Version 1.3.2
Version 1.3.2 was a bug fix release primarily as outlined below:
* Fix score calculation bug #213 on checklists for Not a Finding counts
* Added additional DISA public STIG Templates

## Version 1.3.1
Version 1.3.1 was a bug fix release primarily as outlined below:
* Fix a bug #203 on CAT 3 checklist Not a Finding counts not matching the checklist file
* Updated to the Jan 22, 2021 DISA public STIG templates

## Version 1.3
Version 1.3 was a bug fix release primarily as outlined below:
* Display the status of the vulnerability in the checklist/template view
* Scoring a checklist now uses the Severity Override as the severity if it is filled in (API and MSG client)
* Fixed a bug in the low/moderate/high loading of NIST 800.53 Controls
* Fixed a bug where PII controls are always used in the Compliance engine -- now only if the checkbox is set

## Version 1.2
Version 1.2 was also a security fix primarily with some updated functionality as outlined below:
* .NET Core 3.1 update with Debian 10 based containers
* Updated .NET Core 3.1 components such as Jaeger client, Swashbuckle, etc.
* Keycloak 10 upgrade from 7.0
* Keycloak theme for OpenRMF for seamless look-and-feel interaction
* Header Security fixes from an active scan of the web application 
* Compliance Summary buttons are interactive for filtering now
* Help documentation is now local to the application, not up on github.io pages

## Version 1.1
Version 1.1 was a security fix primarily with some updated functionality as outlined below:
* Rootless containers for APIs, messages, NGINX, and MongoDB databases
* Updated jQuery, File Upload, Bootstrap and other JS components
* Security Fixes from an active scan of the web application 
* Upload an existing checklist for a given checklist type and host = update the info (it was just duplicating the information)
* Allow Bulk Edits on Vulnerabilities across similar checklist types within a System grouping
* Container "restart: always" on the Docker Compose file
* All CSS, HTML, JS are local not reaching out over the public Internet

## Version 1.0

Version 1.0 of OpenRMF Core has these updates below:
* Fixing a bug on the Web UI updating Vulnerabilities via the web form in a checklist
* Updating the version descriptions to 1.0 throughout the codebase