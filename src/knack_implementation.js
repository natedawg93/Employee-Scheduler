var css_files =['https://dl.dropboxusercontent.com/s/thqhda8nk5xl4ac/main.css?dl=1',
                'https://dl.dropboxusercontent.com/s/c6rm95oyq8zzjrz/daygrid_main.css?dl=1',
                'https://dl.dropboxusercontent.com/s/7qsnp5072jddkbj/timegrid_main.css?dl=1',
                'https://dl.dropboxusercontent.com/s/7nl45exb3rkwej3/list_main.css?dl=1',
                'https://dl.dropboxusercontent.com/s/inrtwvxx75qm2rs/timeline_main.css?dl=1',
                'https://dl.dropboxusercontent.com/s/04pcb19x53ua8js/resource_timeline_main.css?dl=1',
                "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css",// Bootstrap css
                "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.10/css/bootstrap-select.css", // Bootstrap select CSS
                "https://unpkg.com/tabulator-tables@4.2.7/dist/css/tabulator.min.css", // Tabulator css
                "https://use.fontawesome.com/releases/v5.8.2/css/all.css"]; // fontawesome

var js_files = ["https://code.jquery.com/jquery-3.4.1.js", // jQuery
                "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js", // Bootstrap js
               'https://dl.dropboxusercontent.com/s/96w8t0jng58rsyy/main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/ydkr12hihtuzfm2/interaction_main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/ivp8qfg7cu0azql/daygrid_main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/02zuvaflwou5ih3/timegrid_main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/bij4kyj0dab0wsx/list_main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/dtq2qpbpe11gapn/timeline_main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/3ocwfmn1gr9ajwd/resource_common_main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/7m8eixl1zxtdj9t/resource_timeline_main.js?dl=1',
               "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.js",// Need to include moment.js for it to work
               "https://unpkg.com/tabulator-tables@4.2.7/dist/js/tabulator.min.js"]; // Tabulator js

LazyLoad.css(css_files, function () { // Load all the CSS files using LazyLoad
    console.log('Loaded all CSS files');
});
LazyLoad.js(js_files, function () { // Load all the JS files using LazyLoad
    console.log('Loaded all JS files');
});

$(document).one('knack-view-render.view_69',function(event, scene) { // View 69 is the tasks list view
  console.log(Knack.getUserAttributes())
  $('#kn-scene_7').prepend(`<div class='form-container' style='margin: 0 auto;'><form id="date-range">
          From:
          <input type="date" name="from" min="2015-01-01" id="from" required><br><br>
          <button type="button" class="btn btn-primary" id="date-submit">Submit</button>
      </form></div>`)
      
  $('#date-submit').on('click', function (){
    $("#scheduler").empty()
    $("#main-table").empty()
    var start = moment($('#from').val());
    var end = moment(start).add(7,'days')
    getAllRecordsForObject('scene_7', 'view_69', handleData,start,end); // Get all the records for the specific scene and view
  $( "#kn-scene_7" ).prepend( "<div id='main-table'></div>" );
    $( "#kn-scene_7" ).prepend( "<div id='scheduler'></div>" ); // Add the calendar div to the end of the view's div. Without this, it renders the calendar on all pages
    $('#date-submit').prop('disabled', true);
  });
  
    $("input").change(function(){
    $('#date-submit').prop('disabled', false);
   });
});

function groupBy(items, properties, collect) {
  if (arguments.length < 2) return arr;
  var groups = _groupBy(items, properties);
  // collect other properties values in array
  if (collect && collect.length > 0)
    groups = collectProperties(groups, collect);

  return groups;
}


