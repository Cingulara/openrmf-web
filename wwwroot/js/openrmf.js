function setupOpenRMFUI(disableTimers) {
	$("#main").show();
    if (typeof keycloak !== 'undefined') {
		setupTimers();
		$("#includeAutoLogin").load("/includes/modalLogout.html"); 
	}
	$("#includeNavBarLink").load("/includes/navbar.html"); 
	$("#includeSidebarLink").load("/includes/sidebarmenu.html"); 
	$("#includeFooterLink").load("/includes/footertext.html"); 
    $.ajaxSetup({
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);
        }
    });
}
function menuMetricsLink(){
    if (urlMetricsMenuLink) 
        window.open(urlMetricsMenuLink, "openrmf-metrics");
    else 
        alert('The Metrics menu has not been configured yet.');
}
function menuKeycloakLink() {
	if (urlKeycloakMenuLink) 
	window.open(urlKeycloakMenuLink, "openrmf-users");
else 
	alert('The Users menu has not been configured yet.');
}
var warningTimeout = 840000;
var timeoutNow = 60000;
var keycloakTimeout = 295000;
var warningTimerID,timeoutTimerID,keycloakTimerID;
var bWarningAutoLogout = false;

function startLogoutTimer() {
    warningTimerID = window.setTimeout(warningInactive, warningTimeout);
}

function startKeycloakUpdateTimer() {
    keycloakTimerID = window.setTimeout(updateKeycloakToken, keycloakTimeout);
}

function warningInactive() {
    bWarningAutoLogout = true;
    window.clearTimeout(warningTimerID);
    timeoutTimerID = window.setTimeout(IdleTimeout, timeoutNow);
    $('#modalAutoLogout').modal('show');
}

function resetLogoutTimer() {
    if (!bWarningAutoLogout) {
        window.clearTimeout(timeoutTimerID);
        window.clearTimeout(warningTimerID);
        startLogoutTimer();
    }
}

function updateKeycloakToken() {
    keycloak.updateToken(300).then(() => {
        window.clearTimeout(keycloakTimerID);
        startKeycloakUpdateTimer();
    }).catch(() => {
        console.log('Keycloak token refresh unsuccessful');
    });
}

function IdleTimeout() {
    autoLogout();
}

function setupTimers () {
    document.addEventListener("mousemove", resetLogoutTimer, false);
    document.addEventListener("mousedown", resetLogoutTimer, false);
    document.addEventListener("keypress", resetLogoutTimer, false);
    document.addEventListener("touchmove", resetLogoutTimer, false);
    document.addEventListener("onscroll", resetLogoutTimer, false);
    startLogoutTimer();
    startKeycloakUpdateTimer();
}

$(document).on('click','#btnStayLoggedIn',function(){
    bWarningAutoLogout = false;
    resetLogoutTimer();
    $('#modalAutoLogout').modal('hide');
});

function logout() {    
    var logoutOptions = { redirectUri : document.location.protocol + '//' + document.location.host + "/logout.html" };
    keycloak.logout(logoutOptions).then((success) => {
        console.log("--> log: logout success ", success );
    }).catch((error) => {
        console.log("--> log: logout error ", error );
    });
}

function autoLogout() {
    var logoutOptions = { redirectUri : document.location.protocol + '//' + document.location.host + "/logout.html?autologout=true" };
    keycloak.logout(logoutOptions).then((success) => {
        console.log("--> log: logout success ", success );
    }).catch((error) => {
        console.log("--> log: logout error ", error );
    });
}

function openProfile() {
    location.href = keycloak.createAccountUrl();
}

