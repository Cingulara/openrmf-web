// Copyright (c) Cingulara LLC 2019 and Tutela LLC 2019. All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007 license. See LICENSE file in the project root for full license information.
/*************************************
 * Dashboard functions
 ************************************/
// fill in the # of total checklists in the system on the dashboard page top right
async function getSystemTotalCount() {
	let response = await fetch(readAPI + "/count/systems", {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
			var data = await response.json()
			$("#numberSystemsTotal").html(data);
			$("#numberNewSystemsTotal").text(data);
	}
	else {
		$("#numberSystemsTotal").html("error");
		$("#numberNewSystemsTotal").text("error");
		if (response.status == 401)
			swal("There is an Authentication problem. Please logout and log back in. And have the application administrator verify your API's authentication settings.", "Click OK to continue!", "error");
		else if (response.status == 401)
			swal("There is an application problem. Please have the application administrator verify your system is 100% healthy and running correctly.", "Click OK to continue!", "error");
	}
}
// fill in the # of total checklists in the system on the dashboard page top right
async function getChecklistTotalCount() {
	let response = await fetch(readAPI + "/count/artifacts", {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
			var data = await response.json()
			$("#numberChecklistsTotal").html(data);
			$("#numberNewChecklistsTotal").text(data);
	}
	else {
		$("#numberChecklistsTotal").html("error");
		$("#numberNewChecklistsTotal").text("error");
		if (response.status == 401)
			swal("There is an Authentication problem. Please logout and log back in. And have the application administrator verify your API's authentication settings.", "Click OK to continue!", "error");
		else if (response.status == 401)
			swal("There is an application problem. Please have the application administrator verify your system is 100% healthy and running correctly.", "Click OK to continue!", "error");
	}
}
// fill in the # of total checklists in the system on the dashboard page top right
async function getTemplateTotalCount() {
	let response = await fetch(templateAPI + "/count/templates", {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
			var data = await response.json()
			$("#numberTemplatesTotal").html(data);
			$("#numberNewTemplatesTotal").text(data);
	}
	else {
		$("#numberTemplatesTotal").html("error");
		$("#numberNewTemplatesTotal").text("error");
		if (response.status == 401)
			swal("There is an Authentication problem. Please logout and log back in. And have the application administrator verify your API's authentication settings.", "Click OK to continue!", "error");
		else if (response.status == 401)
			swal("There is an application problem. Please have the application administrator verify your system is 100% healthy and running correctly.", "Click OK to continue!", "error");
	}
}
// get list of systems for dashboard
async function getSystemsForDashboard() {
	sessionStorage.removeItem("checklistSystems");
	// clear the options
	$('#checklistSystem').children().remove().end();
	$('#checklistSystem').append('<option value="">[Choose a System]</option>');
	$('#checklistACASSystem').children().remove().end();
	$('#checklistACASSystem').append('<option value="">[Choose a System]</option>');
	var data = await getChecklistSystems();
	// for each data add to the system listings on the dashboard independently
	if (data) {
		$.each(data, function (index, value) {
				optionString = '<option value="' + value.internalId + '">' + value.title + '</option>';
			$('#checklistSystem').append(optionString);
			$('#checklistACASSystem').append(optionString);
		}); 
	}
}
// get the item count for Cat 1, 2, 3 from the dashboard to display
async function getSystemOpenItemsForDashboard() {
	var systemId = $('#checklistSystem').val();
	if (systemId) {
		$("#divSystemCategoryDashboard").show();
		var data = await getScoreForSystemChecklistListing(systemId);
		if (data) {
			// set the three values of the boxes and show the DIV
			$("#numberCAT1Open").html(data.totalCat1Open);
			$("#numberCAT1OpenItems").text(data.totalCat1Open);
			$("#numberCAT2Open").html(data.totalCat2Open);
			$("#numberCAT2OpenItems").text(data.totalCat2Open);
			$("#numberCAT3Open").html(data.totalCat3Open);
			$("#numberCAT3OpenItems").text(data.totalCat3Open);
		}
	}
	else {
		// tell them to pick a system
		$("#divSystemCategoryDashboard").hide();
	}
}
// from the dashboard items listing, if you click on a system or checklist listing you view the system record for that ID
function loadSystemFromDashboardCategory(type) {
	var systemId = $('#checklistSystem').val();
	if (systemId) 
		location.href="checklists.html?id=" + systemId + "&category=" + type;
}
// get the Nessus scan critical and high items to display here
async function getSystemACASItemsForDashboard() {
	var systemId = $('#checklistACASSystem').val();
	if (systemId) {
		var data = await getNessusFileSummaryData(systemId);
		if (data) {
			$("#divSystemACASPatchListing").show();
			$("#divNessusStatus").hide();
			// set the three values of the boxes and show the DIV
			$("#numberCriticalOpen").html(data.totalCriticalOpen);
			$("#numberHighOpen").html(data.totalHighOpen);
			$("#numberMediumOpen").html(data.totalMediumOpen);
			$("#numberLowOpen").html(data.totalLowOpen);
		}
		else {
			// tell them there is no ACAS Nessus file
			$("#divSystemACASPatchListing").hide();
			$("#divNessusStatus").html("There is no current Nessus patch file loaded for this <a href='checklists.html?id=" + systemId + "'>system</a>.");
			$("#divNessusStatus").show();
		}
	}
	else {
		// tell them to pick a system
		$("#divSystemACASPatchListing").hide();
		$("#divNessusStatus").html("There is no current valid Nessus patch file loaded for this system.");
		$("#divNessusStatus").show();
	}
}
/*************************************
 * Template listing functions
 ************************************/
async function getTemplates(latest) {
	$.blockUI({ message: "Updating the template listing..." }); 
	var url = templateAPI;	
	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	// parse the result regardless of the one called as the DIV are the same on Dashboard/index and the checklists pages
  if (response.ok) {
		var data = await response.json()
		var table = $('#tblChecklistListing').DataTable(); // the datatable reference to do a row.add() to
		table.clear().draw();
		var checklistLink = "";
		if (data.length == 0) {
			$.unblockUI();
			var alertText = 'There are no Checklist templates uploaded. Please go to the Upload page to add your first.';
			alertText += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
			alertText += '<span aria-hidden="true">&times;</span></button>';
			$("#divMessaging").html(alertText);
			$("#divMessaging").show();
		}
		else {
			$("#divMessaging").html('');
			$("#divMessaging").hide();
			for (const item of data) {
				checklistLink = '<a href="single-template.html?id=' + item.internalId + '" title="Open Checklist Template">'
				checklistLink += item.title
				checklistLink += '</a><br /><span class="small">last updated on '
				if (item.updatedOn) {
					checklistLink += moment(item.updatedOn).format('MM/DD/YYYY h:mm a');
				}
				else {
					checklistLink += moment(item.created).format('MM/DD/YYYY h:mm a');
				}
				checklistLink += "</span>";
				// now get the score
				var score = null;
				var formData = new FormData();
				formData.append("rawChecklist", item.rawChecklist);
				$.ajax({
					url : scoreAPI,
					data : formData,
					async: false,
					type : 'POST',
					processData: false,
					contentType: false,
					beforeSend: function(request) {
						request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success : function(data){
						score = data;
						if (score) {
							// dynamically add to the datatable but only show main data, click the + for extra data
							table.row.add( { "title": checklistLink, 
								"totalNaF": score.totalNotAFinding, "totalNA": score.totalNotApplicable, "totalOpen": score.totalOpen, "totalNR": score.totalNotReviewed,
								"totalNaFCat1": score.totalCat1NotAFinding, "totalNACat1": score.totalCat1NotApplicable, "totalOpenCat1": score.totalCat1Open, "totalNRCat1": score.totalCat1NotReviewed,
								"totalNaFCat2": score.totalCat2NotAFinding, "totalNACat2": score.totalCat2NotApplicable, "totalOpenCat2": score.totalCat2Open, "totalNRCat2": score.totalCat2NotReviewed,
								"totalNaFCat3": score.totalCat3NotAFinding, "totalNACat3": score.totalCat3NotApplicable, "totalOpenCat3": intOpenCat2 = score.totalCat3Open, "totalNRCat3": score.totalCat3NotReviewed
							}).draw();
						}
						else {
							table.row.add( { "title": checklistLink, 
								"totalNaF": 0, "totalNA": 0, "totalOpen": 0, "totalNR": 0,
								"totalNaFCat1": 0, "totalNACat1": 0, "totalOpenCat1": 0, "totalNRCat1": 0,
								"totalNaFCat2": 0, "totalNACat2": 0, "totalOpenCat2": 0, "totalNRCat2": 0,
								"totalNaFCat3": 0, "totalNACat3": 0, "totalOpenCat3": 0, "totalNRCat3": 0
							}).draw();
						}
						$.unblockUI();
					},
				error: function() {
					table.row.add( { "title": checklistLink, 
						"totalNaF": 0, "totalNA": 0, "totalOpen": 0, "totalNR": 0,
						"totalNaFCat1": 0, "totalNACat1": 0, "totalOpenCat1": 0, "totalNRCat1": 0,
						"totalNaFCat2": 0, "totalNACat2": 0, "totalOpenCat2": 0, "totalNRCat2": 0,
						"totalNaFCat3": 0, "totalNACat3": 0, "totalOpenCat3": 0, "totalNRCat3": 0
					}).draw();
					$.unblockUI();
				}});
			}
		}
	}
	else {
		$.unblockUI();
		if (response.status == 401)
			swal("There is an Authentication problem. Please logout and log back in. And have the application administrator verify your API's authentication settings.", "Click OK to continue!", "error");
		else if (response.status == 401)
			swal("There is an application problem. Please have the application administrator verify your system is 100% healthy and running correctly.", "Click OK to continue!", "error");
		throw new Error(response.status)
	}
}
// called from template listing, calls the POST to the scoring API to get back a score dynamically
async function getScoreForTemplateListing(xmlChecklist) {
	var formData = new FormData();
	formData.append("rawChecklist", xmlChecklist);
	$.ajax({
		url : scoreAPI,
		data : formData,
		type : 'POST',
		beforeSend: function(request) {
		  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
		},
		processData: false,
		contentType: false,
		success : function(data){
			displayChecklistScores(data);
		}});
}
async function deleteTemplate(id) {
	if (id && id.length > 10) {
		swal({
			title: "Delete this Template?",
			text: "Are you sure you wish to delete this template?",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		  })
		  .then((willDelete) => {
			if (willDelete) {
				$.ajax({
					url : templateAPI + "/" + id,
					type : 'DELETE',
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success: function(data){
						swal("Your Template was deleted successfully!", "Click OK to continue!", "success")
						.then((value) => {
							location.href = "templates.html"; // reload the list of templates
						});
					},
					error : function(data){
						swal("There was a Problem. Your Template was not deleted successfully! Please check with the Application Admin.", "Click OK to continue!", "error");
					}
			    });
			  
			} else {
			  swal("Canceled the Deletion.");
			}
		});
	}
}
/*************************************
 * System listing functions
 ************************************/
function listSystems() {
	location.href = "systems.html";
}

async function getSystemListing(){
	$.blockUI({ message: "Updating the system listing..." }); 
	var url = readAPI + "/systems/";

	// setup the table visibility
	$("#divSystemListing").show();
	$("#txtSystemName").val('');

	// reset the list of systems
	sessionStorage.removeItem("checklistSystems");
	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	// parse the result regardless of the one called as the DIV are the same on Dashboard/index and the checklists pages
	if (response.ok) {
		var data = await response.json()
		var systemsListing = "";

		if (data.length == 0) {
			$.unblockUI();
			var alertText = 'There are no Systems in here. Please add your first System or Upload your first checklist to get started.';
			alertText += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
			alertText += '<span aria-hidden="true">&times;</span></button>';
			$("#divMessaging").html(alertText);
			$("#divMessaging").show();
		}
		else {
			$('#btnExportListToExcel').prop('disabled', false); // allow the Export to Excel button to be live
			$("#divMessaging").html('');
			$("#divMessaging").hide();
			// cycle through the systems and add the data
			var chartNumber = 0;
			// clear the DIV
			$('#divSystemListing').html("");
			for (const item of data) {
				chartNumber = chartNumber + 1;
				systemsListing = '<div class="systemListing"><div class="systemListTitle"><a href="checklists.html?id=' + item.internalId + '" ';
				systemsListing += 'title="view system information and checklists for this system" >' + item.title + ' (' + item.numberOfChecklists + ')</a>';
				systemsListing += '</div><div class="systemDescription">';
				if (item.description) {
					systemsListing += item.description;
				} else {
					systemsListing += "<i>(No description)</i>"
				}
				systemsListing += '</div><div class="systemListInfo"><canvas ';
				systemsListing += 'class="systemChart" id="pieChart' + chartNumber + '"></canvas> ';
				systemsListing += '<div style="clear: both;"></div></div></div>';
				$('#divSystemListing').append(systemsListing);
				var data = await getScoreForSystemChecklistListing(item.internalId);
				if (data) 
					renderSystemPieChart("pieChart" + chartNumber, data); // render the specific data for this system
			}
			$.unblockUI();
		}
	}
	else {
		$.unblockUI();
		var alertText = 'There is a problem fetching the system listing. Please check that all available services are alive and well.';
		alertText += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
		alertText += '<span aria-hidden="true">&times;</span></button>';
		$("#divMessaging").html(alertText);
		$("#divMessaging").show();
	}
}

function getSystemRecordBySession(){
	var currentSystem = sessionStorage.getItem("currentSystem");
	if (currentSystem)
		getSystemRecord(currentSystem);
	else
		location.href = "systems.html";
}

function reloadSystemRecordBySession() {
	var currentSystem = sessionStorage.getItem("currentSystem");
	if (currentSystem && currentSystem != "undefined")
		location.href = "checklists.html?id=" + currentSystem;
	else
		location.href = "systems.html";
}
async function getSystemRecord(systemGroupId) {
	var url = readAPI;
	url += "/system/" + encodeURIComponent(systemGroupId);
	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});

	if (response.ok) {
		var item = await response.json()
		if (item.length == 0) {
			$.unblockUI();			
			var alertText = 'That is not a valid System. Please return to the Systems page and click on a valid system.';
			alertText += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
			alertText += '<span aria-hidden="true">&times;</span></button>';
			$("#divMessaging").html(alertText);
			$("#divMessaging").show();
		}
		else {
			$("#modalSystemTitle").text(item.title);
			$("#divSystemTitle").html("<b>Title:</b> " + item.title);
			$("#frmSystemTitle").val(item.title);
			if (item.description){
				$("#divSystemDescription").html("<b>Description:</b> " + item.description);
				$("#frmSystemDescription").val(item.description);
			}
			else 
				$("#divSystemDescription").html("<b>Description:</b> (no description)");
			$("#divNumberChecklists").html("<b>Checklists:</b> " + item.numberOfChecklists);
			if (item.rawNessusFile) {
				var nessusHTML = "<b>Nessus Scan:</b>";				
				if (canDownload()) {
					var nessusFilename = "latest upload";
					if (item.nessusFilename) 
						nessusFilename = item.nessusFilename;

					nessusHTML += ' &nbsp; <span><a title="Download the Nessus Scan (' + nessusFilename + ')" href="javascript:downloadNessusXML(\'' + item.internalId + '\')">';
					nessusHTML += 'Download</a> ';
					nessusHTML += ' | <span><a title="Export the Nessus scan Summary to XLSX (' + nessusFilename + ')" href="javascript:exportNessusXML(\'' + item.internalId + '\', true)">';
					nessusHTML += 'Summary Export</a> ';
					nessusHTML += ' | <span><a title="Export the Nessus scan to XLSX by Host (' + nessusFilename + ')" href="javascript:exportNessusXML(\'' + item.internalId + '\', false)">';
					nessusHTML += 'Host Export</a> ';
				} else { // they can only know we have one
					nessusHTML += " Yes";
				}
				// write the HTML
				$("#divSystemNessusFile").html(nessusHTML);
			}
			else { 
				if (canUpload()) {
					var strNessus = '<b>Nessus Scan:</b> <a href="#custom-modal"  id="btnUpdateSystem" ' +
									' data-target="#customModal" data-toggle="modal"><span>(click to upload)</span></a>';
					$("#divSystemNessusFile").html(strNessus);
				} 
				else 
				$("#divSystemNessusFile").html("<b>Nessus Scan:</b> N/A");
			}
			// generate the test plan link
			if (canDownload()) {
				var testplanHTML = "<b>Test Plan Summary:</b>";				
				testplanHTML += ' &nbsp; <span><a title="Download the Test Plan in MS Excel" href="javascript:exportTestPlan(\'' + item.internalId + '\')">';
				testplanHTML += 'Generate Excel File</a> ';
				$("#divSystemTestPlan").html(testplanHTML);
			}
			// created date and updated date
			$("#divSystemCreated").html("<b>Created:</b> " + moment(item.created).format('MM/DD/YYYY h:mm a'));
			if (item.updatedOn) 
				$("#divSystemUpdated").html("<b>Last Updated:</b> " + moment(item.updatedOn).format('MM/DD/YYYY h:mm a'));
			else
				$("#divSystemUpdated").html("<b>Last Updated:</b> N/A");
			if (item.lastComplianceCheck) 
				$("#divSystemLastCompliance").html("<b>Last Compliance Check:</b> " + moment(item.lastComplianceCheck).format('MM/DD/YYYY h:mm a'));
			else 
				$("#divSystemLastCompliance").html("<b>Last Compliance Check:</b> N/A");
1		}
	}
	else {
		$.unblockUI();
		throw new Error(response.status)
	}
}

// the add page on the System record page calls this if you have permissions
function addSystem(){
	swal("Adding System...", {
		buttons: false,
		timer: 3000,
	});
	var formData = new FormData();
	formData.append("title",htmlEscape($("#frmSystemTitle").val()));
	formData.append("description",htmlEscape($("#frmSystemDescription").val()));
	formData.append('nessusFile',$('#frmNessusFile')[0].files[0]);
	$.ajax({
			url : saveAPI + "/system/",
			data : formData,
			type : 'POST',
			beforeSend: function(request) {
			  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
			},
			processData: false,
			contentType: false,			
			success: function(data){
				swal("Your System was created successfully!", "Click OK to continue!", "success")
				.then((value) => {
					// load the new system
					location.href = "checklists.html?id=" + data.internalId;
				});
			},
			error : function(data){
				swal("There was a Problem. Your System was not created successfully. Please verify all required fields are filled in.", "Click OK to continue!", "error");
			}
	});
	return false;
}

// the edit page on the System record page calls this if you have permissions
function updateSystem(systemGroupId){
	swal("Updating System...", {
		buttons: false,
		timer: 3000,
	});
	if (!systemGroupId) // get it from the session
		systemGroupId = sessionStorage.getItem("currentSystem");

	var formData = new FormData();
	formData.append("title",htmlEscape($("#frmSystemTitle").val()));
	formData.append("description",htmlEscape($("#frmSystemDescription").val()));
	formData.append('nessusFile',$('#frmNessusFile')[0].files[0]);
	$.ajax({
			url : saveAPI + "/system/" + systemGroupId,
			data : formData,
			type : 'PUT',
			beforeSend: function(request) {
			  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
			},
			processData: false,
			contentType: false,			
			success: function(data){
				swal("Your System was updated successfully!", "Click OK to continue!", "success")
				.then((value) => {
					getSystemRecordBySession();
				});
			},
			error : function(data){
				swal("There was a Problem. Your System was not updated successfully. Please check with the Application Admin.", "Click OK to continue!", "error");
			}
	});
	return false;
}

// called from above to return the system score for all checklists in a system
async function getScoreForSystemChecklistListing(systemId) {
  var url = scoreAPI;
  try {
		let responseScore = await fetch(scoreAPI + "/system/" + encodeURIComponent(systemId), {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
		if (responseScore.ok) {
			var dataScore = await responseScore.json()
			return dataScore;
		}
	}
	catch (error) {
		console.error("returning an empty score");
		return null;
	}
}

// get the data for the pie chart in the Systems listing to show
function renderSystemPieChart(element, data) {
	var ctx3 = document.getElementById(element).getContext('2d');
	var chartSeverity = new Chart(ctx3, {
		type: 'pie',
		data: {
			datasets: [{
				data: [data.totalCat1Open, data.totalCat2Open, data.totalCat3Open, data.totalNotAFinding, data.totalNotApplicable, data.totalNotReviewed],
				backgroundColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(255, 153, 0, 1)',
					'rgba(216, 216, 14, 1)',
					'rgba(0, 204, 0, 1)',
					'rgba(150, 150, 150, 1)',
					'rgba(242, 242, 242, 1)'
				],
				label: 'System Severity Breakdown'
			}],
			labels: [
				"CAT 1 Open",
				"CAT 2 Open",
				"CAT 3 Open",
				"Not a Finding",
				"N/A",
				"Not Reviewed"
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			aspectRatio: 1,
			legend: {
			  display: true,
			  position: 'bottom',
			  labels: {
				fontSize: 10,
				padding: 5
			  }
			},
			plugins: {
			  labels: {
				render: 'value',
				fontSize: 14,
				//fontStyle: 'bold',
				fontColor: '#000',
				//position: 'outside',
				fontFamily: '"Lucida Console", Monaco, monospace'
			  }
			}
		}
	});
}

// if there is a Nessus scan file for the system, and they have permissions, download it
async function downloadNessusXML(systemGroupId) {
	if (!systemGroupId) // get it from the session
		systemGroupId = sessionStorage.getItem("currentSystem");
	// redirect to the API and it downloads the XML file for the Nessus scan
	$.blockUI({ message: "Generating the Nessus file...please wait" }); 
	var url = readAPI + "/system/" + encodeURIComponent(systemGroupId) + "/downloadnessus/";
	// now that you have the URL, post it, get the file, save as a BLOB and name as XLSX
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);
	request.responseType = 'blob';
	request.onload = function(e) {
		if (this.status === 200) {
			var blob = this.response;
			if(window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveBlob(blob, fileName);
			}
			else{
				var downloadLink = window.document.createElement('a');
				var contentTypeHeader = request.getResponseHeader("Content-Type");
				downloadLink.href = window.URL.createObjectURL(new Blob([blob], { type: contentTypeHeader }));
				downloadLink.download = $.trim($("#frmSystemTitle").val().replace(" ", "-")) + ".nessus";
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);
			}
		}
	};
	request.send();
	$.unblockUI();
}
// get back the list of Critical and High Nessus Patch data
async function getNessusFileSummaryData(systemGroupId) {
	if (!systemGroupId) // get it from the session
		systemGroupId = sessionStorage.getItem("currentSystem");
	var url = readAPI;
	try {
		  let responsePatches = await fetch(readAPI + "/system/" + encodeURIComponent(systemGroupId) + "/nessuspatchsummary/", {headers: {
			  'Authorization': 'Bearer ' + keycloak.token
		  }});
		  if (responsePatches.ok) {
			  var dataPatches = await responsePatches.json()
			  return dataPatches;
		  } else if (responsePatches.statusText == "Not Found") {
			  // hide the section and tell them there is no Patch file uploaded for that system
			  return null;
		  }
	  }
	  catch (error) {
		  console.error("returning an empty summary of patches");
		  return null;
	  }
}

// export Nessus scan to XLSX for easier viewing
async function exportNessusXML(systemGroupId, summaryView) {
	if (!systemGroupId) // get it from the session
		systemGroupId = sessionStorage.getItem("currentSystem");

		$.blockUI({ message: "Generating the Nessus Excel export...please wait" }); 
	var url = readAPI + "/system/" + systemGroupId + "/exportnessus?summaryOnly=" + summaryView.toString();
	// now that you have the URL, post it, get the file, save as a BLOB and name as XLSX
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);
	request.responseType = 'blob';	
	request.onload = function(e) {
		if (this.status === 200) {
			var blob = this.response;
			if(window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveBlob(blob, fileName);
			}
			else{
				var downloadLink = window.document.createElement('a');
				var contentTypeHeader = request.getResponseHeader("Content-Type");
				downloadLink.href = window.URL.createObjectURL(new Blob([blob], { type: contentTypeHeader }));
				if (summaryView)
					downloadLink.download = $.trim($("#frmSystemTitle").val().replace(" ", "-")) + "-NessusScanSummary.xlsx";
				else 
					downloadLink.download = $.trim($("#frmSystemTitle").val().replace(" ", "-")) + "-NessusScanSummaryByHost.xlsx";
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);
			}
		}
	};
	request.send();
	$.unblockUI();
}