function _groupBy(items, properties) {
  var group = {};
  if (typeof properties[0] === 'string') {
    group = groupByCategory(items, properties[0]);
  } else {
    group = groupByRange(items, properties[0]);
  }
  properties = properties.slice(1);
  if (properties.length > 0) {
    for (var key in group) {
      group[key] = _groupBy(group[key], properties);
    }
  }
  return group;
}
function groupByCategory(arr, prop) {
  var isPropertyArray = Array.isArray(valueAt(arr[0], prop));
  if (isPropertyArray) {
    return arr.reduce(function(group, f) {
      var tags = valueAt(f, prop);
      tags.forEach(function(tag) { 
        group[tag] = group[tag] || [];
        group[tag].push(f);
      });
      return group;
    },{});
  } else {
    return arr.reduce(function(group, f) {
      var tag = valueAt(f, prop);
      group[tag] = group[tag] || [];
      group[tag].push(f);
      return group;
    },{});
  }
}
function valueAt(obj,path) {
  //taken from http://stackoverflow.com/a/6394168/713573
  function index(prev,cur, i, arr) { 
    if (prev.hasOwnProperty(cur)) {
      return prev[cur]; 
    } else {
      throw new Error(arr.slice(0,i+1).join('.') + ' is not a valid property path'); 
    }
  }
  return path.split('.').reduce(index, obj);
}


function precise(x) {
  return Number.parseFloat(x).toPrecision(2);
}

/* Function to get all the records for an object*/
function getAllRecordsForObject(sceneKey, viewKey, callbackFunctionToHandleData,start, end, currentPage = 1, totalPages, allRecordsForObject = []) {
  if (!sceneKey || !viewKey) {
    throw new Error('Missing scene or view key!');
  }

  if (!callbackFunctionToHandleData) {
    throw new Error('No callback function provided; make sure the data is handled somehow.');
  }
  // AJAX prep
  var url = 'https://api.knack.com/v1/pages/' + sceneKey + '/views/' + viewKey + '/records?page=' + currentPage + '&rows_per_page=1000';
  var headers = {
    'X-Knack-Application-ID': '5c93c4d50fbcdf5726ae5439',
    'X-Knack-REST-API-Key': 'e46f6190-4bfb-11e9-9d62-3b671224caf2'
  };

  $.ajax({
    url: url,
    headers: headers,
    type: 'GET',
  }).done(function(responseData) {
    allRecordsForObject = allRecordsForObject.concat(responseData.records);
    // Recursively continue getting records until we have all of them
    if (currentPage < responseData.total_pages) {
      currentPage++;
      getAllRecordsForObject(sceneKey, viewKey, callbackFunctionToHandleData, start, end, currentPage, responseData.total_pages, allRecordsForObject);
      return;
    }
    // Handle ALL records with our callback function
    callbackFunctionToHandleData(allRecordsForObject, start, end);
  });
};  

/* Function to handle the data*/