async function getSystemTotalCount() {
	let response = await fetch(readAPI + "count/systems", {headers: {
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

async function getChecklistTotalCount() {
	let response = await fetch(readAPI + "count/artifacts", {headers: {
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

async function getTemplateTotalCount() {
	let response = await fetch(templateAPI + "count/templates", {headers: {
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

async function getSystemsForDashboard() {
	sessionStorage.removeItem("checklistSystems");
	$('#checklistSystem').children().remove().end();
	$('#checklistSystem').append('<option value="">[Choose a System Package]</option>');
	$('#checklistACASSystem').children().remove().end();
	$('#checklistACASSystem').append('<option value="">[Choose a System Package]</option>');
	var data = await getChecklistSystems();
	if (data) {
		$.each(data, function (index, value) {
				optionString = '<option value="' + value.internalIdString + '">' + value.title + '</option>';
			$('#checklistSystem').append(optionString);
			$('#checklistACASSystem').append(optionString);
		}); 
	}
}
async function getSystemOpenItemsForDashboard() {
	var systemId = $('#checklistSystem').val();
	if (systemId) {
		$("#divSystemCategoryDashboard").show();
		var data = await getScoreForSystemChecklistListing(systemId);
		if (data) {
			$("#numberCAT1Open").html(data.totalCat1Open);
			$("#numberCAT1OpenItems").text(data.totalCat1Open);
			$("#numberCAT2Open").html(data.totalCat2Open);
			$("#numberCAT2OpenItems").text(data.totalCat2Open);
			$("#numberCAT3Open").html(data.totalCat3Open);
			$("#numberCAT3OpenItems").text(data.totalCat3Open);
		}
	}
	else {
		$("#divSystemCategoryDashboard").hide();
	}
}
function loadSystemFromDashboardCategory(type) {
	var systemId = $('#checklistSystem').val();
	if (systemId) 
		location.href="checklists.html?id=" + systemId + "&category=" + type;
}
async function getSystemACASItemsForDashboard() {
	var systemId = $('#checklistACASSystem').val();
	if (systemId) {
		var data = await getNessusFileSummaryData(systemId);
		if (data) {
			$("#divSystemACASPatchListing").show();
			$("#divNessusStatus").hide();
			$("#numberCriticalOpen").html(data.totalCriticalOpen);
			$("#numberHighOpen").html(data.totalHighOpen);
			$("#numberMediumOpen").html(data.totalMediumOpen);
			$("#numberLowOpen").html(data.totalLowOpen);
		}
		else {
			$("#divSystemACASPatchListing").hide();
			$("#divNessusStatus").html("There is no current Nessus patch file loaded for this <a href='checklists.html?id=" + systemId + "'>system package</a>.");
			$("#divNessusStatus").show();
		}
	}
	else {
		$("#divSystemACASPatchListing").hide();
		$("#divNessusStatus").html("There is no current valid Nessus patch file loaded for this system.");
		$("#divNessusStatus").show();
	}
}
async function getSystemACASItemsForSystemPackageDashboard(systemId) {
	if (systemId) {
		var data = await getNessusFileSummaryData(systemId);
		if (data) {
			$("#divSystemACASPatchListing").show();
			$("#divNessusStatus").hide();
			$("#numberCriticalOpen").html(data.totalCriticalOpen);
			$("#numberHighOpen").html(data.totalHighOpen);
			$("#numberMediumOpen").html(data.totalMediumOpen);
			$("#numberLowOpen").html(data.totalLowOpen);
		}
		else {
			$("#numberCriticalOpen").html("-");
			$("#numberHighOpen").html("-");
			$("#numberMediumOpen").html("-");
			$("#numberLowOpen").html("-");
		}
	}
	else {
		$("#divSystemACASPatchListing").hide();
		$("#divNessusStatus").html("There is no current valid Nessus patch file loaded for this system.");
		$("#divNessusStatus").show();
	}
}
function getSystemACASItemsForSystemPackageDashboardBySession(){
	var currentSystem = sessionStorage.getItem("currentSystem");
	if (currentSystem)
		getSystemACASItemsForSystemPackageDashboard(currentSystem);
	else
		location.href = "systems.html";
}
async function getTemplates(latest) {
	$.blockUI({ message: "Updating the template listing...please wait", css: { padding: '15px'} });
	var table = $('#tblChecklistListing').DataTable();
	table.ajax.url(templateAPI).load(finalizeLoadingTable);
}

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
					url : templateAPI + id,
					type : 'DELETE',
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success: function(data){
						swal("Your Template was deleted successfully!", "Click OK to continue!", "success")
						.then((value) => {
							location.href = "templates.html"; 
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
async function getChecklistSystemsForChecklistCreation() {
	var data = await getChecklistSystems();
	if (data) {
		$.each(data, function (index, value) {
			$('#checklistSystemPackage').append($('<option/>', { 
					value: value.internalIdString,
					text : value.title 
			}));
		}); 
	}
}
async function createChecklistFromTemplate() {
	var systemGroupId = $("#checklistSystemPackage").val();
	var templateId = $("#templateIdForChecklist").val();
	if (templateId && templateId.length > 10 && systemGroupId) {
		swal({
			title: "Create a Checklist from this Template?",
			text: "Are you sure you wish to create a new checklist using this template?",
			icon: "warning",
			buttons: true,
			dangerMode: false,
		  })
		  .then((create) => {
			if (create) {
				$.ajax({
					url : uploadAPI + systemGroupId + "/template/" + templateId,
					type : 'POST',
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success: function(data){
						swal("Your Checklist was created successfully!", "Click OK to continue!", "success");
					},
					error : function(data){
						swal("There was a Problem. Your Checklist was not created successfully! Please check with the Application Admin.", "Click OK to continue!", "error");
					}
			    });
			  
			} else {
			  swal("Canceled the Checklist Creation.");
			}
		});
	} else {
		alert('Please select a valid system package');
	}
}
function listSystems() {
	location.href = "systems.html";
}

async function getSystemListing(){
	$.blockUI({ message: "Updating the system listing...", css: { padding: '15px'} }); 
	var url = readAPI + "systems/";
	$("#divSystemListing").show();
	$("#txtSystemName").val('');
	sessionStorage.removeItem("checklistSystems");
	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
		var data = await response.json()
		var systemsListing = "";

		if (data.length == 0) {
			$.unblockUI();
			var alertText = 'There are no System Packages in here. Please add your first System or Upload your first checklist to get started.';
			alertText += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
			alertText += '<span aria-hidden="true">&times;</span></button>';
			$("#divMessaging").html(alertText);
			$("#divMessaging").show();
		}
		else {
			$('#btnExportListToExcel').prop('disabled', false);
			$("#divMessaging").html('');
			$("#divMessaging").hide();
			var chartNumber = 0;
			$('#divSystemListing').html("");
			for (const item of data) {
				chartNumber = chartNumber + 1;
				systemsListing = '<div class="systemListing"><div class="systemListTitle"><a href="checklists.html?id=' + item.internalIdString + '" ';
				systemsListing += 'title="View the system package information and checklists" >' + item.title + ' (' + item.numberOfChecklists + ')</a>';
				systemsListing += '</div><div class="systemDescription">';
				if (item.description) {
					systemsListing += htmlEscape(item.description);
				} else {
					systemsListing += "<i>(No description)</i>"
				}
				systemsListing += '</div><div class="systemListInfo"><canvas ';
				systemsListing += 'class="systemChart" id="pieChart' + chartNumber + '"></canvas> ';
				systemsListing += '<div style="clear: both;"></div></div></div>';
				$('#divSystemListing').append(systemsListing);
				var data = await getScoreForSystemChecklistListing(item.internalIdString);
				if (data) 
					renderSystemPieChart("pieChart" + chartNumber, data);
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
	url += "system/" + encodeURIComponent(systemGroupId);
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
				$("#divSystemDescription").html("<b>Description:</b> " + htmlEscape(item.description));
				$("#frmSystemDescription").val(item.description);
			}
			else 
				$("#divSystemDescription").html("<b>Description:</b> (no description)");
			$("#divNumberChecklists").html("<b>Checklists:</b> " + item.numberOfChecklists);
			if (item.rawNessusFile) {
				var nessusHTML = "<b>Patch Scan:</b><br />&nbsp;&nbsp;&nbsp;";
				if (canDownload()) {
					var nessusFilename = "latest upload";
					if (item.nessusFilename) 
						nessusFilename = item.nessusFilename;

					nessusHTML += '<a title="Export the Nessus scan Summary to XLSX (' + nessusFilename + ')" href="javascript:exportNessusXML(\'' + item.internalIdString + '\', true)">';
					nessusHTML += 'Summary Export</a> ';
					nessusHTML += ' | <a title="Export the Nessus scan to XLSX by Host (' + nessusFilename + ')" href="javascript:exportNessusXML(\'' + item.internalIdString + '\', false)">';
					nessusHTML += 'Host Export</a>';
					nessusHTML += ' | <a title="Download the Nessus Scan (' + nessusFilename + ')" href="javascript:downloadNessusXML(\'' + item.internalIdString + '\')">Download</a> | <a title="Remove the Nessus Scan file" href="javascript:deleteSystemPatchScanFile(\'' + item.internalIdString + '\')">Remove</a>';

				} else {
					nessusHTML += " Yes";
				}
				$("#divSystemNessusFile").html(nessusHTML);
			}
			else { 
				if (canUpload()) {
					var strNessus = '<b>Nessus Scan:</b> <a href="#custom-modal"  id="btnUpdateSystem" ' +
									' data-target="#customModal" data-toggle="modal"><span>(click to upload)</span></a>';
					$("#divSystemNessusFile").html(strNessus);
				} 
				else 
				$("#divSystemNessusFile").html("<b>Patch Scan:</b> N/A");
			}
			if (canDownload()) {
				var testplanHTML = '<button style="margin: 2px; width: 100%; text-align: left;" type="button" id="btnGenerateTestPlanSummary" onclick="exportTestPlan(getParameterByName(\'id\'), false);" ';
				testplanHTML += ' title="Generate the Test Plan Summary in MS Excel" '
				testplanHTML += 'class="btn btn-success btn-sm"><span class="btn-label"><i class="fa fa-clipboard"></i></span> Generate Test Plan</button>';
				$("#divSystemTestPlan").html(testplanHTML);
				var poamHTML = '<button style="margin: 2px; width: 100%; text-align: left;" type="button" id="btnGeneratePOAM" onclick="exportPOAM(getParameterByName(\'id\'), false);" ';
				poamHTML += ' title="Generate the POAM in MS Excel" '
				poamHTML += 'class="btn btn-success btn-sm"><span class="btn-label"><i class="fa fa-calendar"></i></span> Generate POAM</button>';
				$("#divSystemPOAM").html(poamHTML);
			}
			$("#divSystemCreated").html("<b>Created:</b> " + moment(item.created).format('MM/DD/YYYY hh:mm A'));
			if (item.updatedOn) 
				$("#divSystemUpdated").html("<b>Last Updated:</b> " + moment(item.updatedOn).format('MM/DD/YYYY hh:mm A'));
			else
				$("#divSystemUpdated").html("<b>Last Updated:</b> N/A");
			if (item.lastComplianceCheck) 
				$("#divSystemLastCompliance").html("<b>Last Compliance Check:</b> " + moment(item.lastComplianceCheck).format('MM/DD/YYYY hh:mm A'));
			else 
				$("#divSystemLastCompliance").html("<b>Last Compliance Check:</b> N/A");
1		}
	}
	else {
		$.unblockUI();
		throw new Error(response.status)
	}
}

function resetAddSystemForm() {
	$('#frmNessusFile').trigger("filer.reset");
	$('#frmSystemTitle').val('');
	$('#frmSystemDescription').val('');
}

function resetEditSystemForm() {
	$('#frmNessusFile').trigger("filer.reset");
}

function addSystem() {
	if (!$("#frmSystemTitle").val() || !$("#frmSystemDescription").val()) {
		alert('Please enter a system package title and description');
		return false;
	}

	swal("Adding System Package...", {
		buttons: false,
		timer: 3000,
	});
	var formData = new FormData();
	formData.append("title",htmlEscape($("#frmSystemTitle").val()));
	formData.append("description",htmlEscape($("#frmSystemDescription").val()));
	formData.append('nessusFile',$('#frmNessusFile')[0].files[0]);
	$.ajax({
			url : saveAPI + "system/",
			data : formData,
			type : 'POST',
			beforeSend: function(request) {
			  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
			},
			processData: false,
			contentType: false,			
			success: function(data){
				swal("Your System Package was created successfully!", "Click OK to continue!", "success")
				.then((value) => {
					location.href = "checklists.html?id=" + data.internalIdString;
				});
			},
			error : function(data){
				swal("There was a Problem. Your System Package was not created successfully. Please verify all required fields are filled in.", "Click OK to continue!", "error");
			}
	});
	return false;
}

function updateSystem(systemGroupId){
	swal("Updating System...", {
		buttons: false,
		timer: 3000,
	});
	if (!systemGroupId) 
		systemGroupId = sessionStorage.getItem("currentSystem");

	var formData = new FormData();
	formData.append("title",htmlEscape($("#frmSystemTitle").val()));
	formData.append("description",htmlEscape($("#frmSystemDescription").val()));
	formData.append('nessusFile',$('#frmNessusFile')[0].files[0]);
	$.ajax({
			url : saveAPI + "system/" + systemGroupId,
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
					$('#customModal').modal('hide');
				});
			},
			error : function(data){
				swal("There was a Problem. Your System was not updated successfully. Please check with the Application Admin.", "Click OK to continue!", "error");
			}
	});
	return false;
}

async function getScoreForSystemChecklistListing(systemId) {
  var url = scoreAPI;
  try {
		let responseScore = await fetch(scoreAPI + "system/" + encodeURIComponent(systemId), {headers: {
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
				fontColor: '#000',
				fontFamily: '"Lucida Console", Monaco, monospace'
			  }
			}
		}
	});
}

async function downloadNessusXML(systemGroupId) {
	if (!systemGroupId)
		systemGroupId = sessionStorage.getItem("currentSystem");
	$.blockUI({ message: "Generating the Nessus file...please wait" , css: { padding: '15px'} }); 
	var url = readAPI + "system/" + encodeURIComponent(systemGroupId) + "/downloadnessus/";
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

async function getNessusFileSummaryData(systemGroupId) {
	if (!systemGroupId) 
		systemGroupId = sessionStorage.getItem("currentSystem");
	var url = readAPI;
	try {
		  let responsePatches = await fetch(readAPI + "system/" + encodeURIComponent(systemGroupId) + "/nessuspatchsummary/", {headers: {
			  'Authorization': 'Bearer ' + keycloak.token
		  }});
		  if (responsePatches.ok) {
			  var dataPatches = await responsePatches.json()
			  return dataPatches;
		  } else if (responsePatches.statusText == "Not Found") {
			  return null;
		  }
	  }
	  catch (error) {
		  console.error("returning an empty summary of patches");
		  return null;
	  }
}

async function exportNessusXML(systemGroupId, summaryView) {
	if (!systemGroupId)
		systemGroupId = sessionStorage.getItem("currentSystem");

	$.blockUI({ message: "Generating the Nessus Excel export...please wait" , css: { padding: '15px'} }); 
	var url = readAPI + "system/" + systemGroupId + "/exportnessus?summaryOnly=" + summaryView.toString();
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
		} else {
			alert("There was a problem exporting your report.")
			$.unblockUI();		
		}
	};
	request.send();
	$.unblockUI();
}

async function exportTestPlan(systemGroupId) {
	if (!systemGroupId)
		systemGroupId = sessionStorage.getItem("currentSystem");
	$.blockUI({ message: "Generating the System Test Plan Excel export...please wait" , css: { padding: '15px'} }); 
	var url = readAPI + "system/" + systemGroupId + "/testplanexport/";
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
		} else {
			alert("There was a problem exporting your report.")
			$.unblockUI();		
		}
	};
	request.send();
	$.unblockUI();
}

async function exportPOAM(systemGroupId) {
	if (!systemGroupId)
		systemGroupId = sessionStorage.getItem("currentSystem");
	$.blockUI({ message: "Generating the POA&amp;M Excel export...please wait" , css: { padding: '15px'} }); 
	var url = readAPI + "system/" + systemGroupId + "/poamexport/";
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

				downloadLink.download = $.trim($("#frmSystemTitle").val().replace(" ", "-")) + "-POAM-" + strDate + ".xlsx";
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);
			}
		} else {
			alert("There was a problem exporting your report.")
			$.unblockUI();		
		}
	};
	request.send();
	$.unblockUI();
}

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
function uploadFromChecklist() {
	location.href = "upload.html?id=" + sessionStorage.getItem("currentSystem");;
}

async function deleteSystem(id) {
	if (!id)
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
					url : saveAPI + "system/" + id,
					type : 'DELETE',
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success: function(data){
						swal("Your System Package was deleted successfully!", "Click OK to continue!", "success")
						.then((value) => {
							location.href = "systems.html";
						});
					},
					error : function(data){
						swal("There was a Problem. Your System Package was not deleted successfully! Please check with the Application Admin.", "Click OK to continue!", "error");
					}
			    });
			  
			} else {
			  swal("Canceled the System Deletion.");
			}
		});
	}
}
async function deleteSystemPatchScanFile(id) {
	if (!id)
		id = sessionStorage.getItem("currentSystem");
	if (id && id.length > 10) {
		swal({
			title: "Delete Your System Package Patch Scan File",
			text: "Are you sure you wish to delete this system package patch scan file?",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		  })
		  .then((willDelete) => {
			if (willDelete) {
				$.ajax({
					url : saveAPI + "system/" + id + "/patchscan",
					type : 'DELETE',
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success: function(data){
						swal("Your System Package patch scan was deleted successfully!", "Click OK to continue!", "success")
						.then((value) => {
							location.reload();
						});						
					},
					error : function(data){
						swal("There was a Problem. Your System Package patch scan file was not deleted successfully! Please check with the Application Admin.", "Click OK to continue!", "error");
					}
			    });
			  
			} else {
			  swal("Canceled the System Package patch file deletion.");
			}
		});
	}
}
function getSystemScoreChartBySession(){
	var currentSystem = sessionStorage.getItem("currentSystem");
	if (currentSystem)
		getSystemScoreChart(currentSystem);
	else
		location.href = "systems.html";
}
async function getSystemScoreChart(id) {
	if (!id)
		id = sessionStorage.getItem("currentSystem");
	var data = await getScoreForSystemChecklistListing(id);
	if (data) 
		renderSystemPieChart("chartSystemScore", data);
}
async function deleteSystemChecklists(id){
	if (!id)
		id = sessionStorage.getItem("currentSystem");
	var formData = new FormData();
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
					url : saveAPI + "system/" + id + "/artifacts",
					type : 'DELETE',
					data: formData,
					processData: false,
					contentType: false,
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success: function(data){
						swal("Your System Package Checklists were deleted successfully!", "Note: for larger lists this may take a few moments. Click OK to continue!", "success")
						.then((value) => {
							location.reload();
						});
					},
					error : function(data){
						swal("There was a Problem. Your System Package Checklists were not deleted successfully! Please check with the Application Admin.", "Click OK to continue!", "error");
					}
			    });
			  
			} else {
			  swal("Canceled the System Checklist Deletion.");
			}
		});
	}
}
async function deleteAllSystemChecklists(id){
	if (!id)
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
					url : saveAPI + "system/" + id + "/artifacts",
					type : 'DELETE',
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success: function(data){
						swal("Your System Package Checklists were deleted successfully!", "Note: for larger lists this may take a few moments. Click OK to continue!", "success")
						.then((value) => {
							location.reload();
						});
					},
					error : function(data){
						swal("There was a Problem. Your System Package Checklists were not deleted successfully! Please check with the Application Admin.", "Click OK to continue!", "error");
					}
			    });
			  
			} else {
			  swal("Canceled the System Checklist Deletion.");
			}
		});
	}
}

