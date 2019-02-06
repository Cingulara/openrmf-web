var readAPI = 'http://localhost:8084'

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
          table += '<tr><td class="tabco1"><a href="single-checklist.html">'
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