// export Test Plan to XLSX for easier viewing
async function exportTestPlan(systemGroupId) {
	if (!systemGroupId) // get it from the session
		systemGroupId = sessionStorage.getItem("currentSystem");
	$.blockUI({ message: "Generating the System Test Plan Excel export...please wait" }); 
	var url = readAPI + "/system/" + systemGroupId + "/testplanexport/";
	// now that you have the URL, post it, get the file, save as a BLOB and name as XLSX
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);
	request.responseType = 'blob';	
	request.onload = function(e) {
		if (this.status === 200) {
			var blob = this.response;
			if(window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveBlob(blob, fileName);
			}
			else{
				var downloadLink = window.document.createElement('a');
				var contentTypeHeader = request.getResponseHeader("Content-Type");
				var strDate = "";
				var d = new Date();
				strDate = d.getFullYear().toString() + "-" + (d.getMonth()+1).toString() + "-" + d.getDate().toString() + "-" + d.getHours().toString() + "-" + d.getMinutes().toString() + "-" + d.getSeconds().toString();
				downloadLink.href = window.URL.createObjectURL(new Blob([blob], { type: contentTypeHeader }));

				downloadLink.download = $.trim($("#frmSystemTitle").val().replace(" ", "-")) + "-TestPlanSummary-" + strDate + ".xlsx";
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);
			}
		}
	};
	request.send();
	$.unblockUI();
}

