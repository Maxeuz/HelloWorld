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
  var popUpHTML = "<div class='modal fade' id='camlGenModal' role='dialog'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal'>&times;</button></div><div class='modal-body'><div id='masterContainer'></div></div><div class='modal-footer'></div></div></div></div>";
  document.body.innerHTML += popUpHTML;
  $('#camlGenModal').modal('show');
  ExecuteOrDelayUntilScriptLoaded(mainController.init, "sp.js");
}

//main method
var scripts = [	'//cdn.rawgit.com/Maxeuz/HelloWorld/master/SuperJS.js',
		'//cdn.rawgit.com/Maxeuz/HelloWorld/master/SuperCSS.css'];

UnRest.ScriptLoader.asyncLoadScripts(scripts, startUp);
