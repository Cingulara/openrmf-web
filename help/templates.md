---
layout: default
title: Using Template Checklists
nav_order: 500
---

# Using Templates for your Checklists

![OpenRMF Templates](./assets/templates.png)

There are 2 types of templates in OpenRMF<sup>&reg;</sup> OSS as of v1.7. The default DISA templates that are available from their https://public.cyber.mil/stigs/ public listing website. And then there are User Templates that you can upload as a starting point for checklists. User Templates can be from other CKL files you have updated to use as a boilerplate, a custom checklist you make in OpenRMF<sup>&reg;</sup> Professional, or from a default DISA one you have added some special text or details to. 

In the OpenRMF OSS we include the latest default DISA templates in our template component so you have them for SCAP scans to associate. All default DISA templates have everthing as Not Reviewed so we do not calculate the score on the DISA default templates to speed up page loading. 

User Templates are added via the Upload page in the Template Upload area. The User Template listing are user templates that those with permissions have added. The Template name as well as the score of items are shown simimlar to the Checklist listing page. Click the linked Template to view the detailed information. Click the green plus sign to view the scoring based on category. For User Templates, we calculate the score of the template for you based on vulnerabilities.

You can use Templates in OpenRMF<sup>&reg;</sup> for a starting point for your checklists. A great example would be you have an infrastructure package and a platform-as-a-service package that your application(s) run on. That infrastructure and PaaS have known good checklists as a baseline that application owners use as a starting point and adjust the remaining vulnerability items accordingly. 

IT personnel would download this template and then fill out remaining items based on their software or system.