async function downloadAllSystemChecklists(id) {
	var systemFilter = '';
	if ($("#txtSystemName").val()){
		systemFilter = $("#txtSystemName").val();
	}
	$.blockUI({ message: "Generating the System Checklist ZIP...please wait", css: { padding: '15px'} }); 
	var url = readAPI;
	if (getParameterByName('id')) 
		url += "system/download/" + encodeURIComponent(getParameterByName('id'));
	else 
		url += "system/download/" + encodeURIComponent(sessionStorage.getItem("currentSystem"));
	url += "/?naf=" + $("#chkVulnNaF").is(':checked');
	url += "&open=" + $("#chkVulnOpen").is(':checked');
	url += "&na="   + $("#chkVulnNA").is(':checked');
	url += "&nr="   + $("#chkVulnNR").is(':checked');
	url += "&cat1=" + $("#chkVulnCAT1").is(':checked');
	url += "&cat2=" + $("#chkVulnCAT2").is(':checked');
	url += "&cat3=" + $("#chkVulnCAT3").is(':checked');

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
				downloadLink.download = $.trim($("#txtSystemName").val()) + "-checklists.zip";
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);
			}
		}
	};
	request.send();
	$.unblockUI();
}
async function getChecklistsBySystem() {
	var system = $("#checklistSystemFilter").val();
	await getChecklists(system);
}
function getChecklistListingBySession(){
	var currentChecklist = sessionStorage.getItem("currentSystem");
	if (currentChecklist)
		getChecklists(currentChecklist);
	else
		location.href = "systems.html";
}
function getChecklistsByFilter() {
	setSystemChecklistFilter();
	if (getParameterByName('rtn')){
		getChecklistListingBySession();
	}
	else {
		getChecklists(getParameterByName('id'));
	}
}
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
async function getChecklists(system) {
	$.blockUI({ message: "Updating the checklist listing..." , css: { padding: '15px'} }); 
	sessionStorage.setItem("currentSystem", system);

	var url = readAPI + "systems/" + encodeURIComponent(system);
	url += "/?naf=" + $("#chkVulnNaF").is(':checked');
	url += "&open=" + $("#chkVulnOpen").is(':checked');
	url += "&na="   + $("#chkVulnNA").is(':checked');
	url += "&nr="   + $("#chkVulnNR").is(':checked');
	url += "&cat1=" + $("#chkVulnCAT1").is(':checked');
	url += "&cat2=" + $("#chkVulnCAT2").is(':checked');
	url += "&cat3=" + $("#chkVulnCAT3").is(':checked');
	url += "&hostname=" + $("#chkVulnHostname").val();

	sessionStorage.removeItem("checklistSystems");
	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
		var data = await response.json()
		$("#divSystemListing").hide();
		$("#divChecklistListing").show();
		$("#btnListAllSystems").show();
		
		var table = $('#tblChecklistListing').DataTable();
		table.clear().draw();
		var checklistLink = "";
		var tags = "";
		if (data.length == 0) {
			$.unblockUI();			
			var alertText = 'There are no Checklists uploaded. Please Upload your first.';
			alertText += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
			alertText += '<span aria-hidden="true">&times;</span></button>';
			$("#divMessaging").html(alertText);
			$("#divMessaging").show();
		}
		else {
			$('#btnExportListToExcel').prop('disabled', false);
			$("#divMessaging").html('');
			$("#divMessaging").hide();
			for (const item of data) {
				if (!$("#txtListingTitle").text()) {
					$("#txtListingTitle").text(item.systemTitle);
					$("#txtSystemName").val(item.systemTitle);
				}

				checklistLink = '<a href="single-checklist.html?id=' + item.internalIdString + '" title="View the Checklist Details">'
				checklistLink += item.title
				checklistLink += '</a><br /><span class="small">last updated on '
				if (item.updatedOn) {
					checklistLink += moment(item.updatedOn).format('MM/DD/YYYY hh:mm A');
				}
				else {
					checklistLink += moment(item.created).format('MM/DD/YYYY hh:mm A');
				}
				checklistLink += "</span>";
				
				tags = "";
				if (item.tags) tags = item.tags.toString().replace(/\,/g, ", ");

				var score = await getScoreForChecklistListing(item.internalIdString);
				if (score) {
					table.row.add( { "title": checklistLink, "id": item.internalIdString, "tags": tags,
						"totalNaF": score.totalNotAFinding, "totalNA": score.totalNotApplicable, "totalOpen": score.totalOpen, "totalNR": score.totalNotReviewed,
						"totalNaFCat1": score.totalCat1NotAFinding, "totalNACat1": score.totalCat1NotApplicable, "totalOpenCat1": score.totalCat1Open, "totalNRCat1": score.totalCat1NotReviewed,
						"totalNaFCat2": score.totalCat2NotAFinding, "totalNACat2": score.totalCat2NotApplicable, "totalOpenCat2": score.totalCat2Open, "totalNRCat2": score.totalCat2NotReviewed,
						"totalNaFCat3": score.totalCat3NotAFinding, "totalNACat3": score.totalCat3NotApplicable, "totalOpenCat3": intOpenCat2 = score.totalCat3Open, "totalNRCat3": score.totalCat3NotReviewed
					}).draw();
				}
				else {
					table.row.add( { "title": checklistLink, "id": item.internalIdString, "tags": tags,
						"totalNaF": 0, "totalNA": 0, "totalOpen": 0, "totalNR": 0,
						"totalNaFCat1": 0, "totalNACat1": 0, "totalOpenCat1": 0, "totalNRCat1": 0,
						"totalNaFCat2": 0, "totalNACat2": 0, "totalOpenCat2": 0, "totalNRCat2": 0,
						"totalNaFCat3": 0, "totalNACat3": 0, "totalOpenCat3": 0, "totalNRCat3": 0
					}).draw();
				}
			}
		$.unblockUI();
		}
	}
	else {
		$.unblockUI();
		throw new Error(response.status)
	}
}

