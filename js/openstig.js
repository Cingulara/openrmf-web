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

async function getChecklistData(id) {
  let response = await fetch(readAPI + "/" + id)
  if (response.ok) {
      var data = await response.json()
      $("#checklistTitle").html('<i class="fa fa-table"></i> ' + data.title);
  }
  else 
    throw new Error(response.status)
}

async function getChecklistScore(id) {
  let response = await fetch(scoreAPI + "/artifact/" + id)
  if (response.ok) {
      var data = await response.json()
      $("#checklistNotAFindingCount").text(data.totalNotAFinding.toString());
      $("#checklistNotApplicableCount").text(data.totalNotApplicable.toString());
      $("#checklistOpenCount").text(data.totalOpen.toString());
      $("#checklistNotReviewedCount").text(data.totalNotReviewed.toString());
  }
  else 
    throw new Error(response.status)
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