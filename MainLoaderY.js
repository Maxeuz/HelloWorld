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
  var popUpHTML = "<div id='masterContainer'></div>";

  var htmlElement = document.createElement('div');
  htmlElement.insertAdjacentHTML('beforeend', popUpHTML)
  //$(htmlElement).append(popUpHTML);

  var options = {
                  html: htmlElement,
                  autoSize: true,
                  allowMaximize: true,
                  title: 'UnRest',
                  showMaximized: true,
                  showClose: true,
                };

  var dialog = SP.UI.ModalDialog.showModalDialog(options);
  ExecuteOrDelayUntilScriptLoaded(mainController.init, "sp.js");  
}

//main method
var scripts = [	'//cdn.rawgit.com/Maxeuz/HelloWorld/master/MainJSY.js',
		'//cdn.rawgit.com/Maxeuz/HelloWorld/master/MainCSSX.css'];

UnRest.ScriptLoader.asyncLoadScripts(scripts, startUp);
