var UnRest = UnRest||{};

UnRest.ScriptLoader = function() {
    var prot = ("https:" === document.location.protocol ? "https://" : "http://");
    function completed(callback) {
        console.log('completed');
        callback();
    }

    function checkStateAndCall(path, callback) {
        var _success = false;
        return function() {
            if (!_success && (!this.readyState || (this.readyState == 'complete'))) {
                _success = true;
                console.log(path, 'is ready');
                callback();
            }
        };
    }

    function asyncLoadScripts(files, callback) {

        if (!files.length) {
            completed(callback);
        } else {
            var path = files.shift();

            var scriptElm;
console.log(path);
            if(path.endsWith('.js'))
            {
              scriptElm = document.createElement('script');
              scriptElm.type = 'text/javascript';
              scriptElm.async = 'async';
              scriptElm.src = prot + path;
            }
            else if (path.endsWith('.css'))
            {
              scriptElm = document.createElement('link');
              scriptElm.rel = 'stylesheet';
              scriptElm.href = prot + path;
            }

            scriptElm.onload = scriptElm.onreadystatechange = checkStateAndCall(path, function() {
                asyncLoadScripts(files, callback)
            }); // load next file in chain when
            var headElm = document.head || document.getElementsByTagName('head')[0];
            headElm.appendChild(scriptElm);
        }
    }

    return {
        asyncLoadScripts: asyncLoadScripts
    }
}();

function startUp()
{
  ExecuteOrDelayUntilScriptLoaded(init, "sp.js");
}

function init()
{
  var popUpHTML =
  "<nav class='navbar bg-primary'>" +
  "<div class='container-fluid'>" +
    "<div class='navbar-header'>" +
      "<button type='button' class='navbar-toggle collapsed' data-toggle='collapse' data-target='#bs-example-navbar-collapse-1' aria-expanded='false'>" +
        "<span class='sr-only'>Toggle navigation</span>" +
        "<span class='icon-bar'></span>" +
        "<span class='icon-bar'></span>" +
        "<span class='icon-bar'></span>" +
      "</button>" +
      "<span class='navbar-brand' href='#'>CAML Generator</span>" +
    "</div>" +
"</nav>" +
"<div id='container'>" +
  "<div class='well well-lg'>" +
    "<div id='listSelectDiv' class='selectDivs'>" +
      "<h4><span class='selectHeading'>Select List</span></h4>" +
      "<br />" +
      "<select id='selectList' class='form-control' style='width: 250px; display:inline-block;' disabled='disabled'>" +
      "</select>" +
      "<img src='https://team.thehub.xerox.com/sites/spomigration/SiteAssets/loading.gif' style='display:none;width:30px' id='listSelectLoader' />" +
    "</div>" +
  "</div>" +
"</div>" +
"<div class='well well-lg'>" +
  "<h4><span class='selectHeading'>Build Query</span></h4>" +
  "<div id='mainContainer'></div>" +
  "<br/>" +
  "<button id='btnGenerate' class='btn btn-info'>Generate</button>" +
"</div>" +
"<div class='well well-lg'>" +
  "<h4><span class='selectHeading'>Additional Options</span></h4>" +
  "<div class='checkbox'>" +
    "<label><input type='checkbox' value=''>Order By</label>" +
  "</div>" +
  "<div class='checkbox'>" +
     "<label><input type='checkbox' value=''>View fields</label>" +
   "</div>" +
   "<div class='checkbox'>" +
     "<label><input type='checkbox' value=''>Row Limit</label>" +
   "</div>" +
"</div>" +
"<div class='container-fluid'>" +
    "<div class='row'>" +
        "<div class='col-md-12'>" +
            "<div class='panel with-nav-tabs panel-primary'>" +
                "<div class='panel-heading'>" +
                        "<ul class='nav nav-tabs'>" +
                            "<li class='active'><a href='#tab1primary' data-toggle='tab'>CAML Query</a></li>" +
                            "<li><a href='#tab2primary' data-toggle='tab'>JavaScript</a></li>" +
                            "<li><a href='#tab3primary' data-toggle='tab'>jQuery</a></li>" +
                            "<li><a href='#tab4primary' data-toggle='tab'>REST</a></li>" +
                            "<li><a href='#tab5primary' data-toggle='tab'>CSOM</a></li>" +
                            "<li><a href='#tab6primary' data-toggle='tab'>PowerShell</a></li>" +
                        "</ul>" +
                "</div>" +
                "<div class='panel-body'>" +
                    "<div class='tab-content'>" +
                        "<div class='tab-pane fade in active' id='tab1primary'><textarea id='camlText' style='width:100%;overflow:auto;resize:none;height:200px;'></textarea></div>" +
                        "<div class='tab-pane fade' id='tab2primary'><textarea id='jsomText' style='width:100%;overflow:auto;resize:none;height:200px;'></textarea></div>" +
                        "<div class='tab-pane fade' id='tab3primary'>Primary 3</div>" +
                        "<div class='tab-pane fade' id='tab4primary'>Primary 4</div>" +
                        "<div class='tab-pane fade' id='tab5primary'>Primary 5</div>" +
                        "<div class='tab-pane fade' id='tab6primary'>Primary 6</div>" +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</div>" +
	  "</div>" +
"</div>" +
"<div class='well well-lg'>" +
  "<h4><span class='selectHeading'>Test Query</span></h4>" +
  "<button id='btnGetData' class='btn btn-info'>Get Data</button>" +
  "<br/>" +
  "<br/>" +
  "<table id='queryResultsTable' class='table table-striped table-bordered' cellspacing='0' width='100%'>" +
  "</table>" +
"</div>";

  var htmlElement = document.createElement('div');
  $(htmlElement).append(popUpHTML);

  var options = {
                  html: htmlElement,
                  autoSize: true,
                  allowMaximize: true,
                  title: 'UnRest',
                  showMaximized: true,
                  showClose: true,
                };

  var dialog = SP.UI.ModalDialog.showModalDialog(options);
  mainController.init();
}

//main method
var scripts = [
              "code.jquery.com/jquery-2.2.4.min.js",
              "cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js",
              "maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js",
              "cdn.datatables.net/1.10.15/js/jquery.dataTables.min.js",
              "cdn.datatables.net/1.10.15/js/dataTables.bootstrap.min.js",
              "netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css",
              "cdn.datatables.net/1.10.15/css/dataTables.bootstrap.min.css",
              "cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.6.4/js/bootstrap-datepicker.min.js",
              "cdn.rawgit.com/Maxeuz/HelloWorld/master/MainScripts.js",
              "cdn.rawgit.com/Maxeuz/HelloWorld/master/extrastyles.css"
            ];

UnRest.ScriptLoader.asyncLoadScripts(scripts, startUp);
