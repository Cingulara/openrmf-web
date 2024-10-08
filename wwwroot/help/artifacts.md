---
layout: default
title: Step 6 - Generate RMF Artifacts
nav_order: 450
---

# Generating your System's RMF Artifacts

With all your data in one place for your entire system, you can how start to generate the RMF artifacts required such as your POAM, and Test Summary Report. Below are examples of each. All of these can be found on the System 
page where you see the title, list of checklists, overall score, and other data. 

## Nessus Scan Export

![OpenRMF OSS Compliance Generator](./assets/nessus-export-xlsx.png)

The Nessus Scan Export shows patching items across your system servers/hosts, sorted by criticality/severity, and gives details on the ID, description, and severity level.

## POAM Export

![OpenRMF OSS POAM Generator](./assets/poam-export.png)

The Plan of Actions and Milestones (POAM) Export lists all Open and Not Reviewed items across every single checklist within your system. The data is ordered by severity and then vulnerability so all high level items are near the top. The POAM is used to show your plan to address, mitigate, and/or close the items still open while you go through the RMF Process.

## Test Plan Summary Export

![OpenRMF OSS Test Plan Summary Generator](./assets/test-plan-summary-export.png)

The Test Plan Export shows all Nessus Patch data with items that need to be addressed in Critical and High (CAT I) down to Low (CAT III) items. It then shows similar data across all your checklists (manual and SCAP generated) in a similar fashion. This gives you a high level count of items per severity.  

## Color Coding Rules

For compliance, a green color means all the vulnerabilities for that control are either Not a Finding or marked as Not Applicable. If 1 vulnerability is marked as Open, then that whole group is Open. And if there are any vulnerabilities that are Not Reviewed with no Open vulnerabilities for that group, then the whole group is marked as Not Reviewed.