/*************************************
 * Dashboard functions
 ************************************/
// fill in the # of total checklists in the system on the dashboard page top right
async function getChecklistTotalCount() {
	let response = await fetch(readAPI + "/count", {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	if (response.ok) {
			var data = await response.json()
			$("#numberChecklistsTotal").html(data);
			$("#numberNewChecklistsTotal").text(data);
	}
	else 
		throw new Error(response.status)
}

/*************************************
 * Template listing functions
 ************************************/
async function getTemplates(latest) {
	$.blockUI({ message: "Updating the checklist listing..." }); 
	var url = templateAPI;	
	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	// parse the result regardless of the one called as the DIV are the same on Dashboard/index and the checklists pages
  if (response.ok) {
			var data = await response.json()

			var table = $('#tblChecklistListing').DataTable(); // the datatable reference to do a row.add() to
			table.clear();
			var checklistLink = "";
			if (data.length == 0) {
				$.unblockUI();
				var alertText = 'There are no STIG templates uploaded. Please go to the Upload page to add your first.';
				alertText += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
				alertText += '<span aria-hidden="true">&times;</span></button>';
				$("#divMessaging").html(alertText);
				$("#divMessaging").show();
			}
			else {
				$("#divMessaging").html('');
				$("#divMessaging").hide();
				for (const item of data) {
					checklistLink = '<a href="single-template.html?id=' + item.internalId + '">'
					checklistLink += item.title
					checklistLink += '</a><br /><span class="small">last updated on '
					if (item.updatedOn) {
						checklistLink += moment(item.updatedOn).format('MM/DD/YYYY h:mm a');
					}
					else {
						checklistLink += moment(item.created).format('MM/DD/YYYY h:mm a');
					}
					// now get the score
					var score = null;
					var formData = new FormData();
					formData.append("rawChecklist", item.rawChecklist);
					$.ajax({
						url : scoreAPI,
						data : formData,
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
						},
					error: function() {
						table.row.add( { "title": checklistLink, 
									"totalNaF": 0, "totalNA": 0, "totalOpen": 0, "totalNR": 0,
									"totalNaFCat1": 0, "totalNACat1": 0, "totalOpenCat1": 0, "totalNRCat1": 0,
									"totalNaFCat2": 0, "totalNACat2": 0, "totalOpenCat2": 0, "totalNRCat2": 0,
									"totalNaFCat3": 0, "totalNACat3": 0, "totalOpenCat3": 0, "totalNRCat3": 0
								}).draw();
					}});
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

/*************************************
 * System listing functions
 ************************************/
async function getChecklistSystemListing(){
	$.blockUI({ message: "Updating the system listing..." }); 
	var url = readAPI + "/systems/";

	// setup the table visibility
	$("#divSystemListing").show();
	$("#divChecklistListing").hide();	
	$("#btnListAllSystems").hide();
	$("#txtSystemName").val('');

	// reset the list of systems
  sessionStorage.removeItem("checklistSystems");
	let response = await fetch(url, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
	// parse the result regardless of the one called as the DIV are the same on Dashboard/index and the checklists pages
  if (response.ok) {
			var data = await response.json()
			var table = $('#tblSystemListing').DataTable(); // the datatable reference to do a row.add() to
			table.clear();
			$("#txtListingTitle").text("Systems");

			if (data.length == 0) {
				$.unblockUI();
				var alertText = 'There are no systems setup. Please go to the Upload page to add your first system and checklist.';
				alertText += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
				alertText += '<span aria-hidden="true">&times;</span></button>';
				$("#divMessaging").html(alertText);
				$("#divMessaging").show();
			}
			else {
				$.unblockUI();
				$('#btnExportListToExcel').prop('disabled', false); // allow the Export to Excel button to be live
				$("#divMessaging").html('');
				$("#divMessaging").hide();
				// cycle through the systems and add the data
				var systemLink = "";
				for (const item of data) {
					systemLink = "<button type='button' class='btn btn-primary' onclick='getChecklists(false,\"" + item.system + "\"); return false;'>Open Checklists</button>";
					table.row.add( { "systemLink": systemLink, "system": item.system, "checklistCount": item.checklistCount}).draw();
				}
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
/*************************************
 * Checklist listing functions
 ************************************/
async function getChecklistsBySystem() {
	var system = $("#checklistSystemFilter").val();
	await getChecklists(false, system);
}
async function getChecklists(latest, system) {
	$.blockUI({ message: "Updating the checklist listing..." }); 
	var url = readAPI;
	if (system && system != "All")
		url += "/systems/" + encodeURIComponent(system);
	else if (latest) // get the top 5
		url += "/latest/5";

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
		$("#txtSystemName").val(system);
		
		$("#txtListingTitle").text(system + " Checklists");
		var table = $('#tblChecklistListing').DataTable(); // the datatable reference to do a row.add() to
		table.clear();
		var checklistLink = "";
		if (data.length == 0) {
			$.unblockUI();
			var alertText = 'There are no STIG checklists uploaded. Please go to the Upload page to add your first.';
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
				checklistLink = '<a href="single-checklist.html?id=' + item.internalId + '">'
				checklistLink += item.title
				checklistLink += '</a><br /><span class="small">last updated on '
				if (item.updatedOn) {
					checklistLink += moment(item.updatedOn).format('MM/DD/YYYY h:mm a');
				}
				else {
					checklistLink += moment(item.created).format('MM/DD/YYYY h:mm a');
				}
				// now get the score
				var score = await getScoreForChecklistListing(item.internalId);
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
					value: value.system,
					text : value.system 
			}));
		}); 
	}
}

async function exportChecklistListingXLSX() {
	// redirect to the API and it downloads the XLSX file of all Checklist Listings
	// if we have a specific system selected only export the ones for that system
	var systemFilter = '';
	if ($("#txtSystemName").val()){
		systemFilter = $("#txtSystemName").val();
	}
	$.blockUI({ message: "Generating the System Checklist Excel export ...please wait" }); 
	var url = readAPI + "/export?system=" + encodeURIComponent(systemFilter);
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
	var url = readAPI;
	if (template)
		url = templateAPI;
  let response = await fetch(url + "/" + id, {headers: {
		'Authorization': 'Bearer ' + keycloak.token
	}});
  if (response.ok) {
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
			$("#checklistSystem").html("<b>System:</b> " + data.system);
			$("#checklistHost").html("<b>Host:</b> " + data.checklist.asset.hosT_NAME);
			$("#checklistFQDN").html("<b>FQDN:</b> " + data.checklist.asset.hosT_FQDN);
			$("#checklistTechArea").html("<b>Tech Area:</b> " + data.checklist.asset.tecH_AREA);
			$("#checklistAssetType").html("<b>Asset Type:</b> " + data.checklist.asset.asseT_TYPE);
			$("#checklistRole").html("<b>Role:</b> " + data.checklist.asset.role);
			
			$("#checklistSTIGTitle").html("<b>Title:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[7].siD_DATA);
			$("#checklistSTIGReleaseInfo").html("<b>Release:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[6].siD_DATA);
			$("#checklistSTIGDescription").html("<b>Description:</b> " + data.checklist.stigs.iSTIG.stiG_INFO.sI_DATA[4].siD_DATA);

			// load updated date
			$("#chartSeverityUpdated").html(updatedDate);
			$("#chartCategoryUpdated").html(updatedDate);
			$("#barChartUpdated").html(updatedDate);
			$("#checklistLastUpdated").html(updatedDate);

			// update the Template Scoring dynamically
			if (template) getScoreForTemplateListing(data.rawChecklist);

			await getChecklistSystemsForChecklist();
			// go ahead and fill in the modal for for upload while we are in here
			$("#frmChecklistTitle").val(data.title);
			$("#frmChecklistDescription").val(data.description);
			$("#frmChecklistType").val(data.type);
			$("#frmChecklistSystem").val(data.system);

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
				if (controlInfo && controlInfo.length >= 1) {
					$("#checklistControlTitle").html(controlInfo[0].family + ": " + controlInfo[0].number + " - " + controlInfo[0].title);
					$("#checklistControlGuidance").html(controlInfo[0].supplementalGuidance);
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
					vulnListing += '<button type="button" class="btn btn-sm ';
					vulnListing += getVulnerabilityStatusClassName(vuln.status);
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
		}
}
// based on the checkboxes, filter the Vuln Ids listing
function updateVulnerabilityListingByFilter() {
	var status = JSON.parse(sessionStorage.getItem("vulnStatus"));
	if (status) {
		var vulnListing = "";
		for (const vuln of status) {
			// if we should show it, add it to the HTML listing
			if (showVulnId(vuln)) {
				// parse them base on the above booleans and print them out
				vulnListing += '<button type="button" class="btn btn-sm ';
				vulnListing += getVulnerabilityStatusClassName(vuln.status);
				vulnListing += '" title="' + vuln.vulnId + '" ';
				vulnListing += ' onclick="viewVulnDetails(\'' + vuln.vulnId + '\'); return false;">'
				vulnListing += vuln.vulnId + '</button><br />';
			}
		}
		// rewrite the listing
		$("#checklistTree").html(vulnListing);
	}
}
function showVulnId(vuln){
	var bOpen = $('#chkVulnOpen').prop('checked');
	var bNaF  = $('#chkVulnNaF').prop('checked');
	var bNA   = $('#chkVulnNA').prop('checked');
	var bNR   = $('#chkVulnNR').prop('checked');
	// check status and boolean
	if (vuln.status.toLowerCase() == 'not_reviewed' && bNR)
		return true;
	else if (vuln.status.toLowerCase() == 'open' && bOpen)
		return true;
  else if (vuln.status.toLowerCase() == 'not_applicable' && bNA)
		return true;
	else if (vuln.status.toLowerCase() == 'notafinding' && bNaF)
		return true;
	else 
		return false;
}
// get the color coding of the class based on vulnerability status
function getVulnerabilityStatusClassName (status) {
	if (status.toLowerCase() == 'not_reviewed')
		return "vulnNotReviewed";
	else if (status.toLowerCase() == 'open')
		return "vulnOpen";
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
		for(i = 24; i < data.stiG_DATA.length; i++) { 
			ccilist += data.stiG_DATA[i].attributE_DATA + ", ";
		}
		ccilist = ccilist.substring(0, ccilist.length -2);
		$("#vulnCCIId").html("<b>CCI ID:</b>&nbsp;" + ccilist);
		$("#vulnStatus").html("<b>Status:</b>&nbsp;" + data.status);
		$("#vulnClassification").html("<b>Classification:</b>&nbsp;" + data.stiG_DATA[21].attributE_DATA);
		$("#vulnSeverity").html("<b>Severity:</b>&nbsp;" + data.stiG_DATA[1].attributE_DATA);
		$("#vulnDiscussion").html("<b>Discussion:</b>&nbsp;" + data.stiG_DATA[6].attributE_DATA);
		$("#vulnCheckText").html("<b>Check Text:</b>&nbsp;" + data.stiG_DATA[8].attributE_DATA);
		$("#vulnFixText").html("<b>Fix Text:</b>&nbsp;" + data.stiG_DATA[9].attributE_DATA);
		$("#vulnReferences").html();
		$("#vulnFindingDetails").html("<b>Finding Details:</b>&nbsp;" + data.findinG_DETAILS);
		$("#vulnComments").html("<b>Comments:</b>&nbsp;" + data.comments);
	}
}

// update function on the checklist page showing all the individual checklist data
function updateSingleChecklist(id) {
	var url = saveAPI;
	// only if there is a file does this get used uploadAPI
	var formData = new FormData();
	// if a new system, use it, otherwise select from the list
 if ($("#frmChecklistSystemText").val() && $("#frmChecklistSystemText").val().trim().length > 0) {
		formData.append("system",$("#frmChecklistSystemText").val());
		sessionStorage.removeItem("checklistSystems"); // reset and make it read again
	}
	else
		formData.append("system",$("#frmChecklistSystem").val());

	if ($('#checklistFile').val()) {
		// someone added a file
		formData.append('checklistFile',$('#checklistFile')[0].files[0]);
		url = uploadAPI; // include the file contents in the update
	}
	$.ajax({
			url : url + "/" + id,
			data : formData,
			type : 'PUT',
			beforeSend: function(request) {
			  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
			},
			processData: false,
			contentType: false,
			success : function(data){
				swal("Your Checklist was updated successfully!", "Click OK to continue!", "success");
				getChecklistSystemsForChecklist();
				getChecklistData(id, false);
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
					value: value.system,
					text : value.system
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
		$("#checklistNotAFindingCount").text(data.totalNotAFinding.toString());
		$("#checklistNotApplicableCount").text(data.totalNotApplicable.toString());
		$("#checklistOpenCount").text(data.totalOpen.toString());
		$("#checklistNotReviewedCount").text(data.totalNotReviewed.toString());
		$("#cat1NotAFindingCount").text(data.totalCat1NotAFinding.toString());
		$("#cat1NotApplicableCount").text(data.totalCat1NotApplicable.toString());
		$("#cat1OpenCount").text(data.totalCat1Open.toString());
		$("#cat1NotReviewedCount").text(data.totalCat1NotReviewed.toString());
		$("#cat2NotAFindingCount").text(data.totalCat2NotAFinding.toString());
		$("#cat2NotApplicableCount").text(data.totalCat2NotApplicable.toString());
		$("#cat2OpenCount").text(data.totalCat2Open.toString());
		$("#cat2NotReviewedCount").text(data.totalCat2NotReviewed.toString());
		$("#cat3NotAFindingCount").text(data.totalCat3NotAFinding.toString());
		$("#cat3NotApplicableCount").text(data.totalCat3NotApplicable.toString());
		$("#cat3OpenCount").text(data.totalCat3Open.toString());
		$("#cat3NotReviewedCount").text(data.totalCat3NotReviewed.toString());
		
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
				responsive: true
			}
	 
  });
}
function downloadChart(element) {
	var img = document.getElementById(element).toDataURL("image/jpg");
	//location.href = url;
	var element = document.createElement('a');
	element.setAttribute('href', img);
	element.setAttribute('download', "openSTIGChart.jpg");
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
				responsive: true
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
					'rgba(54, 162, 235, 0.5)',
					'rgba(150, 150, 150, 0.5)',	
					'rgba(255, 99, 132, 0.5)',
					'rgba(75, 192, 192, 0.5)',
					'rgba(54, 162, 235, 0.5)',
					'rgba(150, 150, 150, 0.5)',	
					'rgba(255, 99, 132, 0.5)',
					'rgba(75, 192, 192, 0.5)',
					'rgba(54, 162, 235, 0.5)',
					'rgba(150, 150, 150, 0.5)'	
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

async function deleteChecklist(id) {
	if (id && id.length > 10) {
		if (confirm ("Are you sure you wish to delete this checklist?")) {
			$.ajax({
					url : saveAPI + "/" + id,
					type : 'DELETE',
					beforeSend: function(request) {
					  request.setRequestHeader("Authorization", 'Bearer ' + keycloak.token);
					},
					success : function(data){
						swal("Your Checklist was deleted successfully!", "Click OK to continue!", "success");
						location.href = "checklists.html";
					},
					error : function(data){
						swal("Your Checklist was not deleted successfully!", "Click OK to continue!", "error");
					}
			});
		}
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
async function getChecklistSystemsForUpload() {
	sessionStorage.removeItem("checklistSystems");
	var data = await getChecklistSystems();
	// for each data add to the upload checklistSystem
	if (data) {
		$.each(data, function (index, value) {
			$('#checklistSystem').append($('<option/>', { 
					value: value.system,
					text : value.system 
			}));
		}); 
	}
}

function uploadChecklist(){
	var formData = new FormData();
	if ($("input[id=checklistFile]").length == 0) {
		alert('You need to upload at least 1 checklist');
		return false;
	}
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
		if ($("#checklistSystemText").val() && $("#checklistSystemText").val().trim().length ==0) {
			alert('please fill in the system name');
			return false;
		}
		formData.append("system",$("#checklistSystemText").val().trim());
		// add this new one to the listing, and then reset the form to show this
		$('#divNewChecklistSystem').show(); 
		$('#divNewChecklistSystemText').hide();
		$('#checklistSystem').append($('<option/>', { 
			value: $("#checklistSystemText").val().trim(),
			text : $("#checklistSystemText").val().trim() 
		}));
	}
	else
		formData.append("system",$("#checklistSystem").val());
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
				swal("Your Checklists were uploaded successfully!", "Click OK to continue!", "success");
				// reset the form
				$("#frmChecklistUpload")[0].reset();
				$('#checklistFile').trigger("filer.reset")
			},
			error: function() {
				alert("There was an error uploading the checklist. Try again please!");
			}
	});

}

function uploadTemplate(){
	var formData = new FormData();
	formData.append("type",$("#templateType").val());
	formData.append("title",$("#templateTitle").val());
	formData.append("description",$("#templateDescription").val());
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
				swal("Your Template was uploaded successfully!", "Click OK to continue!", "success");
				// reset the form
				$("#frmTemplateUpload")[0].reset();
			}
	});
	return false;
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
				myLabels.push(item.typeTitle);
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
					value: value.system,
					text : value.system 
			}));
		}); 
	}
}
async function getReportsBySystem() {
	await getChecklistTypeBreakdown($("#checklistSystemFilter").val());
}
/************************************ 
 Compliance Functions
************************************/
// the system dropdown on the Compliance page
async function getChecklistSystemsForComplianceFilter() {
	var data = await getChecklistSystems();
	// for each data add to the compliance checklistSystem
	if (data) {
		$.each(data, function (index, value) {
			$('#checklistSystemFilter').append($('<option/>', { 
					value: value.system,
					text : value.system 
			}));
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
				table.clear();
				var checklists = ''; // holds the list of checklists
				var recordNum = 0;
				for (const item of data.result) {
					recordNum++;
					checklists = '<ul>';
					if (item.complianceRecords.length > 0) {
						for (const record of item.complianceRecords){
							checklists += '<li><a href="/single-checklist.html?id=';
							checklists += record.artifactId + '&ctrl=' + item.control + '" target="' + record.artifactId + '">'; 
							checklists += '<span class="' + getComplianceTextClassName(record.status) + '">' + record.title + '</span></li>';
						}
					}
					checklists += "</ul>";
					// dynamically add to the datatable
					table.row.add( [recordNum, item.control, item.title, checklists] ).draw();
				}
			}
			else {
				alert("There are no checklists ready for this compliance report.");
			}
		}
		else { // response was not Ok()
			alert("There was a problem generating the compliance for that system. Make sure the checklists are valid.");
		}
		$.unblockUI();
	}
	else {
		alert('Choose a system first...');
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
		return "vulnOpenText";
	else if (status.toLowerCase() == 'not_applicable')
		return "vulnNotApplicableText";
	else // not a finding
		return "vulnNotAFindingText";
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
/************************************ 
 Permission and User Login Functions
************************************/
function verifyUploadMenu() {
	if (canUpload()) {
    	$("#menuUpload").show();
	}
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
function verifyDownloadTemplate() {
	if (canDownload()){
		$("#btnDownloadTemplate").show();
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
function setupProfileMenu()
{
	// use the person's first name
	$("#profileUserName").text(keycloak.tokenParsed.given_name);
	$("#profileAccountURL").attr("href", keycloak.createAccountUrl());
	var logoutURL = keycloak.endpoints.logout();
	logoutURL += "?redirect_uri="+encodeURIComponent(location.protocol + "//" + location.host + "/logout.html");
	$("#profileLogoutURL").attr("href", logoutURL);
}