function handleData(allRecordsForObject, start, end) {


  function parse_iso(iso_time){ // Function to remove the '.000Z' from the ISO string
    return String(iso_time).slice(0,-5);
  };
  function parseDate(dateStr) {
    var date = dateStr.split('/');
    var month = date[0] - 1 ; //January = 0
    var day = date[1]; 
    var year = date[2];
    return new Date(year, day, month); 
  };

  // Function to filter the data by scheduled date
  function filterDate(startDate,endDate,data){ 
    var filteredData = [];
    for(var index in data) {
      var obj = data[index];
      var date = moment(obj.field_58_raw.date,'MM/DD/YYYY').toDate();
      if(date >= startDate && date <= endDate)
        filteredData.push(obj);
    }
    return filteredData;
  }

  let data = JSON.parse(JSON.stringify(filterDate(start,end,allRecordsForObject)));
  console.log(data)
  var t_data = JSON.parse(JSON.stringify(filterDate(start,end,allRecordsForObject))) // Table data needs to be filtered by date
  
  /* Begin code for calendar */
  if (!Array.isArray(data) || !data.length) {
    alert('No data found for range');
    return
  }
  let people = []
  let events = []
  var c = 0;
  for (let d of data.entries()){ // Construct the JSON payload for the calendar
    people.push({id: d[1].field_57, //Field_57 is the name. We are matching multiple tasks for the same person based on the name.
                 // This is ok because the name is a list of pre-set values
                 title: d[1].field_57,
                 children: [{
                   id: d[1].field_57 + '_Scheduled',
                   title: 'Scheduled',
                 },
                            {
                              id: d[1].field_57 + '_Actual',
                              title: 'Actual',
                            }
                           ]
                })
    events.push({id: String(c) + '_Scheduled',
                 resourceId: d[1].field_57 + '_Scheduled',
                 start: parse_iso(d[1].field_58_raw.iso_timestamp),//Field_58 is the scheduled time
                 end: parse_iso(d[1].field_58_raw.to.iso_timestamp),
                 title: d[1].field_61, // Field_61 is the title (whats displayed inside the bar)
                 color:'#00cc00', // Green
                 record_id:d[1].id
                })
    events.push({id: String(c) + '_Actual',
                 resourceId: d[1].field_57 + '_Actual', 
                 start: parse_iso(d[1].field_67_raw.iso_timestamp), //Field_67 is the actual time
                 end: parse_iso(d[1].field_67_raw.to.iso_timestamp),
                 title: d[1].field_61,
                 color: '#e62e00', // Red
                 record_id:d[1].id
                })
    c += 1;
  }

  var calendarEl = document.getElementById('scheduler');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
    plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'list', 'resourceTimeline' ],
    //now: String(today),
    now: $('#from').val(),
    editable: false, // enable draggable events
    aspectRatio: 2.0,
    //scrollTime: '08:00:00', // undo default 6am scrollTime
    header: {
      left: 'today prev,next',
      center: 'title',
      right: 'resourceTimelineDay,resourceTimelineThreeDays,timeGridWeek,dayGridMonth,listWeek'
    },
    defaultView: 'resourceTimeline',
    views: {
      resourceTimeline: {
        type: 'resourceTimeline',
        duration: { hours: 8 },
        buttonText: '15 minutes'
      }
    },
    resourceLabelText: 'People',
    resources:  [JSON.parse(JSON.stringify(people))][0],
    events: [JSON.parse(JSON.stringify(events))][0],
  });

  calendar.render();

  /* End code for calendar */
  
  /* Begin code for Table */
  
  // Calculate the scheduled and actual hours by day as soon as the data is read
  for (var o of t_data){
    var sch_a =  moment(o.field_58_raw.iso_timestamp) // Scheduled From
    var sch_b = moment(o.field_58_raw.to.iso_timestamp)// Scheduled To
    var act_a =  moment(o.field_67_raw.iso_timestamp) // Actual From
    var act_b = moment(o.field_67_raw.to.iso_timestamp) // Actual To
    o['hours_scheduled'] = Math.round(Math.abs(moment.duration(sch_a.diff(sch_b)).asHours()) * 100) / 100 // Rounding to 2 decimals 
    o['hours_actual'] = Math.round(Math.abs(moment.duration(act_a.diff(act_b)).asHours()) * 100) / 100
  }
  var tabledata = []
  var keys = []
  
  // Check if there is any data in the date week user gave
  try {
    var group = JSON.parse(JSON.stringify(groupBy(t_data,['field_57','field_58_raw.date']))) // Group the data by the name and then by the date
    } catch(e) {
      alert('No data found for range');
      return;
    }
  // Get all the keys i.e., the dates - 05/09/2019,05/10/2019,etc
  // group - the object grouped as 
  /*{
    name1:{
      date1:{all knack fields (_id,field_57,etc)},
        date2:{all knack fields (_id,field_57,etc)}
        .
        .
        .
        }
    name2:{
      date1:{all knack fields (_id,field_57,etc)},
        date2:{all knack fields (_id,field_57,etc)}
        .
        .
        .
       }
    }
  */
  Object.keys(group).forEach(function (item) {
    Object.keys(group[item]).forEach(function (item2) {
      keys.push(item2) // This will get all the dates for the query
    });
  });
  keys = Array.from(new Set(keys)) // Get all the unique dates for the range
 
  // Convert to object with structure of
 /*{
    name1:{
      date1:[<scheduled tasks>,<actual tasks>,<Scheduled hours by day>,<Actual hours by day>,<Difference between Actual-Scheduled hours>,<Over,under,on time>],
        date2:[<scheduled tasks>,<actual tasks>,<Scheduled hours by day>,<Actual hours by day>,<Difference between Actual-Scheduled hours>,<Over,under,on time>]
        .
        .
        .
        }
    name2:{
      date1:[<scheduled tasks>,<actual tasks>,<Scheduled hours by day>,<Actual hours by day>,<Difference between Actual-Scheduled hours>,<Over,under,on time>],
        date2:[<scheduled tasks>,<actual tasks>,<Scheduled hours by day>,<Actual hours by day>,<Difference between Actual-Scheduled hours>,<Over,under,on time>]
        .
        .
        .
       }
    }
  */
  Object.keys(group).forEach(function (item) {
    for(i of keys){ // For all the dates
      if(typeof group[item][i] !== "undefined"){ // If the data exists
        var tasks_scheduled = []
        var tasks_actual = []
        var scheduledHours = 0
        var actualHours = 0
        group[item][i].forEach(function(element, index){
          tasks_scheduled.push(`<strong>${element.field_61}:</strong> ${element.field_58.slice(11,)}`) // Make the title of event bold and add line breaks between events
          tasks_actual.push(`<strong>${element.field_61}:</strong> ${element.field_67.slice(11,)}`)
          scheduledHours+=element.hours_scheduled
          actualHours+=element.hours_actual
        });
        group[item][i][0] = tasks_scheduled.join('<br/>')
        group[item][i][1] = tasks_actual.join('<br/>')
        group[item][i][2] = scheduledHours
        group[item][i][3] = actualHours
        var num = group[item][i][3] - group[item][i][2] // Actual - Scheduled.
        group[item][i][4] = precise(num) // Round to 2 decimals
        group[item][i][5] = getOverUnderStyle(group[item][i][4])
      }
    }
  });
  function getOverUnderStyle(item){
    if (item > 0){
      return `<strong style="color:#e62e00">${item} hours </strong> <i class="fas fa-exclamation-triangle" style="color:#e62e00;font-size:1.5em"></i>` // Red Color
    } else if (item < 0){
      return `<strong style="color:#0000ff">${item} hours </strong> <i class="fas fa-question-circle" style="color:#0000ff;font-size:1.5em"></i>` // Blue color
    }else{
      return `<strong style="color:#00cc00">${item} hours </strong> <i class="fas fa-check-square" style="color:#00cc00;font-size:1.5em"></i>` // Green Color
    }
  }

  //FUCK YES -> GOLD
  /* Will convert the grouped objects into object of structure
    [
      {name:Scheduled,
       date1:Scheduled Tasks for date1,
       date2:Scheduled Tasks for date2,
       date3:Scheduled Tasks for date3,etc},
       
       {name:Actual,
       date1:Actual Tasks for date1,
       date2:Actual Tasks for date2,
       date3:Actual Tasks for date3,etc},
       
       {name:Total Scheduled hours,
       date1:Total Scheduled hours for date1,
       date2:Total Scheduled hours for date2,
       date3:Total Scheduled hours for date3,etc},
       
       {name:Total Actual hours,
       date1:Total Actual hours for date1,
       date2:Total Actual hours for date2,
       date3:Total Actual hours for date3,etc},
       
       {name:Time difference,
       date1:Time difference for date1,
       date2:Time difference for date2,
       date3:Time difference for date3,etc},
       
     ]
     
     We do it this way because this is the format tabulator will take for children records*/
  function getChildrenFromList(group,item) {
    // i[0] - date
    // i[1] - all entries
    // i[1][0] - Scheduled events string
    // i[1][1] - Actual events string
    // i[1][2] - Total Scheduled hours
    // i[1][3] - Total Actual hours
    // i[1][4] - Difference of Scheduled - Actual
    // i[1][4] - Over, under or on time string
    var scheduled = Object.entries(group[item]).map((i)=>{
      return {[i[0]]:i[1][0]}
    })
    scheduled.unshift({'name':'Scheduled'})
    scheduled =  scheduled.reduce(function(result, current) {
      return Object.assign(result, current);
    }, {}); //Need to understand reduce -> Will transform list of date objects from group into date:value for each parameter
        // Take each item in the scheduled array of objects and assign it iteratively to a 'current' object that starts as an empty object
    var actual = Object.entries(group[item]).map((i)=>{
      return {[i[0]]:i[1][1]}
    })
    actual.unshift({'name':'Actual'})
    actual =  actual.reduce(function(result, current) {
      return Object.assign(result, current);
    }, {});

    var totalScheduledHours = Object.entries(group[item]).map((i)=>{
      return {[i[0]]:i[1][2]}
    })
    totalScheduledHours.unshift({'name':'Total Scheduled Hours'})
    totalScheduledHours =  totalScheduledHours.reduce(function(result, current) {
      return Object.assign(result, current);
    }, {});

    var scheduledTotalByWeek = 0;
    for (var key in totalScheduledHours) {
      if(typeof totalScheduledHours[key] !== "string"){ // Need to check because 'name' is of type 'string'
        scheduledTotalByWeek += Number.parseFloat(totalScheduledHours[key]);
      }
    };
    scheduled.hours = scheduledTotalByWeek

    console.log(totalScheduledHours,scheduledTotalByWeek)

    var totalActualHours = Object.entries(group[item]).map((i)=>{
      return {[i[0]]:i[1][3]}
    })
    // totalActualHours.name = 'Total Actual Hours'
    totalActualHours.unshift({'name':'Total Actual Hours'})
    totalActualHours =  totalActualHours.reduce(function(result, current) {
      return Object.assign(result, current);
    }, {});
    var actualTotalByWeek = 0;
    for (var key in totalActualHours) {
      if(typeof totalActualHours[key] !== "string"){
        actualTotalByWeek += Number.parseFloat(totalActualHours[key]);
      }
    };
    actual.hours = actualTotalByWeek

    console.log(totalActualHours,actualTotalByWeek)

    var hoursDiff = Object.entries(group[item]).map((i)=>{
      return {[i[0]]:getOverUnderStyle(i[1][4])}
    })
    hoursDiff.unshift({'name':'Time Difference'})
    hoursDiff.unshift({'hours':getOverUnderStyle(actualTotalByWeek - scheduledTotalByWeek)})
    hoursDiff =  hoursDiff.reduce(function(result, current) {
      return Object.assign(result, current);
    }, {});

    return [scheduled,actual,totalScheduledHours,totalActualHours,hoursDiff]
  }
  var _id = 0; 
  for (var g of Object.keys(group)){
    tabledata.push({
      'name':`<strong style='font-size:2em'>${g}</strong>`,
      'id':_id,
      '_children':getChildrenFromList(group,g),
      'formatter':"html"
    })
    _id++;
  }
  var cols = [];
  cols.push({title:"Name", field:"name",'formatter':'html'})
  cols.push({title:"Total Hours by Week", field:"hours",'formatter':'html','align':'center'})

  var dates_array = []; 
  var from = moment($('#from').val());
  var to = moment(from).add(7,'days')
  dates_array.push(from.toDate());
  for(i=1;i<7;i++){
    dates_array.push(moment(from).add(i,'days'));
  }
  dates_array.forEach( function(element, index) {
    weekday = moment(element).format('dddd')
    cols.push({title:`${weekday}<br/>${moment(element).format('MM/DD')}`,
               field:`${moment(element).format('MM/DD/YYYY')}`,
               formatter:"html",
               'align':'center'})
  });

  var table = new Tabulator("#main-table", {
    data:tabledata,           //load row data from array
    layout:"fitDataFill",      //fit columns to data 
    dataTreeCollapseElement:"<i class='fa fa-minus-square'></i>",
    dataTreeExpandElement:"<i class='fa fa-plus-square'></i>",
    dataTree:true,
    dataTreeStartExpanded:true,
    columns: cols,
    // groupBy:'name'
  });      

};