// buttons to redirect with the System ID in the URL
function runComplianceFromSystem(id) {
	if (id)
		location.href = "compliance.html?id=" + id;
	else 
		location.href = "compliance.html?id=" + sessionStorage.getItem("currentSystem");;
}
function uploadFromSystem(id) {
	if (id)
		location.href = "upload.html?id=" + id;
	else 
		location.href = "upload.html?id=" + sessionStorage.getItem("currentSystem");;
}
// delete a system, its checklists, and its scores records
async function deleteSystem(id) {
	if (!id) // get it from the session
		id = sessionStorage.getItem("currentSystem");
	if (id && id.length > 10) {
		swal({
			title: "Delete an Entire System",
			text: "Are you sure you wish to delete this system and all its checklists and files?",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		  })
		  .then((willDelete) => {
			if (willDelete) {
				$.ajax({
					url : saveAPI + "/system/" + id,
					type : 'DELETE',
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success: function(data){
						swal("Your System was deleted successfully!", "Click OK to continue!", "success")
						.then((value) => {
							location.href = "systems.html";
						});
					},
					error : function(data){
						swal("There was a Problem. Your System was not deleted successfully! Please check with the Application Admin.", "Click OK to continue!", "error");
					}
			    });
			  
			} else {
			  swal("Canceled the System Deletion.");
			}
		});
	}
}
// get the system score pie chart by session on the system record page
function getSystemScoreChartBySession(){
	var currentSystem = sessionStorage.getItem("currentSystem");
	if (currentSystem)
		getSystemScoreChart(currentSystem);
	else
		location.href = "systems.html";
}
// get the system score pie chart by session on the system record page
async function getSystemScoreChart(id) {
	if (!id) // get it from the session
		id = sessionStorage.getItem("currentSystem");
	var data = await getScoreForSystemChecklistListing(id);
	if (data) 
		renderSystemPieChart("chartSystemScore", data); // render the specific data for this system
}
// delete all checklists for a system, but keep the system structure
async function deleteSystemChecklists(id){
	if (!id) // get it from the session
		id = sessionStorage.getItem("currentSystem");
	var formData = new FormData();
	// put all the checked items into the form data
	var idSelector = function() { return this.value; };
	var checklists = $("#tblChecklistListing :checkbox:checked").map(idSelector).get();
	formData.append("checklistIds", checklists);
	if (id && id.length > 10) {
		swal({
			title: "Delete Selected System Checklists",
			text: "Are you sure you wish to delete the selected System Checklists?",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		  })
		  .then((willDelete) => {
			if (willDelete) {
				$.ajax({
					url : saveAPI + "/system/" + id + "/artifacts",
					type : 'DELETE',
					data: formData,
					processData: false,
					contentType: false,
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success: function(data){
						swal("Your System Checklists were deleted successfully!", "Note: for larger lists this may take a few moments. Click OK to continue!", "success")
						.then((value) => {
							location.reload();
						});
					},
					error : function(data){
						swal("There was a Problem. Your System Checklists were not deleted successfully! Please check with the Application Admin.", "Click OK to continue!", "error");
					}
			    });
			  
			} else {
			  swal("Canceled the System Checklist Deletion.");
			}
		});
	}
}
// delete all checklists for a system, but keep the system structure
async function deleteAllSystemChecklists(id){
	if (!id) // get it from the session
		id = sessionStorage.getItem("currentSystem");
	if (id && id.length > 10) {
		swal({
			title: "Delete All System Checklists",
			text: "Are you sure you wish to delete all the System Checklists?",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		  })
		  .then((willDelete) => {
			if (willDelete) {
				$.ajax({
					url : saveAPI + "/system/" + id + "/artifacts",
					type : 'DELETE',
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success: function(data){
						swal("Your System Checklists were deleted successfully!", "Note: for larger lists this may take a few moments. Click OK to continue!", "success")
						.then((value) => {
							location.reload();
						});
					},
					error : function(data){
						swal("There was a Problem. Your System Checklists were not deleted successfully! Please check with the Application Admin.", "Click OK to continue!", "error");
					}
			    });
			  
			} else {
			  swal("Canceled the System Checklist Deletion.");
			}
		});
	}
}
/*************************************
 * Checklist listing functions
 ************************************/
async function getChecklistsBySystem() {
	var system = $("#checklistSystemFilter").val();
	await getChecklists(system);
}
// if returning from a session delete or an individual checklist, 
// just load up the checklist listing
function getChecklistListingBySession(){
	var currentChecklist = sessionStorage.getItem("currentSystem");
	if (currentChecklist)
		getChecklists(currentChecklist);
	else
		location.href = "systems.html";
}
function getChecklistsByFilter() {
	// set the system checklist
	setSystemChecklistFilter();
	// get the listing and display it
	if (getParameterByName('rtn')){
		getChecklistListingBySession();
	}
	else {
		// get the system info from the Id
		getChecklists(getParameterByName('id'));
	}
}
// get the system checklist filter settings for the page load to set them
function getSystemChecklistFilter() {
	if (sessionStorage.getItem("systemFilter") != null) {
		var systemFilter = JSON.parse(sessionStorage.getItem("systemFilter"));
		$("#chkVulnNaF").prop('checked', systemFilter.naf);
		$("#chkVulnOpen").prop('checked', systemFilter.open);
		$("#chkVulnNA").prop('checked', systemFilter.na);
		$("#chkVulnNR").prop('checked', systemFilter.nr);
		$("#chkVulnCAT1").prop('checked', systemFilter.cat1);
		$("#chkVulnCAT2").prop('checked', systemFilter.cat2);
		$("#chkVulnCAT3").prop('checked', systemFilter.cat3);
		$("#chkVulnHostname").val(systemFilter.hostname);
	}
}
// set the system checklist filter settings on the page before retrieving the listing
function setSystemChecklistFilter() {
	var systemFilter = {
		"naf"  : $("#chkVulnNaF").is(':checked'),
		"open" : $("#chkVulnOpen").is(':checked'),
		"na"   : $("#chkVulnNA").is(':checked'),
		"nr"   : $("#chkVulnNR").is(':checked'),
		"cat1" : $("#chkVulnCAT1").is(':checked'),
		"cat2" : $("#chkVulnCAT2").is(':checked'),
		"cat3" : $("#chkVulnCAT3").is(':checked'),
		"hostname" : $("#chkVulnHostname").val()
	}
	sessionStorage.setItem("systemFilter", JSON.stringify(systemFilter));
}
// main listing of checklists on the system record page
async function getChecklists(system) {
	$.blockUI({ message: "Updating the checklist listing..." }); 
	// use this to refresh the checklist page if they delete something
	sessionStorage.setItem("currentSystem", system);

	var url = readAPI + "/systems/" + encodeURIComponent(system);
	url += "/?naf=" + $("#chkVulnNaF").is(':checked');
	url += "&open=" + $("#chkVulnOpen").is(':checked');
	url += "&na="   + $("#chkVulnNA").is(':checked');
	url += "&nr="   + $("#chkVulnNR").is(':checked');
	url += "&cat1=" + $("#chkVulnCAT1").is(':checked');
	url += "&cat2=" + $("#chkVulnCAT2").is(':checked');
	url += "&cat3=" + $("#chkVulnCAT3").is(':checked');
	url += "&hostname=" + $("#chkVulnHostname").val();

	// reset the list of systems
	sessionStorage.removeItem("checklistSystems");
	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});

	// parse the result regardless of the one called as the DIV are the same on Dashboard/index and the checklists pages
	if (response.ok) {
		var data = await response.json()
		// hide the system listing
		$("#divSystemListing").hide();
		$("#divChecklistListing").show();
		$("#btnListAllSystems").show();
		//$("#txtSystemName").val(system);
		
		var table = $('#tblChecklistListing').DataTable(); // the datatable reference to do a row.add() to
		table.clear().draw();
		var checklistLink = "";
		if (data.length == 0) {
			$.unblockUI();			
			var alertText = 'There are no Checklists uploaded. Please Upload your first.';
			alertText += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
			alertText += '<span aria-hidden="true">&times;</span></button>';
			$("#divMessaging").html(alertText);
			$("#divMessaging").show();
		}
		else {
			$('#btnExportListToExcel').prop('disabled', false); // allow the Export to Excel button to be live
			$("#divMessaging").html('');
			$("#divMessaging").hide();
			for (const item of data) {
				if (!$("#txtListingTitle").text()) {
					$("#txtListingTitle").text(item.systemTitle);
					$("#txtSystemName").val(item.systemTitle);
				}

				checklistLink = '<a href="single-checklist.html?id=' + item.internalId + '" title="View the Checklist Details">'
				checklistLink += item.title
				checklistLink += '</a><br /><span class="small">last updated on '
				if (item.updatedOn) {
					checklistLink += moment(item.updatedOn).format('MM/DD/YYYY h:mm a');
				}
				else {
					checklistLink += moment(item.created).format('MM/DD/YYYY h:mm a');
				}
				checklistLink += "</span>";
				// now get the score
				var score = await getScoreForChecklistListing(item.internalId);
				if (score) {
					// dynamically add to the datatable but only show main data, click the + for extra data
					table.row.add( { "title": checklistLink, "id": item.internalId,
						"totalNaF": score.totalNotAFinding, "totalNA": score.totalNotApplicable, "totalOpen": score.totalOpen, "totalNR": score.totalNotReviewed,
						"totalNaFCat1": score.totalCat1NotAFinding, "totalNACat1": score.totalCat1NotApplicable, "totalOpenCat1": score.totalCat1Open, "totalNRCat1": score.totalCat1NotReviewed,
						"totalNaFCat2": score.totalCat2NotAFinding, "totalNACat2": score.totalCat2NotApplicable, "totalOpenCat2": score.totalCat2Open, "totalNRCat2": score.totalCat2NotReviewed,
						"totalNaFCat3": score.totalCat3NotAFinding, "totalNACat3": score.totalCat3NotApplicable, "totalOpenCat3": intOpenCat2 = score.totalCat3Open, "totalNRCat3": score.totalCat3NotReviewed
					}).draw();
				}
				else {
					table.row.add( { "title": checklistLink, "id": item.internalId,
						"totalNaF": 0, "totalNA": 0, "totalOpen": 0, "totalNR": 0,
						"totalNaFCat1": 0, "totalNACat1": 0, "totalOpenCat1": 0, "totalNRCat1": 0,
						"totalNaFCat2": 0, "totalNACat2": 0, "totalOpenCat2": 0, "totalNRCat2": 0,
						"totalNaFCat3": 0, "totalNACat3": 0, "totalOpenCat3": 0, "totalNRCat3": 0
					}).draw();
				}
			}
			// with all the data fill in the table and go
		$.unblockUI();
		}
	}
	else {
		$.unblockUI();
		throw new Error(response.status)
	}
}

// called from above to return the checklist score
async function getScoreForChecklistListing(id, template) {
	var url = scoreAPI;
	if (template)
		url = templateAPI;
  try {
		let responseScore = await fetch(scoreAPI + "/artifact/" + id, {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
		if (responseScore.ok) {
			var dataScore = await responseScore.json()
			return dataScore;
		}
	}
	catch (error) {
		console.error("returning an empty score");
		return null;
	}
}

// the dropdown filter for the checklist listing page
async function getChecklistSystemsForChecklistFilter() {
	var data = await getChecklistSystems();
	// for each data add to the upload checklistSystem
	if (data) {
		$.each(data, function (index, value) {
			$('#checklistSystemFilter').append($('<option/>', { 
				value: value.internalId,
					text : value.title
			}));
		}); 
	}
}

// if on a specific checklist page, go back to the Checklist Listing page for that system
function returnToChecklistListing() {
	location.href = "checklists.html?rtn=1";
}
// go back to the template listing from a single template page
function returnToTemplateListing() {
	location.href = "templates.html";
}
// save the checklist listing as a downloaded XLSX file
async function exportChecklistListingXLSX() {
	// redirect to the API and it downloads the XLSX file of all Checklist Listings
	// if we have a specific system selected only export the ones for that system
	var systemFilter = '';
	if ($("#txtSystemName").val()){
		systemFilter = $("#txtSystemName").val();
	}
	$.blockUI({ message: "Generating the System Checklist Excel export ...please wait" }); 
	var url = readAPI;
	if (getParameterByName('id')) 
		url += "/system/export/" + encodeURIComponent(getParameterByName('id'));
	else // session
		url += "/system/export/" + encodeURIComponent(sessionStorage.getItem("currentSystem"));
	// add in the system filter for the export
	url += "/?naf=" + $("#chkVulnNaF").is(':checked');
	url += "&open=" + $("#chkVulnOpen").is(':checked');
	url += "&na="   + $("#chkVulnNA").is(':checked');
	url += "&nr="   + $("#chkVulnNR").is(':checked');
	url += "&cat1=" + $("#chkVulnCAT1").is(':checked');
	url += "&cat2=" + $("#chkVulnCAT2").is(':checked');
	url += "&cat3=" + $("#chkVulnCAT3").is(':checked');

	// now that you have the URL, post it, get the file, save as a BLOB and name as XLSX
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);
	request.responseType = 'blob';
	
	request.onload = function(e) {
		if (this.status === 200) {
			var blob = this.response;
			if(window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveBlob(blob, fileName);
			}
			else{
				var downloadLink = window.document.createElement('a');
				var contentTypeHeader = request.getResponseHeader("Content-Type");
				downloadLink.href = window.URL.createObjectURL(new Blob([blob], { type: contentTypeHeader }));
				downloadLink.download = $.trim($("#txtSystemName").val()) + "-listing.xlsx";
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);
			}
		}
	};
	request.send();
	$.unblockUI();
}

