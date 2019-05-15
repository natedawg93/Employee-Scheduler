var css_files =['https://dl.dropboxusercontent.com/s/thqhda8nk5xl4ac/main.css?dl=1',
                'https://dl.dropboxusercontent.com/s/c6rm95oyq8zzjrz/daygrid_main.css?dl=1',
                'https://dl.dropboxusercontent.com/s/7qsnp5072jddkbj/timegrid_main.css?dl=1',
                'https://dl.dropboxusercontent.com/s/7nl45exb3rkwej3/list_main.css?dl=1',
                'https://dl.dropboxusercontent.com/s/inrtwvxx75qm2rs/timeline_main.css?dl=1',
                'https://dl.dropboxusercontent.com/s/04pcb19x53ua8js/resource_timeline_main.css?dl=1',
                "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"];
var js_files = ["https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js",
                "https://code.jquery.com/jquery-3.4.1.js",
               'https://dl.dropboxusercontent.com/s/96w8t0jng58rsyy/main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/ydkr12hihtuzfm2/interaction_main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/ivp8qfg7cu0azql/daygrid_main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/02zuvaflwou5ih3/timegrid_main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/bij4kyj0dab0wsx/list_main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/dtq2qpbpe11gapn/timeline_main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/3ocwfmn1gr9ajwd/resource_common_main.js?dl=1',
               'https://dl.dropboxusercontent.com/s/7m8eixl1zxtdj9t/resource_timeline_main.js?dl=1',
               "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.js"]; // Need to include moment.js for it to work

LazyLoad.css(css_files, function () { // Load all the CSS files using LazyLoad
    console.log('Loaded all CSS files');
});
LazyLoad.js(js_files, function () { // Load all the JS files using LazyLoad
    console.log('Loaded all JS files');
});

$(document).on('knack-view-render.view_69',function(event, scene) { // View 69 is the tasks list view
  getAllRecordsForObject('scene_7', 'view_69', handleData); // Get all the records for the specific scene and view
  $( "#view_69" ).append( "<div id='calendar'></div>" ); // Add the calendar div to the end of the view's div. Without this, it renders the calendar on all pages

});

/* Function to get all the records for an object*/
    function getAllRecordsForObject(sceneKey, viewKey, callbackFunctionToHandleData, currentPage = 1, totalPages, allRecordsForObject = []) {
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
          getAllRecordsForObject(sceneKey, viewKey, callbackFunctionToHandleData, currentPage, responseData.total_pages, allRecordsForObject);
          return;
        }
        // Handle ALL records with our callback function
        callbackFunctionToHandleData(allRecordsForObject);
      });
    };

    /* Function to handle the data*/
    function handleData(allRecordsForObject) {

     
      function parse_iso(iso_time){ // Function to remove the '.000Z' from the ISO string
        return String(iso_time).slice(0,-5);
      };


      let data = JSON.parse(JSON.stringify(allRecordsForObject));
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
                    color:'#7FFF00',
                    record_id:d[1].id
                    })
        events.push({id: String(c) + '_Actual',
                    resourceId: d[1].field_57 + '_Actual', 
                    start: parse_iso(d[1].field_67_raw.iso_timestamp), //Field_67 is the actual time
                    end: parse_iso(d[1].field_67_raw.to.iso_timestamp),
                    title: d[1].field_61,
                    color: '#FF0000',
                    record_id:d[1].id
                    })
        c += 1;
      }

      console.log([JSON.parse(JSON.stringify(people))]); // Debug output of records
      console.log([JSON.parse(JSON.stringify(events))]);
      
	  var today = new Date(Date.now());
      today = today.getFullYear()+'-'+("0" + (today.getMonth() + 1)).slice(-2)+'-'+today.getDate(); // Get the date in the format "YYYY-MM-DD"
      
      var calendarEl = document.getElementById('calendar');
      var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'list', 'resourceTimeline' ],
        now: String(today),
        editable: false, // enable draggable events
        aspectRatio: 2.0,
        scrollTime: '08:00', // undo default 6am scrollTime
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
  };



