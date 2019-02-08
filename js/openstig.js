var readAPI = 'http://localhost:8084'
var scoreAPI = 'http://localhost:8090'
var saveAPI = 'http://localhost:8082'
var uploadAPI = 'http://localhost:8086'
var templateAPI = 'http://localhost:8088'

async function getChecklists() {
    let response = await fetch(readAPI)
    if (response.ok) {
        var data = await response.json()
        // cycle through the data and fill in the data table at id tblChecklistListing div.html()
        var table = "";
        table += '<table class="table table-condensed table-hover table-bordered table-responsive-md"><thead><tr><th class="tabco1">Name</th>'
        table += '<th class="tabco2">Not a Finding</th><th class="tabco3">Not Applicable</th><th class="tabco4">Open</th><th class="tabco5">Not Reviewed</th>'
        table += '</tr></thead><tbody>'
        data.forEach( function(item, index) {
          table += '<tr><td class="tabco1"><a href="single-checklist.html?id=' + item.id + '">'
          table += item.title
          table += '</a></td><td class="tabco2"><i class="fa" aria-hidden="true"></i>15</td>'
          table += '<td class="tabco3"><i class="fa" aria-hidden="true"></i>17</td>'
          table += '<td class="tabco4"><i class="fa" aria-hidden="true"></i>100</td>'
          table += '<td class="tabco5"><i class="fa" aria-hidden="true"></i>130</td>'
          table += '</tr>'
        });
      table += '</tbody></tbody></table>'

      // with all the data fill in the table and go
      $("#tblChecklistListing").html(table);
    }
    else 
      throw new Error(response.status)
  }

/*************************************
 * Single Checklist Data functions
 *************************************/
// get the specific checklist data
async function getChecklistData(id) {
  let response = await fetch(readAPI + "/" + id)
  if (response.ok) {
      var data = await response.json()
      $("#checklistTitle").html('<i class="fa fa-table"></i> ' + data.title);
  }
  else 
    throw new Error(response.status)
}
// call to get the score data and show the name and then funnel data to the
async function getChecklistScore(id) {
  let response = await fetch(scoreAPI + "/artifact/" + id)
  if (response.ok) {
      var data = await response.json()
      $("#checklistNotAFindingCount").text(data.totalNotAFinding.toString());
      $("#checklistNotApplicableCount").text(data.totalNotApplicable.toString());
      $("#checklistOpenCount").text(data.totalOpen.toString());
      $("#checklistNotReviewedCount").text(data.totalNotReviewed.toString());
      // show the charts with the same data
      makeChartStatus(data);
      makeChartCategory(data);
      makeBarChartBreakdown(data);
  }
  else 
    throw new Error(response.status)
}
// pie chart with the status of the checklist
async function makeChartStatus (data) {
	var ctx3 = document.getElementById("chartSeverity").getContext('2d');
	var chartSeverity = new Chart(ctx3, {
		type: 'pie',
		data: {
				datasets: [{
					data: [data.totalOpen, data.totalNotAFinding, data.totalNotApplicable, data.totalNotReviewed],
					backgroundColor: [
						'rgba(255,99,132,1)',
						'rgba(75, 192, 192, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(150, 150, 150, 1)'
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
				label: '# Vulnerabilities',
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