/*************************************
 * Single Checklist Data functions
 *************************************/
// get the specific checklist data
async function getChecklistData(id, template) {
	var url = readAPI + "/artifact";
	if (template)
		url = templateAPI;
	let response = await fetch(url + "/" + id, {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
	if (response.ok) {
		clearSessionData();
		// now get the data set
		var data = await response.json();
		var title = data.title;
		$("#checklistTitle").html('<i class="fa fa-table"></i> ' + title);
		var updatedDate = "Last Updated on ";
		if (data.updatedOn) {
			updatedDate += moment(data.updatedOn).format('MM/DD/YYYY h:mm a');
		}
		else {
			updatedDate += moment(data.created).format('MM/DD/YYYY h:mm a');
		}
		$("#checklistSystem").html("<b>System:</b> " + data.systemTitle);
		$("#checklistHost").html("<b>Host:</b> " + data.checklist.asset.hosT_NAME);
		$("#checklistFQDN").html("<b>FQDN:</b> " + data.checklist.asset.hosT_FQDN);
		$("#checklistTechArea").html("<b>Tech Area:</b> " + data.checklist.asset.tecH_AREA);
		$("#checklistAssetType").html("<b>Asset Type:</b> " + data.checklist.asset.asseT_TYPE);
		$("#checklistRole").html("<b>Role:</b> " + data.checklist.asset.role);
		
		$("#checklistSTIGTitle").html("<b>Title:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[7].siD_DATA);
		$("#checklistSTIGReleaseInfo").html("<b>Release:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[6].siD_DATA);
		$("#checklistSTIGVersionInfo").html("<b>Version:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[0].siD_DATA);
		// template should use its uploaded description
		if (template && data.description)
			$("#templateDescription").html("<b>Description:</b> " + data.description);

		// load updated date
		$("#chartSeverityUpdated").text(updatedDate);
		$("#chartCategoryUpdated").html(updatedDate);
		$("#barChartUpdated").html(updatedDate);
		$("#checklistLastUpdated").html(updatedDate);

		// update the Template Scoring dynamically
		if (template) getScoreForTemplateListing(data.rawChecklist);

		await getChecklistSystemsForChecklist();
		// go ahead and fill in the modal for for upload while we are in here
		$("#frmChecklistSystem").val(data.systemGroupId);
		$("#frmChecklistTitle").text(data.title);
		$("#frmChecklistHost").val(data.checklist.asset.hosT_NAME);
		$("#frmChecklistFQDN").val(data.checklist.asset.hosT_FQDN);
		$("#frmChecklistTechArea").val(data.checklist.asset.tecH_AREA);
		$("#frmChecklistAssetType").val(data.checklist.asset.asseT_TYPE);
		$("#frmChecklistRole").val(data.checklist.asset.role);

		// load the vulnerabilities into sessionStorage
		var vulnListing = "";
		var vulnStatus = "[";
		var vulnFilter = [];
		var controlFilter = getParameterByName("ctrl");
		if (controlFilter) {
			// only show the relevant Vuln IDs by the artifact ID and the control passed in
			vulnFilter = await getVulnerabilitiesByControl(id, controlFilter);
		}
		if (vulnFilter && vulnFilter.length == 0){
			$("#divVulnFilter").show();
			$("#rowControlInformation").hide();
		}
		else {
			$("#divVulnFilter").hide();
			var controlInfo = await getControlInformation(controlFilter); // see if there is a description
			if (controlInfo) { 
				// print out the control information
				$("#checklistControlTitle").html(controlInfo.family + ": " + controlInfo.number + " - " + controlInfo.title);
				$("#checklistControlGuidance").html(controlInfo.supplementalGuidance);
				$("#rowControlInformation").show();
			}
		}
		for (const vuln of data.checklist.stigs.iSTIG.vuln) {
			sessionStorage.setItem(vuln.stiG_DATA[0].attributE_DATA, JSON.stringify(vuln));
			// if we are not filtering on the control, print this out
			// OR
			// if we are filtering on the control and this Vuln ID is in the list of the filter, print this out
			if (vulnFilter.length == 0 || (jQuery.inArray(vuln.stiG_DATA[0].attributE_DATA, vulnFilter) > -1)) {
				// add to the checklistTree
				// based on one of the status color the background appropriately
				vulnListing += '<button id="btnVulnerability-'+ vuln.stiG_DATA[0].attributE_DATA + '" type="button" class="btn btn-sm ';
				vulnListing += getVulnerabilityStatusClassName(vuln.status, vuln.stiG_DATA[1].attributE_DATA);
				vulnListing += '" title="' + vuln.stiG_DATA[5].attributE_DATA + '" ';
				vulnListing += ' onclick="viewVulnDetails(\'' + vuln.stiG_DATA[0].attributE_DATA + '\'); return false;">'
				vulnListing += vuln.stiG_DATA[0].attributE_DATA + '</button><br />';
			}
			// save off a list of all VulnIDs and their status to filter later client side
			vulnStatus += '{"vulnId" : "' + vuln.stiG_DATA[0].attributE_DATA +  '", "status" : "' + vuln.status + '"},';
		}
		// take off the last comma and then close it out
		vulnStatus = vulnStatus.slice(0,-1) + "]";
		sessionStorage.setItem("vulnStatus", vulnStatus);
		// see if there is a control passed in and if so, only show the valid controls
		$("#checklistTree").html(vulnListing);
	} else {
		$("#txtBadChecklistId").text(id);
		$("#divBadChecklistId").show();
	}
}
// set the vulnerability filter off the Score table, then scroll down to it
function setVulnerabilityFilter(status, severity) {
	// clear all checkboxes
	$('#chkVulnNaF').prop('checked', false);
	$('#chkVulnOpen').prop('checked', false);
	$('#chkVulnNA').prop('checked', false);
	$('#chkVulnNR').prop('checked', false);
	$('#chkVulnCAT1').prop('checked', false);
	$('#chkVulnCAT2').prop('checked', false);
	$('#chkVulnCAT3').prop('checked', false);
	// set the status checkboxes correctly
	if (status == "open") 
		$('#chkVulnOpen').prop('checked', true);
	else if (status == "naf") 
		$('#chkVulnNaF').prop('checked', true);
	else if (status == "nr") 
		$('#chkVulnNR').prop('checked', true);
	else if (status == "na") 
		$('#chkVulnNA').prop('checked', true);

	// set the severity checkboxes correctly
	// top row of the score = severity of all
	if (severity == "cat1" || severity == "all") 
		$('#chkVulnCAT1').prop('checked', true);
	if (severity == "cat2" || severity == "all") 
		$('#chkVulnCAT2').prop('checked', true);
	if (severity == "cat3" || severity == "all") 
		$('#chkVulnCAT3').prop('checked', true);

	// call the update
	updateVulnerabilityListingByFilter();

	// scroll down to it
	var elmnt = document.getElementById("divVulnerabilities");
	if (elmnt) 
		elmnt.scrollIntoView();
}

// based on the checkboxes, filter the Vuln Ids listing
function updateVulnerabilityListingByFilter() {
	var status = JSON.parse(sessionStorage.getItem("vulnStatus"));
	if (status) {
		clearVulnDetails();
		var vulnListing = "";
		var vulnRecord = "";
		var severity = "";
		for (const vuln of status) {
			// if we should show it, add it to the HTML listing
			if (showVulnId(vuln)) {
				var vulnRecord = JSON.parse(sessionStorage.getItem(vuln.vulnId));
				if (vulnRecord) {
					severity = vulnRecord.stiG_DATA[1].attributE_DATA;
				} else {
					severity = "high"; // default catch all answer
				}
				// parse them base on the above booleans and print them out
				vulnListing += '<button id="btnVulnerability-'+ vuln.vulnId + '" ';
				vulnListing += ' type="button" class="btn btn-sm ';
				vulnListing += getVulnerabilityStatusClassName(vuln.status, severity);
				vulnListing += '" title="' + vuln.vulnId + '" ';
				vulnListing += ' onclick="viewVulnDetails(\'' + vuln.vulnId + '\'); return false;">'
				vulnListing += vuln.vulnId + '</button><br />';
			}
		}
		// rewrite the listing
		$("#checklistTree").html(vulnListing);
		vulnListing = "";
		vulnRecord = "";
		severity = "";
	}
}
// see if the vulnerability filters allow showing this vulnerability in the listing
function showVulnId(vuln){
	// status checkboxes
	var bOpen = $('#chkVulnOpen').prop('checked');
	var bNaF  = $('#chkVulnNaF').prop('checked');
	var bNA   = $('#chkVulnNA').prop('checked');
	var bNR   = $('#chkVulnNR').prop('checked');
	// severity checkboxes
	var bCat1  = $('#chkVulnCAT1').prop('checked');
	var bCat2  = $('#chkVulnCAT2').prop('checked');
	var bCat3  = $('#chkVulnCAT3').prop('checked');
	// grab the pertinent values
	var status = vuln.status.toLowerCase();
	var severity = "high";
	var vulnRecord = JSON.parse(sessionStorage.getItem(vuln.vulnId));
	if (vulnRecord)	
		severity = vulnRecord.stiG_DATA[1].attributE_DATA.toLowerCase();
	var value = false;

	// now we can check status and boolean
	if (status == 'not_reviewed' && bNR)
		value = true;
	else if (status == 'open' && bOpen)
		value = true;
    else if (status == 'not_applicable' && bNA)
		value = true;
	else if (status == 'notafinding' && bNaF)
		value = true;

	// check the severity as well to make sure we are good
	// only do this check if one of the items above was set to true
	if (value) {
		if (severity == 'high' && bCat1)
			value = true;
		else if (severity == 'medium' && bCat2)
			value = true;
		else if (severity == 'low' && bCat3)
			value = true;
		else
			value = false; // only if no severity is checked, which is not smart
	}

	return value;
}
// get the color coding of the class based on vulnerability status
function getVulnerabilityStatusClassName (status, severity) {
	if (status.toLowerCase() == 'not_reviewed')
		return "vulnNotReviewed";
	else if (status.toLowerCase() == 'open') {
		if (severity.toLowerCase() == "high")
			return "vulnOpenCAT1";
		else if (severity.toLowerCase() == "medium")
			return "vulnOpenCAT2";
		else if (severity.toLowerCase() == "low")
			return "vulnOpenCAT3";
	}
	else if (status.toLowerCase() == 'not_applicable')
		return "vulnNotApplicable";
	else // not a finding
		return "vulnNotAFinding";
}

// display the vulnerability information by the Vulnerability Id
function viewVulnDetails(vulnId) {
	var data = JSON.parse(sessionStorage.getItem(vulnId));
	if (data) {
		$("#vulnId").html("<b>VULN ID:</b>&nbsp;" + vulnId);
		$("#vulnStigId").html("<b>STIG ID:</b>&nbsp;" + data.stiG_DATA[4].attributE_DATA);
		$("#vulnRuleId").html("<b>Rule ID:</b>&nbsp;" + data.stiG_DATA[3].attributE_DATA);
		$("#vulnRuleName").html("<b>Rule Name:</b>&nbsp;" + data.stiG_DATA[2].attributE_DATA);
		$("#vulnRuleTitle").html("<b>Rule Title:</b>&nbsp;" + data.stiG_DATA[5].attributE_DATA);
		var ccilist = ''; // the rest of the stig data is 1 or more CCI listed
		var severityOverride = '';
		for(i = 24; i < data.stiG_DATA.length; i++) { 
			if (data.stiG_DATA[i].vulN_ATTRIBUTE == "CCI_REF")
				ccilist += data.stiG_DATA[i].attributE_DATA + ", ";
		}
		ccilist = ccilist.substring(0, ccilist.length -2);
		$("#vulnCCIId").html("<b>CCI ID:</b>&nbsp;" + ccilist);
		$("#vulnStatus").html("<b>Status:</b>&nbsp;" + data.status.replace("NotAFinding","Not a Finding").replace("_"," "));
		$("#vulnClassification").html("<b>Classification:</b>&nbsp;" + (data.stiG_DATA[21].attributE_DATA).replace(/\n/g, "<br />"));
		$("#vulnSeverity").html("<b>Severity:</b>&nbsp;" + (data.stiG_DATA[1].attributE_DATA).replace(/\n/g, "<br />"));
		$("#vulnDiscussion").html("<b>Discussion:</b>&nbsp;" + (data.stiG_DATA[6].attributE_DATA).replace(/\n/g, "<br />"));
		$("#vulnCheckText").html("<b>Check Text:</b>&nbsp;" + data.stiG_DATA[8].attributE_DATA.replace(/\n/g, "<br />"));
		$("#vulnFixText").html("<b>Fix Text:</b>&nbsp;" + data.stiG_DATA[9].attributE_DATA.replace(/\n/g, "<br />"));
		$("#vulnReferences").html();
		$("#vulnFindingDetails").html("<b>Finding Details:</b>&nbsp;" + (data.findinG_DETAILS).replace(/\n/g, "<br />"));
		$("#vulnComments").html("<b>Comments:</b>&nbsp;" + (data.comments).replace(/\n/g, "<br />"));
		if (data.stiG_DATA[18].attributE_DATA) {
			$("#vulnSeverityOverrideGuidance").html("<b>Severity Override Guidance:</b>&nbsp;" + (data.stiG_DATA[18].attributE_DATA).replace(/\n/g, "<br />"));
		}
		if (data.severitY_OVERRIDE && data.severitY_OVERRIDE.length > 0) {
			if (data.severitY_OVERRIDE.toLowerCase() == "low") 
				severityOverride = "CAT III / Low";
			else if (data.severitY_OVERRIDE.toLowerCase() == "medium") 
				severityOverride = "CAT II / Medium";
			else if (data.severitY_OVERRIDE.toLowerCase() == "high") 
				severityOverride = "CAT I / High";
			$("#vulnSeverityOverride").html("<b>Severity Override:</b>&nbsp;" + severityOverride);
			$("#vulnSeverityJustification").html("<b>Severity Justification:</b>&nbsp;" + (data.severitY_JUSTIFICATION).replace(/\n/g, "<br />"));
		}
		// set the form values if they can edit
		if (canUpload()) { // fill in the values of the form
			$("#frmVulnIDTitle").text(vulnId);
			$("#frmVulnStatus").val(data.status);
			$("#frmVulnDetails").val(data.findinG_DETAILS);
			$("#frmVulnComments").val(data.comments);
			$("#frmVulnSecurityOverride").val(data.severitY_OVERRIDE);
			$("#frmVulnSecurityJustification").val(data.severitY_JUSTIFICATION);
			$("#btnUpdateVulnerability").show();
		}
		else {
			$("#btnUpdateVulnerability").hide(); // always default to hide this
		}
	}
}

// clear the vulnerability details
function clearVulnDetails() {
	$("#vulnId").html("Please select a Vulnerability ID to view its details.");
	$("#vulnStigId").html("");
	$("#vulnRuleId").html("");
	$("#vulnRuleName").html("");
	$("#vulnRuleTitle").html("");
	$("#vulnCCIId").html("");
	$("#vulnStatus").html("");
	$("#vulnClassification").html("");
	$("#vulnSeverity").html("");
	$("#vulnDiscussion").html("");
	$("#vulnCheckText").html("");
	$("#vulnFixText").html("");
	$("#vulnReferences").html("");
	$("#vulnFindingDetails").html("");
	$("#vulnComments").html("");
	$("#vulnSeverityOverride").html("");
	$("#vulnSeverityJustification").html("");
	$("#vulnSeverityOverrideGuidance").html("");
}

// update function on the checklist page showing all the individual checklist data
function updateSingleChecklist(id) {
	var url = saveAPI + "/artifact/" + id;
	// only if there is a file does this get used uploadAPI
	var formData = new FormData();
	// use the system this came with
	formData.append("systemGroupId",$("#frmChecklistSystem").val());
	formData.append("hostname",htmlEscape($("#frmChecklistHost").val()));
	formData.append("domainname",htmlEscape($("#frmChecklistFQDN").val()));
	formData.append("techarea",$("#frmChecklistTechArea").val());
	formData.append("assettype",$("#frmChecklistAssetType").val());
	formData.append("machinerole",$("#frmChecklistRole").val());

	if ($('#checklistFile').val()) {
		// someone added a file
		formData.append('checklistFile',$('#checklistFile')[0].files[0]);
		url = uploadAPI + "/" + id; // include the file contents in the update
	}
	$.ajax({
		url : url,
		data : formData,
		type : 'PUT',
		beforeSend: function(request) {
			request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
		},
		processData: false,
		contentType: false,
		success : function(data){
			swal("Your Checklist was updated successfully!", "Click OK to continue!", "success")
			.then((value) => {
				getChecklistSystemsForChecklist();
				location.reload(true);
			});
		},
		error: function() {
			swal("Your Checklist was not updated. Please check all values and try again.", "Click OK to continue!", "error");
		}
	});
}

// update function on the checklist page showing all the individual checklist data
function updateSingleChecklistVulnerability(artifactid) {
	var vulnid = $("#frmVulnIDTitle").text();
	if (!vulnid || vulnid.length < 4) {
		swal("Your Vulnerability was not updated. Please refresh the page and try again.", "Click OK to continue!", "success")
		return false;
	}
	var url = saveAPI + "/artifact/" + artifactid + "/vulnid/" + vulnid;
	var formData = new FormData();
	// use the system this came with
	formData.append("systemGroupId",$("#frmChecklistSystem").val());
	formData.append("vulnid",vulnid);
	formData.append("status",$("#frmVulnStatus").val());
	formData.append("comments",htmlEscape($("#frmVulnComments").val()));
	formData.append("details",htmlEscape($("#frmVulnDetails").val()));
	formData.append("severityoverride",$("#frmVulnSecurityOverride").val());
	formData.append("justification",htmlEscape($("#frmVulnSecurityJustification").val()));

	$.ajax({
		url : url,
		data : formData,
		type : 'PUT',
		beforeSend: function(request) {
			request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
		},
		processData: false,
		contentType: false,
		success : function(data){
			swal("Your Vulnerability was updated successfully!", "Click OK to continue!", "success")
			.then((value) => {
				// update the session storage for this vulnerability
				var vulnItem = JSON.parse(sessionStorage.getItem(vulnid));
				if (vulnItem){ // set all the data
					// remove the old class for the button color
					$("#btnVulnerability-"+ vulnid).removeClass(getVulnerabilityStatusClassName(vulnItem.status, vulnItem.stiG_DATA[1].attributE_DATA));
					vulnItem.status = $("#frmVulnStatus").val();
					vulnItem.findinG_DETAILS = htmlEscape($("#frmVulnDetails").val());
					vulnItem.comments = htmlEscape($("#frmVulnComments").val());
					vulnItem.severitY_OVERRIDE = $("#frmVulnSecurityOverride").val();
					vulnItem.severitY_JUSTIFICATION = htmlEscape($("#frmVulnSecurityJustification").val());
					// store the changes back
					sessionStorage.setItem(vulnid, JSON.stringify(vulnItem));
					var severityOverride = '';

					$("#vulnStatus").html("<b>Status:</b>&nbsp;" + vulnItem.status.replace("NotAFinding","Not a Finding").replace("_"," "));
					$("#vulnFindingDetails").html("<b>Finding Details:</b>&nbsp;" + (htmlEscape(vulnItem.findinG_DETAILS)).replace(/\n/g, "<br />"));
					$("#vulnComments").html("<b>Comments:</b>&nbsp;" + (htmlEscape(vulnItem.comments)).replace(/\n/g, "<br />"));
					if (vulnItem.stiG_DATA[18].attributE_DATA) {
						$("#vulnSeverityOverrideGuidance").html("<b>Severity Override Guidance:</b>&nbsp;" + (vulnItem.stiG_DATA[18].attributE_DATA).replace(/\n/g, "<br />"));
					}
					if (vulnItem.severitY_OVERRIDE && vulnItem.severitY_OVERRIDE.length > 0) {
						if (vulnItem.severitY_OVERRIDE.toLowerCase() == "low") 
							severityOverride = "CAT III / Low";
						else if (vulnItem.severitY_OVERRIDE.toLowerCase() == "medium") 
							severityOverride = "CAT II / Medium";
						else if (vulnItem.severitY_OVERRIDE.toLowerCase() == "high") 
							severityOverride = "CAT I / High";
						$("#vulnSeverityOverride").html("<b>Severity Override:</b>&nbsp;" + severityOverride);
						$("#vulnSeverityJustification").html("<b>Severity Justification:</b>&nbsp;" + (htmlEscape(vulnItem.severitY_JUSTIFICATION)).replace(/\n/g, "<br />"));
					}
				}
				// color the button correctly for this
				$("#btnVulnerability-"+ vulnid).addClass(getVulnerabilityStatusClassName(vulnItem.status, vulnItem.stiG_DATA[1].attributE_DATA));
				// refresh the status of this VULN in the listing for this checklist
				var vulnStatus = JSON.parse(sessionStorage.getItem("vulnStatus"));
				// set the record we need in the vulnStatus object -- get vulnId set status
				vulnStatus.find(function(e){return e.vulnId == vulnid}).status = vulnItem.status;
				// put it back into the sessionStorage
				sessionStorage.setItem("vulnStatus", JSON.stringify(vulnStatus));
			});
		},
		error: function() {
			swal("Your Vulnerability was not updated. Please check all values and try again.", "Click OK to continue!", "error");
		}
	});
}

// get the list of systems for the update function
async function getChecklistSystemsForChecklist() {
	var data = await getChecklistSystems();
	// for each data add to the upload checklistSystem
	if (data) {
		$.each(data, function (index, value) {
			$('#frmChecklistSystem').append($('<option/>', { 
					value: value.internalId,
					text : value.title
			}));
		}); 
	}
}
// call to get the score data and show the name and then funnel data to the
async function getChecklistScore(id) {
	var data = await getScoreForChecklistListing(id);
	displayChecklistScores(data);
}
async function displayChecklistScores(data) {
	if (data) {
		$("#checklistNotAFindingCount").html("<a style='color: white;' href='javascript:setVulnerabilityFilter(\"naf\",\"all\")'>" + data.totalNotAFinding.toString() + "</a>");
		$("#checklistNotApplicableCount").html("<a style='color: white;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"na\",\"all\")'>" + data.totalNotApplicable.toString() + "</a>");
		$("#checklistOpenCount").html("<a style='color: white;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"open\",\"all\")'>" + data.totalOpen.toString() + "</a>");
		$("#checklistNotReviewedCount").html("<a style='color: black;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"nr\",\"all\")'>" + data.totalNotReviewed.toString() + "</a>");
		$("#cat1NotAFindingCount").html("<a style='color: white;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"naf\",\"cat1\")'>" + data.totalCat1NotAFinding.toString() + "</a>");
		$("#cat1NotApplicableCount").html("<a style='color: white;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"na\",\"cat1\")'>" + data.totalCat1NotApplicable.toString() + "</a>");
		$("#cat1OpenCount").html("<a style='color: white;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"open\",\"cat1\")'>" + data.totalCat1Open.toString() + "</a>");
		$("#cat1NotReviewedCount").html("<a style='color: black;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"nr\",\"cat1\")'>" + data.totalCat1NotReviewed.toString() + "</a>");
		$("#cat2NotAFindingCount").html("<a style='color: white;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"naf\",\"cat2\")'>" + data.totalCat2NotAFinding.toString() + "</a>");
		$("#cat2NotApplicableCount").html("<a style='color: white;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"na\",\"cat2\")'>" + data.totalCat2NotApplicable.toString() + "</a>");
		$("#cat2OpenCount").html("<a style='color: white;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"open\",\"cat2\")'>" + data.totalCat2Open.toString() + "</a>");
		$("#cat2NotReviewedCount").html("<a style='color: black;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"nr\",\"cat2\")'>" + data.totalCat2NotReviewed.toString() + "</a>");
		$("#cat3NotAFindingCount").html("<a style='color: white;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"naf\",\"cat3\")'>" + data.totalCat3NotAFinding.toString() + "</a>");
		$("#cat3NotApplicableCount").html("<a style='color: white;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"na\",\"cat3\")'>" + data.totalCat3NotApplicable.toString() + "</a>");
		$("#cat3OpenCount").html("<a style='color: white;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"open\",\"cat3\")'>" + data.totalCat3Open.toString() + "</a>");
		$("#cat3NotReviewedCount").html("<a style='color: black;' title='Filter Vulnerabilities' href='javascript:setVulnerabilityFilter(\"nr\",\"cat3\")'>" + data.totalCat3NotReviewed.toString() + "</a>");
		
		// show the charts with the same data
		makeChartSeverity(data);
		makeChartCategory(data);
		makeBarChartBreakdown(data);
	}
	else {
		$("#checklistNotAFindingCount").text("0");
		$("#checklistNotApplicableCount").text("0");
		$("#checklistOpenCount").text("0");
		$("#checklistNotReviewedCount").text("0");
	}
}
// pie chart with the status of the checklist
async function makeChartSeverity (data) {
	var ctx3 = document.getElementById("chartSeverity").getContext('2d');
	var chartSeverity = new Chart(ctx3, {
		type: 'pie',
		data: {
			datasets: [{
				data: [data.totalOpen, data.totalNotAFinding, data.totalNotApplicable, data.totalNotReviewed],
				backgroundColor: [
					'rgba(255,99,132,1)',
					'rgba(75, 192, 192, 1)',
					'rgba(150, 150, 150, 1)',
					'rgba(54, 162, 235, 1)'
				],
				label: 'Checklist Severity Breakdown'
			}],
			labels: [
				"Open",
				"Not a Finding",
				"Not Applicable",
				"Not Reviewed"
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			aspectRatio: 1,
			legend: {
			  display: true,
			  position: 'bottom',
			  labels: {
				fontSize: 10,
				padding: 5
			  }
			},
			plugins: {
			  labels: {
				render: 'value',
				fontSize: 14,
				//fontStyle: 'bold',
				fontColor: '#000',
				//position: 'outside',
				fontFamily: '"Lucida Console", Monaco, monospace'
			  }
			}
		}	 
  });
}
function downloadChart(element) {
	var img = document.getElementById(element).toDataURL("image/jpg");
	//location.href = url;
	var element = document.createElement('a');
	element.setAttribute('href', img);
	element.setAttribute('download', "OpenRMFChart.jpg");
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}
// pie chart showing breakdown by category 1/2/3
async function makeChartCategory (data) {
	var ctx4 = document.getElementById("chartCategory").getContext('2d');
	var chartCategory = new Chart(ctx4, {
		type: 'pie',
		data: {
				datasets: [{
					data: [data.totalCat1, data.totalCat2, data.totalCat3],
					backgroundColor: [
						'rgba(255, 99, 132, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 206, 86, 1)'
					],
					label: 'Category Breakdown'
				}],
				labels: [
					"CAT I",
					"CAT II",
					"CAT III"
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				aspectRatio: 1,
				legend: {
				display: true,
				position: 'bottom',
				labels: {
					fontSize: 10,
					padding: 5
				}
				},
				plugins: {
				labels: {
					render: 'value',
					fontSize: 14,
					//fontStyle: 'bold',
					fontColor: '#000',
					//position: 'outside',
					fontFamily: '"Lucida Console", Monaco, monospace'
				}
				}
			}
  });
}
// bar chart breaking down score by category and status
async function makeBarChartBreakdown(data) {  
	// barChart
	var ctx1 = document.getElementById("barChart").getContext('2d');
	var barChart = new Chart(ctx1, {
		type: 'bar',
		data: {
			labels: ["CAT I - Open", "CAT I - Not a Finding", "CAT I - N/A", "CAT I - Not Reviewed", "CAT II - Open", "CAT II - Not a Finding", "CAT II - N/A", "CAT II - Not Reviewed","CAT III - Open", "CAT III - Not a Finding", "CAT III - N/A", "CAT III - Not Reviewed"],
			datasets: [{
				label: '# Vulnerabilities by Status and Category',
        data: [data.totalCat1Open, data.totalCat1NotAFinding, data.totalCat1NotApplicable, data.totalCat1NotReviewed, 
          data.totalCat2Open, data.totalCat2NotAFinding, data.totalCat2NotApplicable, data.totalCat2NotReviewed, 
          data.totalCat3Open, data.totalCat3NotAFinding, data.totalCat3NotApplicable, data.totalCat3NotReviewed],
				backgroundColor: [
					'rgba(255, 99, 132, 0.5)',
					'rgba(75, 192, 192, 0.5)',
					'rgba(150, 150, 150, 0.5)',
					'rgba(54, 162, 235, 0.5)',	
					'rgba(255, 99, 132, 0.5)',
					'rgba(75, 192, 192, 0.5)',
					'rgba(150, 150, 150, 0.5)',	
					'rgba(54, 162, 235, 0.5)',
					'rgba(255, 99, 132, 0.5)',
					'rgba(75, 192, 192, 0.5)',
					'rgba(150, 150, 150, 0.5)',
					'rgba(54, 162, 235, 0.5)'	
				],
				borderColor: [
					'rgba(0,0,0,0.7)',
					'rgba(0,0,0,0.7)',
					'rgba(0,0,0,0.7)',
					'rgba(0,0,0,0.7)',
					'rgba(0,0,0,0.7)',
					'rgba(0,0,0,0.7)',
					'rgba(0,0,0,0.7)',
					'rgba(0,0,0,0.7)',
					'rgba(0,0,0,0.7)',
					'rgba(0,0,0,0.7)',
					'rgba(0,0,0,0.7)',
					'rgba(0,0,0,0.7)'
				],
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
	});
}

// download the XML into a .CKL file to use
async function downloadChecklistFile(id, template){
	var url = readAPI;
	if (template)
		url = templateAPI;

	let response = await fetch(url + "/download/" + id, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
		var data = await response.text();
		var element = document.createElement('a');
		var title = $.trim($("#checklistTitle").text()) + ".ckl";
		element.setAttribute('href', 'data:application/xml;charset=utf-8,' + encodeURIComponent(data));
		element.setAttribute('download', $.trim(title.replace(/\s+/g, '_').toLowerCase()));
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}
}
// export the checklist to XML, accounting for the VULN listing by control if from compliance
async function exportChecklistXLSX(id) {
	// redirect to the API and it downloads the XLSX file
	// pass in bool nf, bool open, bool na, bool nr to see if the filters are checked or
	var url = readAPI + "/export/" + id + "/";

	// get the proper URL to parse and get back the XLSX file
    if (getParameterByName('ctrl')) { // this is from the Compliance Report so export with the linked VULNs
		url += "?ctrl=" + getParameterByName('ctrl');
	}
	else { // this is opening a regular checklist, use the VULN filter
		var bOpen = $('#chkVulnOpen').prop('checked');
		var bNaF  = $('#chkVulnNaF').prop('checked');
		var bNA   = $('#chkVulnNA').prop('checked');
		var bNR   = $('#chkVulnNR').prop('checked');
		// based on the checks above, generate the URL and launch
		url += "?nf=" + bNaF.toString() + "&open=" + bOpen.toString() + "&na=" + bNA.toString() + "&nr=" + bNR.toString();
	}

	// now that you have the URL, post it, get the file, save as a BLOB and name as XLSX
	var request = new XMLHttpRequest();
	request.open('POST', url, true);
	request.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);
	request.responseType = 'blob';
	
	request.onload = function(e) {
		if (this.status === 200) {
			var blob = this.response;
			if(window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveBlob(blob, fileName);
			}
			else{
				var downloadLink = window.document.createElement('a');
				var contentTypeHeader = request.getResponseHeader("Content-Type");
				downloadLink.href = window.URL.createObjectURL(new Blob([blob], { type: contentTypeHeader }));
				downloadLink.download = $.trim($("#checklistTitle").text()) + ".xlsx";
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);
				}
			}
		};
		request.send();
}
// delete a single checklist
async function deleteChecklist(id) {
	if (id && id.length > 10) {
		swal({
			title: "Delete this Checklist?",
			text: "Are you sure you wish to delete this checklist?",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		  })
		  .then((willDelete) => {
			if (willDelete) {
				$.ajax({
					url : saveAPI + "/artifact/" + id,
					type : 'DELETE',
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success: function(data){
						swal("Your Checklist was deleted successfully!", "Click OK to continue!", "success")
						.then((value) => {
							reloadSystemRecordBySession();
						});
					},
					error : function(data){
						swal("There was a Problem. Your Checklist was not deleted successfully! Please check with the Application Admin.", "Click OK to continue!", "error");
					}
			    });
			  
			} else {
			  swal("Canceled the Deletion.");
			}
		});
	}
}

/************************************ 
 Upload Functions
************************************/
// get the list of systems from system memory OR from local storage
// also need a way to refresh this
async function getChecklistSystems() {
	var data = JSON.parse(sessionStorage.getItem("checklistSystems"));
	if (data) 
		return data;
	else {
		let response = await fetch(readAPI + "/systems", {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
		if (response.ok) {
				var data = await response.json();
				sessionStorage.setItem("checklistSystems", JSON.stringify(data));
				return data;
		}
	}
}
// get the list of systems for the upload function
async function getChecklistSystemsForUpload(id) {
	sessionStorage.removeItem("checklistSystems");
	// clear the options
	$('#checklistSystem').children().remove().end();
	var data = await getChecklistSystems();
	// for each data add to the upload checklistSystem
	if (data) {
		if (data.length > 0) {
			$.each(data, function (index, value) {
				if (id && value.internalId == id)
					optionString = '<option selected value="' + value.internalId + '">' + value.title + '</option>';
				else 
					optionString = '<option value="' + value.internalId + '">' + value.title + '</option>';
				$('#checklistSystem').append(optionString); 
			}); 
		} else {
			// there are no systems as of yet, so lets just make the "add new system" highlighted and go
			$('#divNewChecklistSystem').hide(); 
			$('#divNewChecklistSystemText').show(); 
		}
	}
}
// called from the Upload page to upload one or more checklists
function uploadChecklist(){
	var formData = new FormData();
	if ($("input[id=checklistFile]").length == 0) {
		swal("Error on the Upload", "You need to upload at least one checklist or DoD SCAP XCCDF file.", "error");
		return false;
	}
	swal("Uploading Checklists...", {
		buttons: false,
		timer: 3000,
	});
	// could be 1 to 5 of these depending on how they selected the CKL files
	// can do 1 at a time or in bunches or 5 at once
	for (i = 0; i < $("input[id=checklistFile]").length; i++) {
		// add each file to the list and post them later below
		// could be 1 to 5 files per file entry
		if ($("input[id=checklistFile]")[i].files.length > 0) {
			for (j = 0; j < $("input[id=checklistFile]")[i].files.length; j++) {
				formData.append('checklistFiles',$("input[id=checklistFile]")[i].files[j]);
			}
		}
	}
	// if a new system, use it, otherwise select from the list
	if ($("#checklistSystemText").is(':visible')){
		if ($("#checklistSystemText").val().trim().length ==0) {
			swal("Error on the Upload", "Please fill in the new System Name field.", "error");
			return false;
		}
		// add this new one to the listing
		formData.append("system",$("#checklistSystemText").val().trim());
	}
	else // grab the Unique ID of the System Group and pass that
		formData.append("systemGroupId",$("#checklistSystem").val());

	// send the data up to the API
	$.ajax({
			url : uploadAPI,
			data : formData,
			type : 'POST',
			processData: false,
			contentType: false,
			beforeSend: function(request) {
			  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
			},
			success : function(data){
				// refresh the list of systems
				if ($("#checklistSystemText").is(':visible')){
					getChecklistSystemsForUpload();
					$("#checklistSystem option:contains($('#checklistSystemText').val().trim())").attr('selected', 'selected');
					$("#checklistSystemText").val();
					$('#divNewChecklistSystemText').hide();
					$('#divNewChecklistSystem').show();
				}
				if (data.failed == 0)
					swal("Your " + data.successful + " Checklists were uploaded successfully!", "Click OK to continue!", "success");
				else {
					var message = "There were " + data.failed + " failed checklists. ( "; 
					$.each(data.failedUploads, function (index, value) {
						if (index > 0) message += "; ";
						message += value;
					});
					message += " ) Click OK to continue!";
					swal("You had " + data.successful + " Checklists uploaded successfully!", message, "error");
				}
				// reset the form
				$('#checklistFile').trigger("filer.reset")
			},
			error: function(data) {
				//show any that did not work right specifically, the rest worked correctly
				swal("Error Uploading Checklist", "There was an error uploading some of your checklists. Please try again.", "error");
			}
	});
}

function uploadTemplate(){
	swal("Uploading Template...", {
		buttons: false,
		timer: 3000,
	});
	var formData = new FormData();
	formData.append("type",$("#templateType").val());
	formData.append("title",htmlEscape($("#templateTitle").val()));
	formData.append("description",htmlEscape($("#templateDescription").val()));
	formData.append('checklistFile',$('#templateFile')[0].files[0]);
	$.ajax({
			url : templateAPI,
			data : formData,
			type : 'POST',
			beforeSend: function(request) {
			  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
			},
			processData: false,
			contentType: false,
			success : function(data){
				swal("Your Template was uploaded successfully!", data.title + " is ready to use. Click OK to continue!", "success");
				// reset the form
				$("#frmTemplateUpload")[0].reset();
				$('#templateFile').trigger("filer.reset")
			},
			error: function() {
				swal("Error Uploading Template", "There was an error uploading the template. Please try again.", "error");
			}
	});
}

/************************************
 * Reports Functions
 ***********************************/
async function getChecklistTypeBreakdown(system) {
	var url = readAPI + "/counttype";
	// if they pass in the system use it after encoding it
	if (system && system.length > 0 && system != "All")
		url += "?system=" + encodeURIComponent(system);
  let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
  if (response.ok) {
		var data = await response.json()
		var ctx3 = document.getElementById("chartChecklistTypeBreakdown").getContext('2d');
		var chartSeverity = new Chart(ctx3, {
			type: 'pie',
			data: {
					datasets: [{
						label: 'Checklists by Type'
					}]
				},
				options: {
					responsive: true
				}
		});
		// cycle through the real data
		var myData = [];
		var myLabels = [];
		var myBGColor = [];
		if (data.length > 0){
			for (const item of data) {
				myData.push(item.count);
				myLabels.push(item.stigType);
				myBGColor.push(getRandomColor());
			}
		}
		else {
			myData.push(0);
			myLabels.push("None");
			myBGColor.push(getRandomColor());
		}
		chartSeverity.data.datasets[0].data = myData;
		chartSeverity.data.labels = myLabels;
		chartSeverity.data.datasets[0].backgroundColor = myBGColor;
		chartSeverity.update();
	}
}
// the system dropdown on the Reports page
async function getChecklistSystemsForReportFilter() {
	var data = await getChecklistSystems();
	// for each data add to the upload checklistSystem
	if (data) {
		$.each(data, function (index, value) {
			$('#checklistSystemFilter').append($('<option/>', { 
					value: value.internalId,
					text : value.title 
			}));
		}); 
	}
}
async function getReportsBySystem() {
	await getChecklistTypeBreakdown($("#checklistSystemFilter").val());
}
// run the Nessus report
async function getNessusPatchScanReport() {
	var systemGroupId = $("#checklistSystemFilter").val();
	if (!systemGroupId || systemGroupId.length == 0)
	{
		swal("Please choose a system for the report.", "Click OK to continue!", "error");
		return;
	}
	// call the read API /reports/nessus/xxxxxxxxxxxx
	$.blockUI({ message: "Generating the Nessus Patch Report ...please wait" }); 
	var url = readAPI + "/report/nessus/" + systemGroupId;
	// get back the data
	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {				
		// put into a datatable like the others
		var table = $('#tblReportNessus').DataTable(); // the datatable reference to do a row.add() to
		table.clear().draw();
		var data = await response.json();
		if (data && data.reportName.length > 0 && data.summary.length > 0) {
			// use the Report Name
			$("#reportNessusReportName").html("Nessus Scan Report: " + data.reportName);
		}
		for (const item of data.summary) {
			// dynamically add to the datatable but only show main data, click the + for extra data
			table.row.add( { "hostname": item.hostname, "pluginId": item.pluginId,
				"pluginName": item.pluginName, "severity": item.severity + ' - ' + item.severityName, 
				"hostTotal": item.hostTotal, "total": item.total, "family": item.family, 
				"description": item.description, "publicationDate": item.publicationDate, 
				"pluginType": item.pluginType, "riskFactor": item.riskFactor, "synopsis": item.synopsis
			}).draw();
		}
		$.unblockUI();
	}
	else {
		$.unblockUI();
		swal("There was a problem running your report. Please check with the Application Administrator to see if all services are running.", "Click OK to continue!", "error");
		throw new Error(response.status)
	}
}
// run the area chart report by system
async function getSystemTotalsByTypeReport() {
	var systemGroupId = $("#checklistSystemFilter").val();
	if (!systemGroupId || systemGroupId.length == 0)
	{
		swal("Please choose a system for the report.", "Click OK to continue!", "error");
		return;
	}
	$.blockUI({ message: "Generating the System Totals Chart...please wait" }); 
	var data = await getScoreForSystemChecklistListing(systemGroupId);
	if (data) 
		renderSystemReportPieChart("chartReportSystemTotalsBreakdown", data); // render the specific data for this system

	$.unblockUI();
}
// Reports:  get the data for the pie chart in the Systems listing to show
function renderSystemReportPieChart(element, data) {
	var ctx3 = document.getElementById(element).getContext('2d');
	var chartSeverity = new Chart(ctx3, {
		type: 'pie',
		data: {
			datasets: [{
				data: [data.totalCat1Open, data.totalCat2Open, data.totalCat3Open, data.totalNotAFinding, data.totalNotApplicable, data.totalNotReviewed],
				backgroundColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(255, 153, 0, 1)',
					'rgba(216, 216, 14, 1)',
					'rgba(0, 204, 0, 1)',
					'rgba(150, 150, 150, 1)',
					'rgba(242, 242, 242, 1)'
				],
				label: 'System Severity Breakdown'
			}],
			labels: [
				"CAT 1 Open",
				"CAT 2 Open",
				"CAT 3 Open",
				"Not a Finding",
				"N/A",
				"Not Reviewed"
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			aspectRatio: 1,
			legend: {
			  display: true,
			  position: 'bottom',
			  labels: {
				fontSize: 10,
				padding: 5
			  }
			},
			plugins: {
			  labels: {
				render: 'value',
				fontSize: 14,
				//fontStyle: 'bold',
				fontColor: '#000',
				//position: 'outside',
				fontFamily: '"Lucida Console", Monaco, monospace'
			  }
			}
		}
	});
}
async function updateChecklistFilter() {
	var systemGroupId = $("#checklistSystemFilter").val();
	if (!systemGroupId || systemGroupId.length == 0)
	{
		swal("Please choose a system for the report.", "Click OK to continue!", "error");
		return;
	}
	// clear the options
	$('#checklistFilter').empty();

	// get the list of checklists
	var url = readAPI + "/systems/" + encodeURIComponent(systemGroupId);
	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});

	// parse the result regardless of the one called as the DIV are the same on Dashboard/index and the checklists pages
	if (response.ok) {
		var data = await response.json();
		if (data) {
			$.each(data, function (index, value) {
				$('#checklistFilter').append($('<option/>', { 
						value: value.internalId,
						text : value.title 
				}));
			}); 
		}
	}
}
// Reports: list out vulnerabilities for a particular checklist
async function getSystemChecklistReport() {
	var id = $("#checklistFilter").val();
	if (!id || id.length == 0)
	{
		swal("Please choose a checklist for the report.", "Click OK to continue!", "error");
		return;
	}

	$.blockUI({ message: "Generating the Checklist Report ...please wait" }); 
	// call the API to get the checklist data
	var url = readAPI + "/artifact";
	let response = await fetch(url + "/" + id, {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
	if (response.ok) {
		clearSessionData();
		// now get the data set
		var data = await response.json();
		//var title = data.title;
		var updatedDate = "Last Updated on ";
		if (data.updatedOn) {
			updatedDate += moment(data.updatedOn).format('MM/DD/YYYY h:mm a');
		}
		else {
			updatedDate += moment(data.created).format('MM/DD/YYYY h:mm a');
		}

		var table = $('#tblReportSystemChecklist').DataTable();
		table.clear().draw();

		$("#checklistSystem").html("<b>System:</b> " + data.systemTitle);
		$("#checklistHost").html("<b>Host:</b> " + data.checklist.asset.hosT_NAME);
		$("#checklistFQDN").html("<b>FQDN:</b> " + data.checklist.asset.hosT_FQDN);
		$("#checklistTechArea").html("<b>Tech Area:</b> " + data.checklist.asset.tecH_AREA);
		$("#checklistAssetType").html("<b>Asset Type:</b> " + data.checklist.asset.asseT_TYPE);
		$("#checklistRole").html("<b>Role:</b> " + data.checklist.asset.role);
		
		$("#checklistSTIGTitle").html("<b>Title:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[7].siD_DATA);
		$("#checklistSTIGReleaseInfo").html("<b>Release:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[6].siD_DATA);
		$("#checklistSTIGVersionInfo").html("<b>Version:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[0].siD_DATA);
		
		var strStatus = "";
		var ccilist = "";
		for (const item of data.checklist.stigs.iSTIG.vuln) {
			if (item.status == "NotAFinding") 
				strStatus = "Not a Finding";
			else if (item.status == "Not_Reviewed") 
				strStatus = "Not Reviewed";
			else if (item.status == "Not_Applicable	") 
				strStatus = "Not Applicable";
			else 
				strStatus = item.status;
			
			// set this list to empty
			ccilist = "";
			for(i = 24; i < item.stiG_DATA.length; i++) { 
				if (item.stiG_DATA[i].vulN_ATTRIBUTE == "CCI_REF")
					ccilist += item.stiG_DATA[i].attributE_DATA + ", ";
			}
			ccilist = ccilist.substring(0, ccilist.length -2);

			// dynamically add to the datatable but only show main data, click the + for extra data
			table.row.add( { "vulnid": item.stiG_DATA[0].attributE_DATA, "severity": item.stiG_DATA[1].attributE_DATA,
				"ruleid": item.stiG_DATA[3].attributE_DATA, "stigid": item.stiG_DATA[4].attributE_DATA, 
				"status": strStatus, "title": item.stiG_DATA[5].attributE_DATA, "cci": ccilist, 
				"discussion": item.stiG_DATA[6].attributE_DATA, "checkContent": item.stiG_DATA[8].attributE_DATA, 
				"fixText": item.stiG_DATA[9].attributE_DATA, "comments": item.comments, "findingDetails": item.findinG_DETAILS
			}).draw();
		}
		$.unblockUI();
	} else {
		$.unblockUI();
		swal("There was a problem generating your report. Please contact your Application Administrator.", "Click OK to continue!", "error");
	}
}
// Reports: listing of the controls
async function getControlsReport() {
	var pii = $('#checklistPrivacyFilter')[0].checked;
	var url = controlAPI + "/?pii=" + pii + "&impactlevel=" + $('#checklistImpactFilter').val();
	$.blockUI({ message: "Generating the Controls Report ...please wait" }); 
	let response = await fetch(url, {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
	if (response.ok) {
		// now get the data set
		var data = await response.json();

		var table = $('#tblReportControls').DataTable();
		table.clear().draw();
		var impactLevel = "";
		for (const item of data) {
			if (item.status == "NotAFinding") 
				strStatus = "Not a Finding";
			else if (item.status == "Not_Reviewed") 
				strStatus = "Not Reviewed";
			else if (item.status == "Not_Applicable	") 
				strStatus = "Not Applicable";
			else 
				strStatus = item.status;

			if (item.highimpact)
				impactLevel = "High";
			else if (item.moderateimpact)
				impactLevel = "Moderate";
			else if (item.lowimpact)
				impactLevel = "Low";
			else
				impactLevel = "N/A";
			// dynamically add to the datatable but only show main data, click the + for extra data
			table.row.add( { "family": item.family,"number": item.number,"title": item.title,"priority": item.priority,
				"impactlevel": impactLevel,"supplementalGuidance": item.supplementalGuidance, 
				"subControlDescription": item.subControlDescription, "subControlNumber": item.subControlNumber
			}).draw();
		}
		$.unblockUI();
	} else {
		$.unblockUI();
		swal("There was a problem generating your report. Please contact your Application Administrator.", "Click OK to continue!", "error");
	}
}

// Reports: list out a vulnerability by host
async function getHostVulnerabilityReport() {
	var id = $("#checklistSystemFilter").val();
	if (!id || id.length == 0)
	{
		swal("Please choose a system for the report.", "Click OK to continue!", "error");
		return;
	}
	var vulnid = $("#vulnerabilityId").val();
	if (!vulnid || vulnid.length < 5)
	{
		swal("Please enter a Vulnerability Id for the report.", "Click OK to continue!", "error");
		return;
	} else if (!vulnid.toLowerCase().startsWith("v-")) { // if it does not start with V-
		swal("Please enter a valid Vulnerability Id for the report that begins with V-.", "Click OK to continue!", "error");
		return;
	}

	$.blockUI({ message: "Generating the Host Vulnerability Report ...please wait" }); 
	// call the API to get the checklist data
	var url = readAPI + "/report/system/" + id + "/vulnid/" + vulnid;
	let response = await fetch(url, {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
	if (response.ok) {
		clearSessionData();
		// now get the data set
		var data = await response.json();
		var table = $('#tblReportVulnerability').DataTable();
		table.clear().draw();
		
		var strStatus = "";
		var ccilist = "";
		for (const item of data) {
			if (item.status == "NotAFinding") 
				strStatus = "Not a Finding";
			else if (item.status == "Not_Reviewed") 
				strStatus = "Not Reviewed";
			else if (item.status == "Not_Applicable	") 
				strStatus = "Not Applicable";
			else 
				strStatus = item.status;
			
			// set this list to empty
			ccilist = "";
			for(const cci of item.cciList) { 
				ccilist += cci + ", ";
			}
			if (ccilist.length > 0) ccilist = ccilist.substring(0, ccilist.length -2);

			// dynamically add to the datatable but only show main data, click the + for extra data
			table.row.add( { "vulnid": vulnid, "severity": item.severity, "hostname": item.hostname,
				"ruleTitle": item.ruleTitle, "status": strStatus, "cci": ccilist, 
				"discussion": item.discussion, "checkContent": item.checkContent,
				"type": item.checklistType, "release": item.checklistRelease, "version": item.checklistVersion,
				"fixText": item.fixText, "comments": item.comments, "details": item.details
			}).draw();
		}
		$.unblockUI();
	} else {
		$.unblockUI();
		swal("There was a problem generating your report. Please contact your Application Administrator.", "Click OK to continue!", "error");
	}
}

// generate a list of controls for the control for host report
async function getControlsListing(){
	let response = await fetch(controlAPI + "/majorcontrols/", {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
			var data = await response.json();
			$.each(data, function (index, value) {
					optionString = '<option value="' + value.number + '">' + value.number + ' - ' + value.title + '</option>';
				$('#rmfControl').append(optionString); 
			}); 
	}
}

// run the report for listing our hosts that have a control referencing them
async function getRMFControlForHostReport() {
	var id = $("#checklistSystemFilter").val();
	if (!id || id.length == 0)
	{
		swal("Please choose a system for the report.", "Click OK to continue!", "error");
		return;
	}
	var control = $("#rmfControl").val();
	if (!control || control.length == 0)
	{
		swal("Please choose an RMF Control for the report.", "Click OK to continue!", "error");
		return;
	} 

	$.blockUI({ message: "Updating the Hosts for Control listing...this may take a minute" }); 
	// is the PII checked? This is returned as an array even if just one
	var url = complianceAPI + "/system/" + encodeURIComponent(id) + "/?pii=true&filter=high&majorcontrol=" + control;

	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
		var data = await response.json()
		if (data.result.length > 0) {
			// cycle through all data and display a data table
			// add to the datatable JS
			// for each control print out the information
			var table = $('#tblReportControlHost').DataTable();
			table.clear().draw();
			var checklists = ''; // holds the list of checklists
			var currentStatus = "";
			for (const item of data.result) {
				checklists = '';
				if (item.complianceRecords.length > 0) {
					for (const record of item.complianceRecords){
						checklists = '';
						currentStatus = getOverallCompliance(currentStatus, record.status);
						checklists += '<a href="/single-checklist.html?id=';
						checklists += record.artifactId + '&ctrl=' + item.control + '" title="View the Checklist Details" target="' + record.artifactId + '">'; 
						checklists += '<span class="' + getComplianceTextClassName(record.status) + '">' + record.title + '</span></a>';
						// dynamically add to the datatable a row per checklist returned
						table.row.add( [record.hostName, checklists] ).draw();
					}
				}
			}
		}
		else {
			swal("Error Generating Hosts for Control", "There are no checklists ready for this compliance report.", "error");
		}
	}
	else { // response was not Ok()
		swal("Error Generating Hosts for Control", "There was a problem generating the compliance for that system. Make sure the checklists are valid.", "error");
	}
	$.unblockUI();
}

/************************************ 
 Audit List Functions
************************************/
async function getAuditRecords() {
	// call the API to get the checklist data
	var url = auditAPI;
	$.blockUI({ message: "Generating the Audit Listing...please wait" }); 
	let response = await fetch(url + "/", {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
	if (response.ok) {
		// now get the data set
		var data = await response.json();

		var table = $('#tblAuditRecords').DataTable(); // the datatable reference to do a row.add() to
		table.clear().draw();
		for (const item of data) {
			// dynamically add to the datatable but only show main data, click the + for extra data
			table.row.add( { "auditId": item.auditId, "program": item.program,
				"created": moment(item.created).format('MM/DD/YYYY h:mm a'), "action": item.action, 
				"userid": item.userid, "username": item.username, "fullname": item.fullname, 
				"email": item.email, "url": item.url, 
				"message": item.message
			}).draw();
		}
		$.unblockUI();
	} else {
		$.unblockUI();
		swal("There was a problem listing the audit records. Please contact your Application Administrator.", "Click OK to continue!", "error");
	}
}

/************************************ 
 Compliance Functions
************************************/
// the system dropdown on the Compliance page
async function getChecklistSystemsForComplianceFilter(id) {
	var data = await getChecklistSystems();
	// for each data add to the compliance checklistSystem
	if (data) {
		var optionString = '';
		$.each(data, function (index, value) {
			if (id && value.internalId == id)
				optionString = '<option selected value="' + value.internalId + '">' + value.title + '</option>';
			else 
				optionString = '<option value="' + value.internalId + '">' + value.title + '</option>';
			$('#checklistSystemFilter').append(optionString); 
		}); 
	}
}

async function getComplianceBySystem() {
	var system = $("#checklistSystemFilter").val();
	// if they pass in the system use it after encoding it
	if (system && system.length > 0 && system != "All") {
		$.blockUI({ message: "Updating the compliance listing...this may take a minute" }); 
		// is the PII checked? This is returned as an array even if just one
		var pii = $('#checklistPrivacyFilter')[0].checked;
		var url = complianceAPI + "/system/" + encodeURIComponent(system) + "/?pii=" + pii + "&filter=" + $('#checklistImpactFilter').val();
		let response = await fetch(url, {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
		if (response.ok) {
			var data = await response.json()
			if (data.result.length > 0) {
				// cycle through all data and display a data table
				// add to the datatable JS #tblCompliance
				// for each control print out the information
				// control/category, checklist, vulnID, status, description
				var table = $('#tblCompliance').DataTable();
				table.clear().draw();
				var checklists = ''; // holds the list of checklists
				var recordNum = 0;
				// for each family in item.control.substring 2 (first two letters)
				// see what the current status is and compare to each record status
				// each family is sorted so once it changes, you are good to go on to the next one
				// put the results in divComplianceSummary
				var currentFamily = "";
				var currentStatus = "";
				var complianceSummary = "";
				for (const item of data.result) {
					recordNum++;
					checklists = '';
					if (currentFamily != item.control.substring(0,2)) {
						// print out the info
						if (currentFamily) {
							complianceSummary += "<div class='complianceSummaryListing'>";
							complianceSummary += getComplianceSummaryButton(currentFamily, currentStatus) + "</div>";
						}
						currentStatus = ""; // clear it out
						// get the family control
						currentFamily = item.control.substring(0,2);
					}
					if (item.complianceRecords.length > 0) {
						for (const record of item.complianceRecords){
							checklists = '';
							recordNum++;
							currentStatus = getOverallCompliance(currentStatus, record.status);
							checklists += '<a href="/single-checklist.html?id=';
							checklists += record.artifactId + '&ctrl=' + item.control + '" title="View the Checklist Details" target="' + record.artifactId + '">'; 
							checklists += '<span class="' + getComplianceTextClassName(record.status) + '">' + record.title + '</span></a>';
							// dynamically add to the datatable a row per checklist returned
							table.row.add( [recordNum, item.control, item.title, checklists] ).draw();
						}
					} else {
						// dynamically add to the datatable
						table.row.add( [recordNum, item.control, item.title, checklists] ).draw();
					}
				}
				if (complianceSummary) 
					$("#divComplianceSummary").html(complianceSummary);
				else 
					$("#divComplianceSummary").html("No Summary");
			}
			else {
				swal("Error Generating Compliance", "There are no checklists ready for this compliance report.", "error");
			}
		}
		else { // response was not Ok()
			swal("Error Generating Compliance", "There was a problem generating the compliance for that system. Make sure the checklists are valid.", "error");
		}
		$.unblockUI();
	}
	else {
		swal("Choose a System", "You must first choose a system to generate a Compliance Report.", "info");
	}
}

async function getVulnerabilitiesByControl(id, control) {
	let response = await fetch(readAPI + "/" + id + "/control/" + encodeURIComponent(control), {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
			var data = await response.json();
			return data;
	}
	else {
		var emptydata = [];
		return emptydata;
	}
}

async function getControlInformation(control) {
	let response = await fetch(controlAPI + "/" + encodeURIComponent(control), {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
			var data = await response.json();
			return data;
	}
	else {
		var emptydata = [];
		return emptydata;
	}
}

function getComplianceTextClassName(status) {
	if (status.toLowerCase() == 'not_reviewed')
		return "vulnNotReviewedText";
	else if (status.toLowerCase() == 'open')
		return "vulnOpenCAT1Text";
	else if (status.toLowerCase() == 'not_applicable')
		return "vulnNotApplicableText";
	else // not a finding
		return "vulnNotAFindingText";
}

function getOverallCompliance(currentStatus, newStatus) {
	if (!currentStatus)
		return newStatus.toLowerCase();

	if (newStatus.toLowerCase() == "open")
		return newStatus.toLowerCase();
	else if (currentStatus.toLowerCase() != "open" && currentStatus.toLowerCase() != "not_reviewed") { // otherwise keep it the same
		// this was already not_reviewed or it was notafinding from being NaF or N/A
		if (newStatus.toLowerCase() == "not_reviewed")
			return newStatus.toLowerCase();
		else
			return "notafinding"; // catch all cause it is either NaF or N/A
		}
	else
		return currentStatus.toLowerCase(); // was already marked open or not_reviewed
}

// get the button text for the status summary
function getComplianceSummaryButton(family, status) {
	if (status == "open") {
		return "<button class='btn btn-danger' style='cursor: default;'><i class='fa fa-times'> " + family + "</i></button>";
	} else if (status == "notafinding" || status == "not_applicable")  {
		return "<button class='btn btn-success' style='cursor: default;'><i class='fa fa-check'>" + family + "</i></button>";
	} else if (status == "not_reviewed")  {
		return "<button class='btn btn-dark' style='cursor: default;'><i class='fa fa-eye-slash'> " + family + "</i></button>";
	} else {
		return "<button class='btn btn-outline-secondary' style='cursor: default;'><i class='fa fa-ban'> " + family + "</i></button>";
	}
}

/************************************ 
 Generic Functions
************************************/
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
function getRandomColor() {
  var color = 'rgba(';
  color += (Math.floor(Math.random() * (255 - 0 + 1)) + 0).toString();
	color += ",";
  color += (Math.floor(Math.random() * (255 - 0 + 1)) + 0).toString();
	color += ",";
  color += (Math.floor(Math.random() * (255 - 0 + 1)) + 0).toString();
	color +=", 0.7)";
  return color;
}
function htmlEscape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
/************************************ 
 Permission and User Login Functions
************************************/
function verifyMenus() {
	if (canUpload()) {
    	$("#menuUpload").show();
	}
	if (isAdministrator()) {
    	$("#menuAudit").show();
	}
}
function verifyUploadFromSystem() {
	if (canUpload()) {
    	$("#btnUploadChecklist").show();
	}
}
function isAdministrator() {
	return (keycloak.hasRealmRole("Administrator"));
}
function canDownload() {
	return (keycloak.hasRealmRole("Download") || keycloak.hasRealmRole("Administrator"));
}
function canUpload() {
	return (keycloak.hasRealmRole("Editor") || keycloak.hasRealmRole("Administrator"));
}
function canDelete() {
	return (keycloak.hasRealmRole("Editor") || keycloak.hasRealmRole("Administrator"));
}
function verifyDownloadSingleChecklist() {
	if (canDownload()) {
		$("#btnDownloadChecklist").show();
		$("#btnExportChecklist").show();
		$("#btnDownloadChartSeverity").show();
		$("#btnDownloadChartCategory").show();
		$("#btnDownloadBarChart").show();
	}
}
function verifyAddSystem() {
	if (canUpload()) {
		$("#btnAddSystem").show();
	}
}
function verifyDownloadTemplate() {
	if (canDownload()){
		$("#btnDownloadTemplate").show();
	}
}
function verifyDeleteTemplate() {
	if (canDelete()) {
		$("#btnDeleteTemplate").show();
	}
}
function verifyDeleteChecklist() {
	if (canDelete()) {
		$("#btnDeleteChecklist").show();
	}
}
function verifyUpdateChecklist() {
	if (canUpload()) {
		$("#btnUpdateChecklist").show();
	}
}
function verifyUpdateSystem() {
	if (canUpload()) {
		$("#btnUpdateSystem").show();
		$("#btnDeleteSystem").show();
		$("#btnDeleteAllSystemChecklists").show();
		$("#btnDeleteSystemChecklists").show();
	}
}
function verifyDownloadSystemChart() {
	if (canDownload()){
		$("#btnDownloadChartSystemScore").show();
	}
}
function clearSessionData() {
	// keep these settings
	var currentSystem = sessionStorage.getItem("currentSystem");
	var currentSystemsList = sessionStorage.getItem("checklistSystems");
	var currentSystemFilter = sessionStorage.getItem("systemFilter");
	// clear out everything else
	sessionStorage.clear();
	// reset the ones I want to keep
	if (currentSystem && currentSystem != "undefined")
		sessionStorage.setItem("currentSystem", currentSystem);
	if (currentSystemsList && currentSystemsList != "undefined")
		sessionStorage.setItem("checklistSystems", currentSystemsList);
	if (currentSystemFilter && currentSystemFilter != "undefined")
		sessionStorage.setItem("systemFilter", currentSystemFilter);
}

function setupProfileMenu()
{
	// use the person's first name
	$("#profileUserName").text(keycloak.tokenParsed.given_name);
	$("#profileAccountURL").attr("href", keycloak.createAccountUrl());
	var logoutURL = keycloak.endpoints.logout();
	var path = "";

	// if there is a subfolder in the path not just the root in this get it
	var locations = window.location.pathname.split('/');
	// add all slash subfolders in the URL until the last one which is the filename
	// if the first one is "" empty it does no harm
	for (var i = 0; i < locations.length-1; i++) {
		if (locations[i].length > 0)
			path = path + "/" + locations[i];
	}

	logoutURL += "?redirect_uri="+encodeURIComponent(location.protocol + "//" + location.host + path + "/logout.html");
	$("#profileLogoutURL").attr("href", logoutURL);
}