async function getScoreForChecklistListing(id, template) {
	var url = scoreAPI;
	if (template)
		url = templateAPI;
  try {
		let responseScore = await fetch(scoreAPI + "artifact/" + id, {headers: {
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

async function getChecklistSystemsForChecklistFilter() {
	var data = await getChecklistSystems();
	if (data) {
		$.each(data, function (index, value) {
			$('#checklistSystemFilter').append($('<option/>', { 
				value: value.internalIdString,
					text : value.title
			}));
		}); 
	}
}

function returnToChecklistListing() {
	location.href = "checklists.html?rtn=1";
}
function returnToTemplateListing() {
	location.href = "templates.html";
}
async function exportChecklistListingXLSX() {
	var systemFilter = '';
	if ($("#txtSystemName").val()){
		systemFilter = $("#txtSystemName").val();
	}
	$.blockUI({ message: "Generating the System Checklist Excel export...please wait", css: { padding: '15px'} }); 
	var url = readAPI;
	if (getParameterByName('id')) 
		url += "system/export/" + encodeURIComponent(getParameterByName('id'));
	else
		url += "system/export/" + encodeURIComponent(sessionStorage.getItem("currentSystem"));
	url += "/?naf=" + $("#chkVulnNaF").is(':checked');
	url += "&open=" + $("#chkVulnOpen").is(':checked');
	url += "&na="   + $("#chkVulnNA").is(':checked');
	url += "&nr="   + $("#chkVulnNR").is(':checked');
	url += "&cat1=" + $("#chkVulnCAT1").is(':checked');
	url += "&cat2=" + $("#chkVulnCAT2").is(':checked');
	url += "&cat3=" + $("#chkVulnCAT3").is(':checked');

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

async function getChecklistData(id, template) {
	var url = readAPI + "artifact";
	if (template)
		url = templateAPI;
	let response = await fetch(url + "/" + id, {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
	if (response.ok) {
		clearSessionData();
		var data = await response.json();
		var title = data.title;
		$("#checklistTitle").html('<i class="fa fa-table"></i> ' + title);
		var updatedDate = "Last Updated on ";
		if (data.updatedOn) {
			updatedDate += moment(data.updatedOn).format('MM/DD/YYYY hh:mm A');
		}
		else {
			updatedDate += moment(data.created).format('MM/DD/YYYY hh:mm A');
		}
		$("#checklistSystem").html("<b>System:</b> " + data.systemTitle);
		$("#checklistHost").html("<b>Host:</b> " + data.checklist.asset.hosT_NAME);
		$("#checklistFQDN").html("<b>FQDN:</b> " + data.checklist.asset.hosT_FQDN);
		$("#checklistMarking").html("<b>Marking:</b> " + data.checklist.asset.marking);
		$("#checklistHostIP").html("<b>Host IP:</b> " + data.checklist.asset.hosT_IP);
		$("#checklistHostMAC").html("<b>Host MAC:</b> " + data.checklist.asset.hosT_MAC);
		$("#checklistTechArea").html("<b>Tech Area:</b> " + data.checklist.asset.tecH_AREA);
		$("#checklistAssetType").html("<b>Asset Type:</b> " + data.checklist.asset.asseT_TYPE);
		$("#checklistRole").html("<b>Role:</b> " + data.checklist.asset.role);
		if (data.tags)
			$("#checklistTags").html("<b>Tags:</b> " + data.tags.toString().replace(/\,/g, ", "));
		else 
			$("#checklistTags").html("<b>Tags:</b> ");

		if (data.checklist.asset.weB_OR_DATABASE)
            $("#checklistWebOrDB").html("<b>Web/Application/Database:</b> " + data.checklist.asset.weB_OR_DATABASE);
        if (data.checklist.asset.weB_DB_SITE)
            $("#checklistWebOrDBSite").html("<b>Site:</b> " + data.checklist.asset.weB_DB_SITE);
        if (data.checklist.asset.weB_DB_INSTANCE)
            $("#checklistWebOrDBInstance").html("<b>Instance:</b> " + data.checklist.asset.weB_DB_INSTANCE);

		$("#divMessaging").html("");
		if (!template)
			$("#checklistSTIGTitle").html("<b>Title:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[7].siD_DATA);
		else 
			$("#checklistSTIGTitle").html("<b>Title:</b> " + data.title + " (" + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[7].siD_DATA + ")");
		$("#checklistSTIGReleaseInfo").html("<b>Release:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[6].siD_DATA.replace("Release: ",""));
		$("#checklistSTIGVersionInfo").html("<b>Version:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[0].siD_DATA);
		if (template && data.description)
			$("#templateDescription").html("<b>Description:</b> " + data.description);

		$("#chartSeverityUpdated").text(updatedDate);
		$("#chartCategoryUpdated").html(updatedDate);
		$("#barChartUpdated").html(updatedDate);
		$("#checklistLastUpdated").html(updatedDate);

		if (template) getScoreForTemplateListing(data.rawChecklist);
		await getChecklistSystemsForChecklist();
		$("#frmChecklistSystem").val(data.systemGroupId);
		$("#frmChecklistTitle").text(data.title);
		$("#frmChecklistHost").val(data.checklist.asset.hosT_NAME);
		$("#frmChecklistFQDN").val(data.checklist.asset.hosT_FQDN);
		$("#frmChecklistTechArea").val(data.checklist.asset.tecH_AREA);
		$("#frmChecklistAssetType").val(data.checklist.asset.asseT_TYPE);
		$("#frmChecklistRole").val(data.checklist.asset.role);
		$("#frmChecklistMarking").val(data.checklist.asset.marking);
		$("#frmChecklistHostIP").val(data.checklist.asset.hosT_IP);
		$("#frmChecklistHostMAC").val(data.checklist.asset.hosT_MAC);
		if (data.checklist.asset.weB_OR_DATABASE && data.checklist.asset.weB_OR_DATABASE == "true")
			$("#frmChecklistWebOrDB").prop("checked", data.checklist.asset.weB_OR_DATABASE);
		$("#frmChecklistWebOrDBSite").val(data.checklist.asset.weB_DB_SITE);
		$("#frmChecklistWebOrDBInstance").val(data.checklist.asset.weB_DB_INSTANCE);
		
		$("#frmChecklistTags").empty();
		if (data.tags && data.tags.length > 0) {
		  for(const tag of data.tags){
			$("#frmChecklistTags").append($('<option/>', { value: tag, text : tag}));
			$("#frmChecklistTags option[value='" + tag + "']").attr('selected', 'selected');
		  }
		}

		var vulnListing = "";
		var vulnStatus = "[";
		var vulnFilter = [];
		var controlFilter = getParameterByName("ctrl");
		if (controlFilter) {
			vulnFilter = await getVulnerabilitiesByControl(id, controlFilter);
		}
		if (vulnFilter && vulnFilter.length == 0){
			$("#divVulnFilter").show();
			$("#rowControlInformation").hide();
		}
		else {
			$("#divVulnFilter").hide();
			var controlInfo = await getControlInformation(controlFilter);
			if (controlInfo) { 
				$("#checklistControlTitle").html(controlInfo.family + ": " + controlInfo.number + " - " + controlInfo.title);
				$("#checklistControlGuidance").html(controlInfo.supplementalGuidance);
				$("#rowControlInformation").show();
			}
		}
		for (const vuln of data.checklist.stigs.iSTIG.vuln) {
			sessionStorage.setItem(vuln.stiG_DATA[0].attributE_DATA, JSON.stringify(vuln));
			if (vulnFilter.length == 0 || (jQuery.inArray(vuln.stiG_DATA[0].attributE_DATA, vulnFilter) > -1)) {
				vulnListing += '<button id="btnVulnerability-'+ vuln.stiG_DATA[0].attributE_DATA + '" type="button" class="btn btn-sm ';
				if (vuln.severitY_OVERRIDE)
					vulnListing += getVulnerabilityStatusClassName(vuln.status, vuln.severitY_OVERRIDE);
				else 
					vulnListing += getVulnerabilityStatusClassName(vuln.status, vuln.stiG_DATA[1].attributE_DATA);
				vulnListing += '" title="' + vuln.stiG_DATA[5].attributE_DATA + '" ';
				vulnListing += ' onclick="viewVulnDetails(\'' + vuln.stiG_DATA[0].attributE_DATA + '\'); return false;">'
				vulnListing += vuln.stiG_DATA[0].attributE_DATA + '</button><br />';
			}
			vulnStatus += '{"vulnId" : "' + vuln.stiG_DATA[0].attributE_DATA +  '", "status" : "' + vuln.status + '"},';
		}
		vulnStatus = vulnStatus.slice(0,-1) + "]";
		sessionStorage.setItem("vulnStatus", vulnStatus);
		$("#checklistTree").html(vulnListing);
		sessionStorage.setItem("currentSystem", data.systemGroupId);
		
		if (!template) {
			var newRelease = await newChecklistAvailable(data.systemGroupId, data.internalIdString);
			if (newRelease != null) {
				var updatedChecklist = 'ATTN: There is an updated checklist release for your checklist: V';
				updatedChecklist += newRelease.version + ' ' + newRelease.stigRelease;
				if (canUpload()) {
					updatedChecklist += ' &nbsp; &nbsp; <button type="button" id="btnUpgradeChecklist" title="Upgrade the checklist to the latest version and release" onclick="upgradeChecklist(getParameterByName(\'id\'), false);" ';
					updatedChecklist += ' class="btn btn-primary btn-sm"><span class="btn-label"><i class="fa fa-long-arrow-up"></i></span> Upgrade</button>';
				}
				$("#divMessaging").html(updatedChecklist);
				$("#divMessaging").show();
			} else {
				$("#divMessaging").html("");
				$("#divMessaging").hide();
			}
		} else {
			$("#divMessaging").html("");
			$("#divMessaging").hide();
		}
	} else {
		$("#txtBadChecklistId").text(id);
		$("#divBadChecklistId").show();
	}
}

function openChecklistMetadata() {
	$('#editChecklistMetadata').modal({ show: true, focus : true, backdrop: 'static' });
	$('#frmChecklistTags').select2({ 
									tags: true,
									allowClear: true,
									selectOnClose: true,
									placeholder: " Add 1 or more tags",
									tokenSeparators: [',', ' '],
									minimumInputLength: 3
								  });
  }

async function newChecklistAvailable(systemGroupId, artifactId) {
	var url = templateAPI + "checklistupdate/system/" + systemGroupId + "/artifact/" + artifactId;
	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	var data;
	if (response.ok) {
		data = await response.json();
		return data;
	} else {
		return null;
	}
}
function setVulnerabilityFilter(status, severity) {
	$('#chkVulnNaF').prop('checked', false);
	$('#chkVulnOpen').prop('checked', false);
	$('#chkVulnNA').prop('checked', false);
	$('#chkVulnNR').prop('checked', false);
	$('#chkVulnCAT1').prop('checked', false);
	$('#chkVulnCAT2').prop('checked', false);
	$('#chkVulnCAT3').prop('checked', false);
	if (status == "open") 
		$('#chkVulnOpen').prop('checked', true);
	else if (status == "naf") 
		$('#chkVulnNaF').prop('checked', true);
	else if (status == "nr") 
		$('#chkVulnNR').prop('checked', true);
	else if (status == "na") 
		$('#chkVulnNA').prop('checked', true);

	if (severity == "cat1" || severity == "all") 
		$('#chkVulnCAT1').prop('checked', true);
	if (severity == "cat2" || severity == "all") 
		$('#chkVulnCAT2').prop('checked', true);
	if (severity == "cat3" || severity == "all") 
		$('#chkVulnCAT3').prop('checked', true);

	updateVulnerabilityListingByFilter();

	var elmnt = document.getElementById("divVulnerabilities");
	if (elmnt) 
		elmnt.scrollIntoView();
}

function updateVulnerabilityListingByFilter() {
	var status = JSON.parse(sessionStorage.getItem("vulnStatus"));
	if (status) {
		clearVulnDetails();
		var vulnListing = "";
		var vulnRecord = "";
		var severity = "";
		for (const vuln of status) {
			if (showVulnId(vuln)) {
				var vulnRecord = JSON.parse(sessionStorage.getItem(vuln.vulnId));
				if (vulnRecord) {
					if (vulnRecord.severitY_OVERRIDE) {
						severity = vulnRecord.severitY_OVERRIDE;
					} else {
						severity = vulnRecord.stiG_DATA[1].attributE_DATA;
					}
				} else {
					severity = "high";
				}
				vulnListing += '<button id="btnVulnerability-'+ vuln.vulnId + '" ';
				vulnListing += ' type="button" class="btn btn-sm ';
				vulnListing += getVulnerabilityStatusClassName(vuln.status, severity);
				vulnListing += '" title="' + vuln.vulnId + '" ';
				vulnListing += ' onclick="viewVulnDetails(\'' + vuln.vulnId + '\'); return false;">'
				vulnListing += vuln.vulnId + '</button><br />';
			}
		}
		$("#checklistTree").html(vulnListing);
		vulnListing = "";
		vulnRecord = "";
		severity = "";
	}
}
function showVulnId(vuln){
	var bOpen = $('#chkVulnOpen').prop('checked');
	var bNaF  = $('#chkVulnNaF').prop('checked');
	var bNA   = $('#chkVulnNA').prop('checked');
	var bNR   = $('#chkVulnNR').prop('checked');
	var bCat1  = $('#chkVulnCAT1').prop('checked');
	var bCat2  = $('#chkVulnCAT2').prop('checked');
	var bCat3  = $('#chkVulnCAT3').prop('checked');
	var status = vuln.status.toLowerCase();
	var severity = "high";
	var vulnRecord = JSON.parse(sessionStorage.getItem(vuln.vulnId));
	if (vulnRecord)	
		severity = vulnRecord.stiG_DATA[1].attributE_DATA.toLowerCase();
	var value = false;

	if (status == 'not_reviewed' && bNR)
		value = true;
	else if (status == 'open' && bOpen)
		value = true;
    else if (status == 'not_applicable' && bNA)
		value = true;
	else if (status == 'notafinding' && bNaF)
		value = true;

	if (value) {
		if (severity == 'high' && bCat1)
			value = true;
		else if (severity == 'medium' && bCat2)
			value = true;
		else if (severity == 'low' && bCat3)
			value = true;
		else
			value = false;
	}

	return value;
}
function getVulnerabilityStatusClassName (status, severity) {
	if (status.toLowerCase() == 'not_reviewed' || status.toLowerCase() == 'not reviewed')
		return "vulnNotReviewed";
	else if (status.toLowerCase() == 'open') {
		if (severity.toLowerCase() == "high")
			return "vulnOpenCAT1";
		else if (severity.toLowerCase() == "medium")
			return "vulnOpenCAT2";
		else if (severity.toLowerCase() == "low")
			return "vulnOpenCAT3";
	}
	else if (status.toLowerCase() == 'not_applicable' || status.toLowerCase() == 'not applicable')
		return "vulnNotApplicable";
	else
		return "vulnNotAFinding";
}
function getPatchVulnerabilityClassName (severity) {
		if (severity >= 3)
			return "vulnOpenCAT1";
		else if (severity == 2)
			return "vulnOpenCAT2";
		else if (severity == 1)
			return "vulnOpenCAT3";
		else 
			return "";
}

async function viewVulnDetails(vulnId) {
	var data = JSON.parse(sessionStorage.getItem(vulnId));
	if (data) {
		$("#divVulnerabilityForm").show();
		$("#vulnId").html("<b>VULN ID:</b>&nbsp;" + vulnId);
		$("#frmVulnID").val(vulnId);
		$("#vulnStigId").html("<b>STIG ID:</b>&nbsp;" + data.stiG_DATA[4].attributE_DATA);
		$("#vulnRuleId").html("<b>Rule ID:</b>&nbsp;" + data.stiG_DATA[3].attributE_DATA);
		$("#vulnRuleName").html("<b>Rule Name:</b>&nbsp;" + data.stiG_DATA[2].attributE_DATA);
		$("#vulnRuleTitle").html("<b>Rule Title:</b>&nbsp;" + data.stiG_DATA[5].attributE_DATA);
		$("#frmVulnStatus").val(data.status);
		$("#vulnClassification").html("<b>Classification:</b>&nbsp;" + (data.stiG_DATA[21].attributE_DATA).replace(/\n/g, "<br />"));
		$("#vulnSeverity").html("<b>Severity:</b>&nbsp;" + (data.stiG_DATA[1].attributE_DATA).replace(/\n/g, "<br />"));
		$("#vulnDiscussion").html("<b>Discussion:</b>&nbsp;" + htmlEscape(data.stiG_DATA[6].attributE_DATA).replace(/\n/g, "<br />"));
		$("#vulnCheckText").html("<b>Check Content:</b>&nbsp;" + htmlEscape(data.stiG_DATA[8].attributE_DATA).replace(/\n/g, "<br />"));
		$("#vulnFixText").html("<b>Fix Text:</b>&nbsp;" + htmlEscape(data.stiG_DATA[9].attributE_DATA).replace(/\n/g, "<br />"));
		$("#frmVulnDetails").val(data.findinG_DETAILS);
		$("#frmVulnComments").val(data.comments);
		if (data.stiG_DATA[18].attributE_DATA) {
			$("#vulnSeverityOverrideGuidance").html("<b>Severity Override Guidance:</b>&nbsp;" + (data.stiG_DATA[18].attributE_DATA).replace(/\n/g, "<br />"));
		}
		if (data.severitY_OVERRIDE && data.severitY_OVERRIDE.length > 0) {
			$("#frmVulnSecurityOverride").val(data.severitY_OVERRIDE);
		} else {
			$("#frmVulnSecurityOverride").val("");
		}
		$("#frmVulnSecurityJustification").val(data.severitY_JUSTIFICATION);

		var ccilist = '';
		var severityOverride = '';
		var cciInfo;
		for(i = 24; i < data.stiG_DATA.length; i++) { 
			if (data.stiG_DATA[i].vulN_ATTRIBUTE == "CCI_REF"){
				ccilist += "<b>" + data.stiG_DATA[i].attributE_DATA + "</b>: ";
				cciInfo = await getCCIItemRecord(data.stiG_DATA[i].attributE_DATA );
				if (cciInfo != null) {
					ccilist += cciInfo.definition + "<br /><ul>";
					for(const reference of cciInfo.references){
						ccilist += "<li>" + reference.title + " :: " + reference.index + "</li>";
					}
					ccilist += "</ul>";
				}
			}
		}
		ccilist = ccilist.substring(0, ccilist.length -2);
		$("#vulnCCIId").html(ccilist);
		if (canUpload()) {
			$("#btnSaveVulnerability").show();
			$("#frmVulnIDTitle").text(vulnId);
		}
		else {
			$("#btnSaveVulnerability").hide();
		}
	}
}

async function getCCIItemRecord(cciid) {
	var url = complianceAPI;
  	try {
		let responseCCI = await fetch(complianceAPI + "cci/" + cciid, {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
		if (responseCCI.ok) {
			var cciItem = await responseCCI.json()
			return cciItem;
		} else 
			return null;
	}
	catch (error) {
		console.error("returning an empty CCI Item");
		return null;
	}
}
function clearVulnDetails() {
	$("#vulnId").html("Please select a Vulnerability ID to view its details.");
	$("#vulnStigId").html("");
	$("#vulnRuleId").html("");
	$("#vulnRuleName").html("");
	$("#vulnRuleTitle").html("");
	$("#vulnCCIId").html("");
	$("#vulnClassification").html("");
	$("#vulnSeverity").html("");
	$("#vulnDiscussion").html("");
	$("#vulnCheckText").html("");
	$("#vulnFixText").html("");
	
	$("#frmVulnDetails").val("");
	$("#frmVulnComments").val("");
	$("#frmVulnSecurityOverride").val("");
	$("#frmVulnSecurityJustification").val("");
	$("#frmBulkUpdateCheckbox").attr('checked',false);
}

function updateSingleChecklist(id) {
	var url = saveAPI + "artifact/" + id;
	var formData = new FormData();
	formData.append("systemGroupId",$("#frmChecklistSystem").val());
	formData.append("hostname",htmlEscape($("#frmChecklistHost").val()));
	formData.append("domainname",htmlEscape($("#frmChecklistFQDN").val()));
	formData.append("techarea",$("#frmChecklistTechArea").val());
	formData.append("assettype",$("#frmChecklistAssetType").val());
	formData.append("machinerole",$("#frmChecklistRole").val());
	var tagListing = "";
	$("#frmChecklistTags option").each(function() {
	  if (this.selected)
		tagListing += this.value + "|";
	});
	formData.append("tagList", htmlEscape(tagListing));
	formData.append("hostip",htmlEscape($("#frmChecklistHostIP").val()));
	formData.append("hostmac",htmlEscape($("#frmChecklistHostMAC").val()));
	formData.append("webordatabase",$("#frmChecklistWebOrDB").prop('checked'));
	formData.append("webdatabasesite",htmlEscape($("#frmChecklistWebOrDBSite").val()));
	formData.append("webdatabaseinstance",htmlEscape($("#frmChecklistWebOrDBInstance").val()));
	formData.append("marking",htmlEscape($("#frmChecklistMarking").val()));

	$.ajax({
		url : url,
		data : formData,
		type : 'PUT',
		beforeSend: function(request) {
			request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
		},
		processData: false,
		contentType: false,
		success : function(data) {
            $('#editChecklistMetadata').modal('hide');
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

function updateSingleChecklistVulnerability(artifactid) {
	var vulnid = $("#frmVulnID").val();
	if (!vulnid || vulnid.length < 4) {
		swal("Your Vulnerability was not updated. Please refresh the page and try again.", "Click OK to continue!", "success")
		return false;
	}
	var url = saveAPI + "artifact/" + artifactid + "/vulnid/" + vulnid;
	var formData = new FormData();
	formData.append("systemGroupId",$("#frmChecklistSystem").val());
	formData.append("vulnid",vulnid);
	formData.append("status",$("#frmVulnStatus").val());
	formData.append("comments",htmlEscape($("#frmVulnComments").val()));
	formData.append("details",htmlEscape($("#frmVulnDetails").val()));
	formData.append("severityoverride",$("#frmVulnSecurityOverride").val());
	formData.append("justification",htmlEscape($("#frmVulnSecurityJustification").val()));
	formData.append("bulkUpdate",$("#frmBulkUpdateCheckbox").prop("checked"));

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
				var vulnItem = JSON.parse(sessionStorage.getItem(vulnid));
				if (vulnItem){
					if (vulnItem.severitY_OVERRIDE && vulnItem.severitY_OVERRIDE.length > 0) {
						$("#btnVulnerability-"+ vulnid).removeClass(getVulnerabilityStatusClassName(vulnItem.status, vulnItem.severitY_OVERRIDE));
					} else {
						$("#btnVulnerability-"+ vulnid).removeClass(getVulnerabilityStatusClassName(vulnItem.status, vulnItem.stiG_DATA[1].attributE_DATA));
					}
					vulnItem.status = $("#frmVulnStatus").val();
					vulnItem.findinG_DETAILS = $("#frmVulnDetails").val();
					vulnItem.comments = $("#frmVulnComments").val();
					vulnItem.severitY_OVERRIDE = $("#frmVulnSecurityOverride").val();
					vulnItem.severitY_JUSTIFICATION = $("#frmVulnSecurityJustification").val();
					sessionStorage.setItem(vulnid, JSON.stringify(vulnItem));
				}
				if (vulnItem.severitY_OVERRIDE && vulnItem.severitY_OVERRIDE.length > 0) {
					$("#btnVulnerability-"+ vulnid).addClass(getVulnerabilityStatusClassName(vulnItem.status, vulnItem.severitY_OVERRIDE));
				} else {
					$("#btnVulnerability-"+ vulnid).addClass(getVulnerabilityStatusClassName(vulnItem.status, vulnItem.stiG_DATA[1].attributE_DATA));
				}

				var vulnStatus = JSON.parse(sessionStorage.getItem("vulnStatus"));
				vulnStatus.find(function(e){return e.vulnId == vulnid}).status = vulnItem.status;
				sessionStorage.setItem("vulnStatus", JSON.stringify(vulnStatus));
				getChecklistScore(artifactid);
				$('#vulnerabilityModal').modal('hide');
			});
		},
		error: function() {
			swal("Your Vulnerability was not updated. Please check all values and try again.", "Click OK to continue!", "error");
		}
	});
}

async function getChecklistSystemsForChecklist() {
	var data = await getChecklistSystems();
	if (data) {
		$.each(data, function (index, value) {
			$('#frmChecklistSystem').append($('<option/>', { 
					value: value.internalIdString,
					text : value.title
			}));
		}); 
	}
}
async function getChecklistScore(id) {
	var data = await getScoreForChecklistListing(id);
	displayChecklistScores(data);
}

async function displayChecklistScores(data) {
	if (data) {
		$("#checklistNotAFindingCount").html(data.totalNotAFinding.toString());
		$("#checklistNotApplicableCount").html(data.totalNotApplicable.toString());
		$("#checklistOpenCount").html(data.totalOpen.toString());
		$("#checklistNotReviewedCount").html(data.totalNotReviewed.toString());
		$("#cat1NotAFindingCount").html(data.totalCat1NotAFinding.toString());
		$("#cat1NotApplicableCount").html(data.totalCat1NotApplicable.toString());
		$("#cat1OpenCount").html(data.totalCat1Open.toString());
		$("#cat1NotReviewedCount").html(data.totalCat1NotReviewed.toString());
		$("#cat2NotAFindingCount").html(data.totalCat2NotAFinding.toString());
		$("#cat2NotApplicableCount").html(data.totalCat2NotApplicable.toString());
		$("#cat2OpenCount").html(data.totalCat2Open.toString());
		$("#cat2NotReviewedCount").html(data.totalCat2NotReviewed.toString());
		$("#cat3NotAFindingCount").html(data.totalCat3NotAFinding.toString());
		$("#cat3NotApplicableCount").html(data.totalCat3NotApplicable.toString());
		$("#cat3OpenCount").html(data.totalCat3Open.toString());
		$("#cat3NotReviewedCount").html(data.totalCat3NotReviewed.toString());
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
				fontColor: '#000',
				fontFamily: '"Lucida Console", Monaco, monospace'
			  }
			}
		}	 
  });
}
function downloadChart(element) {
	var img = document.getElementById(element).toDataURL("image/jpg");
	var element = document.createElement('a');
	element.setAttribute('href', img);
	element.setAttribute('download', "OpenRMFChart.jpg");
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}
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
						fontColor: '#000',
						fontFamily: '"Lucida Console", Monaco, monospace'
					}
				}
			}
  });
}
async function makeBarChartBreakdown(data) {  
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

async function downloadChecklistFile(id, template){
	var url = readAPI;
	if (template)
		url = templateAPI;

	let response = await fetch(url + "download/" + id, {headers: {
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

async function exportChecklistXLSX(id) {
	var url = readAPI + "export/" + id + "/";

    if (getParameterByName('ctrl')) {
		url += "?ctrl=" + getParameterByName('ctrl');
	}
	else {
		var bOpen = $('#chkVulnOpen').prop('checked');
		var bNaF  = $('#chkVulnNaF').prop('checked');
		var bNA   = $('#chkVulnNA').prop('checked');
		var bNR   = $('#chkVulnNR').prop('checked');
		url += "?nf=" + bNaF.toString() + "&open=" + bOpen.toString() + "&na=" + bNA.toString() + "&nr=" + bNR.toString();
	}

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
					url : saveAPI + "artifact/" + id,
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

function upgradeChecklist(id) {
	var currentSystem = sessionStorage.getItem("currentSystem");
	if (currentSystem == null) 
		location.reload();

		swal({
			title: "Upgrade this Checklist?",
			text: "Are you sure you wish to upgrade this checklist to the latest release?",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		  })
		  .then((willUpgrade) => {
			if (willUpgrade) {
				$.ajax({
					url : saveAPI + "upgradechecklist/system/" + currentSystem + "/artifact/" + id,
					type : 'POST',
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success: function(data){
						swal("Your Checklist was upgraded successfully!", "Click OK to continue!", "success")
						.then((value) => {
							$("#divMessaging").html("");
							$("#divMessaging").hide();
							location.reload(true);
						});
					},
					error : function(data){
						swal("There was a Problem. Your checklist was not updated successfully. Please check with the Application Admin.", "Click OK to continue!", "error");
					}
			    });
			  
			} else {
			  swal("Canceled the Upgrade.");
			}
		});
}

async function getChecklistSystems() {
	let response = await fetch(readAPI + "systems", {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
			var data = await response.json();
			sessionStorage.setItem("checklistSystems", JSON.stringify(data));
			return data;
	}
}

async function getChecklistSystemsForUpload(id) {
	sessionStorage.removeItem("checklistSystems");
	$('#checklistSystem').children().remove().end();
	var data = await getChecklistSystems();
	if (data) {
		if (data.length > 0) {
			$.each(data, function (index, value) {
				if (id && value.internalIdString == id)
					optionString = '<option selected value="' + value.internalIdString + '">' + value.title + '</option>';
				else 
					optionString = '<option value="' + value.internalIdString + '">' + value.title + '</option>';
				$('#checklistSystem').append(optionString); 
			}); 
		} else {
			$('#divNewChecklistSystem').hide(); 
			$('#divNewChecklistSystemText').show(); 
		}
	}
}

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
	for (i = 0; i < $("input[id=checklistFile]").length; i++) {
		if ($("input[id=checklistFile]")[i].files.length > 0) {
			for (j = 0; j < $("input[id=checklistFile]")[i].files.length; j++) {
				formData.append('checklistFiles',$("input[id=checklistFile]")[i].files[j]);
			}
		}
	}
	if ($("#checklistSystemText").is(':visible')){
		if ($("#checklistSystemText").val().trim().length ==0) {
			swal("Error on the Upload", "Please fill in the new System Name field.", "error");
			return false;
		}
		formData.append("system",$("#checklistSystemText").val().trim());
	}
	else
		formData.append("systemGroupId",$("#checklistSystem").val());

	$.ajax({
			url : uploadAPI,
			data : formData,
			type : 'POST',
			processData: false,
			contentType: false,
			beforeSend: function(request) {
			  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
			},
			success : function(data) {
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
					var message = "There were " + data.failed + " failed checklists. Check that they have a valid Hostname and format. ( "; 
					$.each(data.failedUploads, function (index, value) {
						if (index > 0) message += "; ";
						message += value;
					});
					message += " ) Click OK to continue!";
					swal("You had " + data.successful + " Checklists uploaded successfully!", message, "error");
				}
				$('#checklistFile').trigger("filer.reset")
			},
			error: function(data) {
				swal("Error Uploading Checklist", "There was an error uploading some of your checklists. Please try again.", "error");
			}
	});
}

function uploadTemplate() {
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
				$("#frmTemplateUpload")[0].reset();
				$('#templateFile').trigger("filer.reset")
			},
			error: function() {
				swal("Error Uploading Template", "There was an error uploading the template. Please try again.", "error");
			}
	});
}

async function getChecklistTypeBreakdown(system) {
	var url = readAPI + "counttype";
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
async function getChecklistSystemsForReportFilter() {
	var data = await getChecklistSystems();
	if (data) {
		$.each(data, function (index, value) {
			$('#checklistSystemFilter').append($('<option/>', { 
					value: value.internalIdString,
					text : value.title 
			}));
		}); 
	}
}
async function getReportsBySystem() {
	await getChecklistTypeBreakdown($("#checklistSystemFilter").val());
}
async function getNessusPatchScanReport() {
	var systemGroupId = $("#checklistSystemFilter").val();
	if (!systemGroupId || systemGroupId.length == 0) {
		swal("Please choose a system package for the report.", "Click OK to continue!", "error");
		return;
	}
	$.blockUI({ message: "Generating the Nessus ACAS Patch Report...please wait" , css: { padding: '15px'} }); 
	var table = $('#tblReportNessus').DataTable();
	table.clear().draw();
	table.ajax.url(reportAPI + "system/" + systemGroupId + "/acaspatchdata/").load(finalizeLoadingTable);
}
async function getSystemTotalsByTypeReport() {
	var systemGroupId = $("#checklistSystemFilter").val();
	if (!systemGroupId || systemGroupId.length == 0)
	{
		swal("Please choose a system for the report.", "Click OK to continue!", "error");
		return;
	}
	$.blockUI({ message: "Generating the System Totals Chart...please wait" , css: { padding: '15px'} }); 
	var data = await getScoreForSystemChecklistListing(systemGroupId);
	if (data) 
		renderSystemReportPieChart("chartReportSystemTotalsBreakdown", data);

	$.unblockUI();
}
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
				fontColor: '#000',
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
	$('#checklistFilter').empty();

	var url = readAPI + "systems/" + encodeURIComponent(systemGroupId);
	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});

	if (response.ok) {
		var data = await response.json();
		if (data) {
			$.each(data, function (index, value) {
				$('#checklistFilter').append($('<option/>', { 
						value: value.internalIdString,
						text : value.title 
				}));
			}); 
		}
	}
}
async function getSystemChecklistReport() {
	var id = $("#checklistFilter").val();
	if (!id || id.length == 0)
	{
		swal("Please choose a checklist for the report.", "Click OK to continue!", "error");
		return;
	}

	$.blockUI({ message: "Generating the Checklist Report...please wait" , css: { padding: '15px'} }); 
	var url = readAPI + "artifact";
	let response = await fetch(url + "/" + id, {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
	if (response.ok) {
		clearSessionData();
		var data = await response.json();
		var updatedDate = "Last Updated on ";
		if (data.updatedOn) {
			updatedDate += moment(data.updatedOn).format('MM/DD/YYYY hh:mm A');
		}
		else {
			updatedDate += moment(data.created).format('MM/DD/YYYY hh:mm A');
		}

		var table = $('#tblReportSystemChecklist').DataTable();
		table.clear().draw();

		$("#checklistSystem").html("<b>System:</b> " + data.systemTitle);
		$("#checklistHost").html("<b>Host:</b> " + data.checklist.asset.hosT_NAME);
		$("#checklistFQDN").html("<b>FQDN:</b> " + data.checklist.asset.hosT_FQDN);
		$("#checklistTechArea").html("<b>Tech Area:</b> " + data.checklist.asset.tecH_AREA);
		$("#checklistAssetType").html("<b>Asset Type:</b> " + data.checklist.asset.asseT_TYPE);
		$("#checklistRole").html("<b>Role:</b> " + data.checklist.asset.role);
		if (data.tags)
			$("#checklistTags").html("<b>Tags:</b> " + data.tags.toString().replace(/\,/g, ", "));
		else 
			$("#checklistTags").html("<b>Tags:</b> ");
		if (data.checklist.asset.weB_OR_DATABASE)
			$("#checklistWebOrDB").html("<b>Web/Application/Database:</b> " + data.checklist.asset.weB_OR_DATABASE);
		if (data.checklist.asset.weB_DB_SITE)
			$("#checklistWebOrDBSite").html("<b>Site:</b> " + data.checklist.asset.weB_DB_SITE);
		if (data.checklist.asset.weB_DB_INSTANCE)
			$("#checklistWebOrDBInstance").html("<b>Instance:</b> " + data.checklist.asset.weB_DB_INSTANCE);

		$("#checklistSTIGTitle").html("<b>Title:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[7].siD_DATA);
		$("#checklistSTIGReleaseInfo").html("<b>Release:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[6].siD_DATA);
		$("#checklistSTIGVersionInfo").html("<b>Version:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[0].siD_DATA);
		
		var strStatus = "";
		var ccilist = "";
		var strSeverity = "";
		var strSeverityOverride = "";
		var strSeverityJustification = "";
		for (const item of data.checklist.stigs.iSTIG.vuln) {
			strStatus = getStatusName(item.status);
				
			if (item.severitY_OVERRIDE) {
				strSeverity = item.severitY_OVERRIDE;
				strSeverityOverride = strSeverity;
				if (item.severitY_JUSTIFICATION) 
					strSeverityJustification = item.severitY_JUSTIFICATION;
				else
					strSeverityJustification = "";
			}
			else {
				strSeverity = item.stiG_DATA[1].attributE_DATA;
				strSeverityOverride = "";
				strSeverityJustification = "";
			}
			
			ccilist = "";
			for(i = 24; i < item.stiG_DATA.length; i++) { 
				if (item.stiG_DATA[i].vulN_ATTRIBUTE == "CCI_REF")
					ccilist += item.stiG_DATA[i].attributE_DATA + ", ";
			}
			ccilist = ccilist.substring(0, ccilist.length -2);

			table.row.add( { "vulnid": item.stiG_DATA[0].attributE_DATA, "severity": strSeverity,
				"ruleid": item.stiG_DATA[3].attributE_DATA, "stigid": item.stiG_DATA[4].attributE_DATA, 
				"status": strStatus, "title": item.stiG_DATA[5].attributE_DATA, "cci": ccilist, 
				"discussion": item.stiG_DATA[6].attributE_DATA, "checkContent": item.stiG_DATA[8].attributE_DATA, 
				"fixText": item.stiG_DATA[9].attributE_DATA, "comments": item.comments, "findingDetails": item.findinG_DETAILS,
				"severityOverride": strSeverityOverride, "severityJustification": strSeverityJustification
			}).draw();
		}
		$.unblockUI();
	} else {
		$.unblockUI();
		swal("There was a problem generating your report. Please contact your Application Administrator.", "Click OK to continue!", "error");
	}
}
async function getControlsReport() {
	var pii = $('#checklistPrivacyFilter')[0].checked;
	$.blockUI({ message: "Generating the Controls Report...please wait" , css: { padding: '15px'} }); 
	var table = $('#tblReportControls').DataTable();
	table.clear().draw();
	table.ajax.url(controlAPI + "?pii=" + pii + "&impactlevel=" + $('#checklistImpactFilter').val()).load(finalizeLoadingTable);	
}
async function finalizeLoadingTable() {
	$.unblockUI();
}
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
	}

	$.blockUI({ message: "Generating the Host Vulnerability Report...please wait" , css: { padding: '15px'} }); 
	var url = reportAPI + "system/" + id + "/vulnid/" + vulnid;
	let response = await fetch(url, {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
	if (response.ok) {
		clearSessionData();
		var data = await response.json();
		var table = $('#tblReportVulnerability').DataTable();
		table.clear().draw();
		
		var strStatus = "";
		var ccilist = "";
		var strSeverity = "";
		var strSeverityOverride = "";
		var strSeverityJustification = "";
		for (const item of data) {
			strStatus = getStatusName(item.status);
			
			if (item.severityOverride) {
				strSeverity = item.severityOverride;
				strSeverityOverride = strSeverity;
				if (item.severityJustification) 
					strSeverityJustification = item.severityJustification;
				else
					strSeverityJustification = "";
			}
			else {
				strSeverity = item.severity;
				strSeverityOverride = "";
				strSeverityJustification = "";
			}
			ccilist = "";
			for(const cci of item.cciList) { 
				ccilist += cci + ", ";
			}
			if (ccilist.length > 0) ccilist = ccilist.substring(0, ccilist.length -2);

			table.row.add( { "vulnid": item.vulnid, "severity": strSeverity, "hostname": item.hostname,
				"ruleTitle": item.ruleTitle, "status": strStatus, "cci": ccilist, 
				"discussion": item.discussion, "checkContent": item.checkContent,
				"typeFullTitle": item.typeFullTitle, "release": item.checklistRelease, "version": item.checklistVersion,
				"fixText": item.fixText, "comments": item.comments, "details": item.details, "severityOverride": strSeverityOverride,
				"severityJustification": strSeverityJustification
			}).draw();
		}
		$.unblockUI();
	} else {
		$.unblockUI();
		swal("There was a problem generating your report. Please contact your Application Administrator.", "Click OK to continue!", "error");
	}
}
async function getVulnerabilityStatusSeverityReport() {
	var id = $("#checklistSystemFilter").val();
	if (!id || id.length == 0)
	{
		swal("Please choose a system package for the report.", "Click OK to continue!", "error");
		return;
	}

	var bCat1  = $('#chkVulnCAT1').prop('checked');
	var bCat2  = $('#chkVulnCAT2').prop('checked');
	var bCat3  = $('#chkVulnCAT3').prop('checked');
	if (!bCat1 && !bCat2 && !bCat3) {
		swal("Please choose at least one status for the report.", "Click OK to continue!", "error");
		return;
	}	
	var bOpen = $('#chkVulnOpen').prop('checked');
	var bNaF  = $('#chkVulnNaF').prop('checked');
	var bNA   = $('#chkVulnNA').prop('checked');
	var bNR   = $('#chkVulnNR').prop('checked');
	if (!bOpen && !bNaF && !bNA && !bNR) {
		swal("Please choose at least one severity for the report.", "Click OK to continue!", "error");
		return;
	}

	$.blockUI({ message: "Generating the Vulnerability Status and Severity Report...please wait" , css: { padding: '15px'} }); 
	var table = $('#tblReportVulnerabilityStatusSeverity').DataTable();
	table.clear().draw();
	table.ajax.url(reportAPI + "system/" + id + "/?naf=" +bNaF + "&open=" + bOpen+ "&na=" + bNA+ "&nr=" +bNR + "&cat1=" +bCat1 + "&cat2=" +bCat2 + "&cat3=" + bCat3).load(finalizeLoadingTable);
}
async function getVulnerabilityOverrideReport() {
	var id = $("#checklistSystemFilter").val();
	if (!id || id.length == 0)
	{
		swal("Please choose a system package for the report.", "Click OK to continue!", "error");
		return;
	}

	$.blockUI({ message: "Generating the Vulnerability Override Report...please wait" , css: { padding: '15px'} }); 
	var table = $('#tblReportVulnerabilityOverride').DataTable();
	table.clear().draw();
	table.ajax.url(reportAPI + "system/" + id + "/override/").load(finalizeLoadingTable);
}
async function getControlsListing(){
	let response = await fetch(controlAPI + "majorcontrols/", {headers: {
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
async function getChecklistActivity() {
	var id = $("#checklistSystemFilter").val();
	if (!id || id.length == 0)
	{
		swal("Please choose a system package for the report.", "Click OK to continue!", "error");
		return;
	}
	$.blockUI({ message: "Generating the Checklist Activity Report...please wait" , css: { padding: '15px'} }); 
	var table = $('#tblReportChecklistActivity').DataTable();
	table.clear().draw();
	table.ajax.url(readAPI + "systems/" + encodeURIComponent(id) + "/").load(finalizeLoadingTable);
}
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

	$.blockUI({ message: "Updating the Hosts for Control listing...this may take a minute" , css: { padding: '15px'} }); 
	var url = complianceAPI + "system/" + encodeURIComponent(id) + "/?pii=true&filter=high&majorcontrol=" + control;

	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
		var data = await response.json()
		if (data.result.length > 0) {
			var table = $('#tblReportControlHost').DataTable();
			table.clear().draw();
			var checklists = '';
			var currentStatus = "";
			var overallStatus = "";
			for (const item of data.result) {
				checklists = "";
				overallStatus = "";
				if (item.complianceRecords.length > 0) {
					for (const record of item.complianceRecords){
						checklists = '';
						currentStatus = getOverallCompliance(currentStatus, record.status);
						checklists += '<a href="/single-checklist.html?id=';
						checklists += record.artifactId + '&ctrl=' + item.control + '" title="View the Checklist Details" target="' + record.artifactId + '">'; 
						checklists += '<span class="' + getComplianceTextClassName(record.status) + '">' + record.title + '</span></a>';
						overallStatus = '<span class="' + getComplianceTextClassName(record.status) + '">' + getStatusName(record.status); + '</span></a>';
						table.row.add( [record.hostName, checklists, overallStatus] ).draw();
					}
				}
			}
		}
		else {
			swal("Error Generating Hosts for Control", "There are no checklists ready for this compliance report.", "error");
		}
	}
	else { 
		swal("Error Generating Hosts for Control", "There was a problem generating the compliance for that system. Make sure the checklists are valid.", "error");
	}
	$.unblockUI();
}
async function reloadNessusPatchData() {
	swal({
		title: "Update all Nessus Data",
		text: "Are you sure you wish to update all Nessus ACAS Patch Data across all Systems?",
		icon: "warning",
		buttons: true,
		dangerMode: true,
		})
		.then((willDelete) => {
		if (willDelete) {
			$.ajax({
				url : reportAPI + "reloaddata/?datatype=nessusacas",
				type : 'PUT',
				beforeSend: function(request) {
					request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
				},
				success: function(data){
					swal("Your Refresh of Nessus Patch Data was initiated. Please give time for the old data to be removed and new data generated.", "Click OK to continue!", "success");
				},
				error : function(data){
					swal("There was a Problem. Your Nessus ACAS Patch data was not refreshed successfully! Please check with the Application Admin.", "Click OK to continue!", "error");
				}
			});
			
		} else {
			swal("Canceled the Data Refresh.");
		}
	});
}
async function reloadVulnerabilityData() {
	swal({
		title: "Update all System Vulnerability Data",
		text: "Are you sure you wish to update all Vulnerability Data across all Systems?",
		icon: "warning",
		buttons: true,
		dangerMode: true,
		})
		.then((willDelete) => {
		if (willDelete) {
			$.ajax({
				url : reportAPI + "reloaddata/?datatype=vulnerability",
				type : 'PUT',
				beforeSend: function(request) {
					request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
				},
				success: function(data){
					swal("Your Refresh of Vulnerability Data was initiated. Please give time for the old data to be removed and new data generated.", "Click OK to continue!", "success");
				},
				error : function(data){
					swal("There was a Problem. Your Vulnerability data was not refreshed successfully! Please check with the Application Admin.", "Click OK to continue!", "error");
				}
			});
			
		} else {
			swal("Canceled the Data Refresh.");
		}
	});
}
async function getChecklistUpgrades () {
	var id = $("#checklistSystemFilter").val();
	if (!id || id.length == 0)
	{
		swal("Please choose a system package for the report.", "Click OK to continue!", "error");
		return;
	}

	$.blockUI({ message: "Generating the Checklist Upgrade Report...please wait" , css: { padding: '15px'} }); 
	var url = readAPI + "systems/" + encodeURIComponent(id) + "/";
	let response = await fetch(url, {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
	if (response.ok) {
		var data = await response.json();
		var table = $('#tblChecklistUpgrades').DataTable();
		table.clear().draw();
		var newRelease = {};
		var updatedChecklist = "";
		for (const item of data) {
			newRelease = await newChecklistAvailable(id, item.internalIdString);
            if (newRelease != null) {
				updatedChecklist = 'V' + newRelease.version + ' ' + newRelease.stigRelease;
				table.row.add( { "internalIdString": item.internalIdString, "title": item.title, "stigType": item.stigType, 
				"version": item.version, "stigRelease": item.stigRelease, "hostName": item.hostName, 
				"updatedChecklist": updatedChecklist
				}).draw();
			}
		}
		$.unblockUI();
	} else {
		$.unblockUI();
		swal("There was a problem generating your report. Please contact your Application Administrator.", "Click OK to continue!", "error");
	}
}
async function getAuditRecords() {
	$.blockUI({ message: "Generating the Audit Listing...please wait", css: { padding: '15px'} }); 
	var table = $('#tblAuditRecords').DataTable();
	table.clear().draw();
	table.ajax.url(auditAPI).load(finalizeLoadingTable);
}
async function getChecklistSystemsForComplianceFilter(id) {
	var data = await getChecklistSystems();
	if (data) {
		var optionString = '';
		$.each(data, function (index, value) {
			if (id && value.internalIdString == id)
				optionString = '<option selected value="' + value.internalIdString + '">' + value.title + '</option>';
			else 
				optionString = '<option value="' + value.internalIdString + '">' + value.title + '</option>';
			$('#checklistSystemFilter').append(optionString); 
		}); 
	}
}

async function getComplianceBySystem() {
	var system = $("#checklistSystemFilter").val();
	if (system && system.length > 0 && system != "All") {
		$.blockUI({ message: "Updating the compliance listing...this may take a minute" , css: { padding: '15px'} }); 
		var pii = $('#checklistPrivacyFilter')[0].checked;
		var url = complianceAPI + "system/" + encodeURIComponent(system) + "/?pii=" + pii + "&filter=" + $('#checklistImpactFilter').val();
		let response = await fetch(url, {headers: {
			'Authorization': 'Bearer ' + keycloak.token
		}});
		if (response.ok) {
			var data = await response.json()
			if (data.result.length > 0) {
				var table = $('#tblCompliance').DataTable();
				table.clear().draw();
				var checklists = '';
				var recordNum = 0;
				var currentFamily = "";
				var currentStatus = "";
				var complianceSummary = "";
				var overallStatus = "";
				var statusName = "";
				for (const item of data.result) {
					recordNum++;
					checklists = '';
					overallStatus = '';
					if (currentFamily != item.control.substring(0,2)) {
						if (currentFamily) {
							complianceSummary += "<div class='complianceSummaryListing'>";
							complianceSummary += getComplianceSummaryButton(currentFamily, currentStatus) + "</div>";
						}
						currentStatus = "";
						currentFamily = item.control.substring(0,2);
					}
					if (item.complianceRecords.length > 0) {
						for (const record of item.complianceRecords) {
							checklists = '';
							recordNum++;
							currentStatus = getOverallCompliance(currentStatus, record.status);
							checklists += '<a href="/single-checklist.html?id=';
							checklists += record.artifactId + '&ctrl=' + item.control + '" title="View the Checklist Details" target="' + record.artifactId + '">'; 
							checklists += '<span class="' + getComplianceTextClassName(record.status) + '">' + record.title + '</span></a>';
							overallStatus = '<span class="' + getComplianceTextClassName(record.status) + '">' + getStatusName(record.status); + '</span></a>';
							table.row.add( [recordNum, item.control, item.title, checklists, overallStatus] ).draw();
						}
					} else {
						table.row.add( [recordNum, item.control, item.title, checklists, overallStatus] ).draw();
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
		else {
			swal("Error Generating Compliance", "There was a problem generating the compliance for that system. Make sure the checklists are valid.", "error");
		}
		$.unblockUI();
	}
	else {
		swal("Choose a System", "You must first choose a system to generate a Compliance Report.", "info");
	}
}

async function getComplianceBySystemExport() {
	var system = $("#checklistSystemFilter").val();
	if (system && system.length > 0) {
		$.blockUI({ message: "Generating the compliance export...this may take a minute" , css: { padding: '15px'} }); 
		var pii = $('#checklistPrivacyFilter')[0].checked;
		var url = complianceAPI + "system/" + encodeURIComponent(system) + "/export/?pii=" + pii + "&filter=" + $('#checklistImpactFilter').val();

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
	
					downloadLink.download = $.trim($("#checklistSystemFilter option:selected").text().replace(" ", "-")) + "-Compliance-" + strDate + ".xlsx";
					document.body.appendChild(downloadLink);
					downloadLink.click();
					document.body.removeChild(downloadLink);
				}
			} else {
				alert("There was a problem exporting your report.")
				$.unblockUI();		
			}
		};
		request.send();
		$.unblockUI();
	}
}

async function getVulnerabilitiesByControl(id, control) {
	let response = await fetch(readAPI + "" + id + "/control/" + encodeURIComponent(control), {headers: {
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
	let response = await fetch(controlAPI + "" + encodeURIComponent(control), {headers: {
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
	else
		return "vulnNotAFindingText";
}

function getStatusName (status)
{
	if (status.toLowerCase() == 'not_reviewed')
		return "Not Reviewed";
	else if (status.toLowerCase() == 'open')
		return "Open";
	else if (status.toLowerCase() == 'not_applicable')
		return "Not Applicable";
	else 
		return "Not a Finding";
}

function getOverallCompliance(currentStatus, newStatus) {
	if (!currentStatus)
		return newStatus.toLowerCase();

	if (newStatus.toLowerCase() == "open")
		return newStatus.toLowerCase();
	else if (currentStatus.toLowerCase() != "open" && currentStatus.toLowerCase() != "not_reviewed") {
		if (newStatus.toLowerCase() == "not_reviewed")
			return newStatus.toLowerCase();
		else
			return "notafinding"; 
		}
	else
		return currentStatus.toLowerCase();
}

function getComplianceSummaryButton(family, status) {
	if (status == "open") {
		return "<button onclick='setComplianceDataTableFilter(\"" + family + "\"); return false;' class='btn btn-danger' style='cursor: pointer;'><i class='fa fa-times'> " + family + "</i></button>";
	} else if (status == "notafinding" || status == "not_applicable")  {
		return "<button onclick='setComplianceDataTableFilter(\"" + family + "\"); return false;' class='btn btn-success' style='cursor: pointer;'><i class='fa fa-check'>" + family + "</i></button>";
	} else if (status == "not_reviewed")  {
		return "<button onclick='setComplianceDataTableFilter(\"" + family + "\"); return false;' class='btn btn-dark' style='cursor: pointer;'><i class='fa fa-eye-slash'> " + family + "</i></button>";
	} else {
		return "<button onclick='setComplianceDataTableFilter(\"" + family + "\"); return false;' class='btn btn-outline-secondary' style='cursor: pointer;'><i class='fa fa-ban'> " + family + "</i></button>";
	}
}

function setComplianceDataTableFilter(family) {
	tableCompliance.search(family+"-").draw();
}

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
	if (str) {
    	return str
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	} else
		return "";
}
function decodeHtml(html) {
	if (html) {
		var txt = document.createElement("textarea");
		txt.innerHTML = html;
		return txt.value;
	} else
		return "";
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
function verifyDownloadCompliance() {
	if (canDownload()){
		$("#btnComplianceExport").show();
	}
}
function verifyUpdateChecklist() {
	if (canUpload()) {
		$("#btnUpdateChecklist").show();
		$("#btnUploadChecklist").show();
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
function verifyReportRefreshData() {
	if (isAdministrator()) {
		$("#btnReloadNessusData").show();
		$("#btnReloadVulnerabilityData").show();
	}
}
function verifyCreateChecklist() {
	if (canUpload()) {
		$("#btnCreateChecklistFromTemplate").show();
	}
}
	
function clearSessionData() {
	var currentSystem = sessionStorage.getItem("currentSystem");
	var currentSystemsList = sessionStorage.getItem("checklistSystems");
	var currentSystemFilter = sessionStorage.getItem("systemFilter");
	sessionStorage.clear();
	if (currentSystem && currentSystem != "undefined")
		sessionStorage.setItem("currentSystem", currentSystem);
	if (currentSystemsList && currentSystemsList != "undefined")
		sessionStorage.setItem("checklistSystems", currentSystemsList);
	if (currentSystemFilter && currentSystemFilter != "undefined")
		sessionStorage.setItem("systemFilter", currentSystemFilter);
}

function setupProfileMenu()
{
    if (typeof keycloak !== 'undefined') {
		$("#profileUserName").text(keycloak.tokenParsed.given_name);
	}
}