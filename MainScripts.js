var camlTreeController = function() {

  var rootNodeID = '';
  var camlTree = [];
  var uid;
  var paddingDelta;
  var listColumns;

  var listColumnTypes = ["Attachments", "Choice", "Computed", "Counter", "DateTime", "Lookup", "Note", "Text", "URL", "User", "WorkflowStatus"];
  var options;
  var init = function(o)
  {
    options = o;

    listColumns = options.columns;
    paddingDelta = options.paddingDelta
    addStartUpNode();
    attachHoverHandlers();
    attachValueChangeHandlers();
    attachButtonHandlers();
  }

  var addStartUpNode = function()
  {
    uid = generateRandomID();
    $("#" + options.containerID + "").append(generateCAMLClauseSection(uid));
    $("#" + options.containerID + "").append(generateRightButton());
    $("#" + options.containerID + "").append(generateBottomButton());

    addNodeToTree('clause', uid, null, []);
    rootNodeID = uid;

    //date picker init
    $("div[data-guid='" + uid + "'] .inputQueryValue").datepicker({
      todayBtn: "linked",
      autoclose: true,
      todayHighlight: true
    });

    $("div[data-guid='" + uid + "'] .inputQueryValue").datepicker("remove");
  }

  var addNodeToTree = function(type, identifier, parent, childNodes)
  {
    var newNode;

    if(type == 'clause')
    {
      newNode = {
        operator: false,
        operatorValue:null,
        columnInternalName: null,
        columnDisplayName: null,
        columnType: null,
        clauseOperator: null,
        clauseValue: null,
        id: identifier,
        parentNode: parent,
        childNodes: childNodes
      };
    }
    else if(type == 'operator')
    {
      newNode = {
        operator: true,
        operatorValue:"And",
        columnInternalName: null,
        columnDisplayName: null,
        columnType: null,
        clauseOperator: null,
        clauseValue: null,
        id: identifier,
        parentNode: parent,
        childNodes: childNodes
      }
    }
    camlTree.push(newNode);
  }

  //Handlers
  var attachHoverHandlers = function()
  {
    $(document).on("mouseenter",".operator select",function()
    {
      var currentNodeGuid = $(this).parent().attr("data-guid");
      var currentNode = getNode(currentNodeGuid);
      var childNodes = currentNode.childNodes;

      $("div[data-guid='" + childNodes[0] + "'] *").addClass("divfocus");
      $("div[data-guid='" + childNodes[1] + "'] *").addClass("divfocus");
      $(this).addClass("operatorfocus");
    });

    $(document).on("mouseleave",".operator select",function()
    {
      var currentNodeGuid = $(this).parent().attr("data-guid");
      var currentNode = getNode(currentNodeGuid);
      var childNodes = currentNode.childNodes;

      $("div[data-guid='" + childNodes[0] + "'] *").removeClass("divfocus");
      $("div[data-guid='" + childNodes[1] + "'] *").removeClass("divfocus");
      $(this).removeClass("operatorfocus");
    });

  }

  var attachValueChangeHandlers = function()
  {
    $(document).on("change",".selectQueryColumn",function()
    {
      var currentNodeGuid = $(this).parent().attr("data-guid");
      var currentNode = getNode(currentNodeGuid);

      currentNode.columnInternalName = $(this).val();
      currentNode.columnDisplayName = $(this).find(":selected").text();
      currentNode.columnType = $(this).find(":selected").attr('data-field-type');

      //Date Time formatting
      if($("div[data-guid='" + currentNodeGuid + "'] .selectQueryColumn option:selected").attr("data-field-type") == "DateTime")
      {
        $("div[data-guid='" + currentNodeGuid + "'] .inputQueryValue").datepicker("update");
      }
      else {
        $("div[data-guid='" + currentNodeGuid + "'] .inputQueryValue").datepicker("remove");
      }

      $("div[data-guid='" + currentNodeGuid + "'] .inputQueryValue").val('');
      currentNode.clauseValue = '';

    });

    $(document).on("change",".selectQueryOperator",function()
    {
      var currentNodeGuid = $(this).parent().attr("data-guid");
      var currentNode = getNode(currentNodeGuid);

      currentNode.clauseOperator = $(this).val();

      //Hide the input Field if IsNull or IsNotNull
      if($(this).val() == 'IsNull' || $(this).val() == 'IsNotNull')
      {
          $("div[data-guid='" + currentNodeGuid + "'] .inputQueryValue").val('');
          $("div[data-guid='" + currentNodeGuid + "'] .inputQueryValue").hide();
          currentNode.clauseValue = null;
      }
      else {
        //$("div[data-guid='" + currentNodeGuid + "'] .inputQueryValue").val('');
        $("div[data-guid='" + currentNodeGuid + "'] .inputQueryValue").show();
      }

    });

    $(document).on("change",".inputQueryValue",function()
    {
      var currentNodeGuid = $(this).parent().attr("data-guid");
      var currentNode = getNode(currentNodeGuid);

      currentNode.clauseValue = $(this).val();

      if($("div[data-guid='" + currentNodeGuid + "'] .selectQueryColumn option:selected").attr("data-field-type") == "DateTime")
      {
        if($(this).val() != "")
        {
          currentNode.clauseValue = $(this).datepicker('getUTCDate').toISOString();
        }
      }

    });

    $(document).on("change",".clauseJoinOperator",function()
    {
      var currentNodeGuid = $(this).parent().attr("data-guid");
      var currentNode = getNode(currentNodeGuid);

      currentNode.operator = true;
      currentNode.operatorValue = $(this).val();
    });
  }

  var attachButtonHandlers = function()
  {
    $(document).on("click",".addBottom",function()
    {
      var currentPadding;
      var lowestPadding = 10000;
      //move the entire structure to the right using padding
      $("#" + options.containerID + " div").each(function(index, val)
      {
        $(this).css("padding-left", "+=" + paddingDelta + "px");
        if(lowestPadding > (parseInt($(this).css("padding-left").replace("px",""))))
        {
          lowestPadding = (parseInt($(this).css("padding-left").replace("px","")))
        }
      });

      var opertoruid = generateRandomID();
      var clauseID = generateRandomID();
      var currentRootNodeID = rootNodeID;

      $(this).before(generateClauseJoinOperator(opertoruid, ''));
      $("#" + options.containerID + "").append(generateBottomButton());
      $(this).after(generateCAMLClauseSection(clauseID, '') + generateRightButton());

      var cPadding = lowestPadding + "px";

      $("#clause" + camlTree.length).css("padding-left", cPadding);
      $(this).remove();

      addNodeToTree('operator', opertoruid, null, [currentRootNodeID, clauseID]);
      addNodeToTree('clause', clauseID, opertoruid, []);

      //reassign the parent node
      camlTree = camlTree.map(function(node)
      {
        if(node.parentNode == null)
        {
          node.parentNode = opertoruid;
        }
        return node;
      });
      rootNodeID = opertoruid;

      $("div[data-guid='" + clauseID + "'] .inputQueryValue").datepicker({
        todayBtn: "linked",
        autoclose: true,
        todayHighlight: true
      });

      $("div[data-guid='" + clauseID + "'] .inputQueryValue").datepicker("remove");

    });

    $(document).on("click",".addRight",function()
    {
      var currentPadding = $(this).prev(".clauseSection").css("padding-left");
      var currentNodeID = $(this).prev(".clauseSection").attr("data-guid");
      var currentNode = getNode(currentNodeID);
      var currentNodeParent = getNode(currentNode.parentNode);

      var opertoruID = generateRandomID();
      var clauseID = generateRandomID();

      if(currentNodeParent != null)
      {
        var index = currentNodeParent.childNodes.indexOf(currentNode.id);
        if(index  > -1)
        {
          currentNodeParent.childNodes.splice(index, 1);
        }
        currentNodeParent.childNodes.push(opertoruID);
      }
      else {
        rootNodeID = opertoruID;
      }

      var newPadding = (parseInt(currentPadding.replace("px","")) + paddingDelta) + "px";
      $(this).after(generateCAMLClauseSection(currentNodeID, newPadding) + generateRightButton() + generateClauseJoinOperator(opertoruID, currentPadding) + generateCAMLClauseSection(clauseID, newPadding) + generateRightButton());
      $("div[data-guid='" + currentNodeID + "'] .selectQueryColumn").val( (currentNode.columnInternalName == null)? "select" : currentNode.columnInternalName );
      $("div[data-guid='" + currentNodeID + "'] .selectQueryOperator").val( (currentNode.clauseOperator == null)? "select" : currentNode.clauseOperator );
      if($("div[data-guid='" + currentNodeID + "'] .selectQueryColumn option:selected").attr('data-field-type') == "DateTime")
      {
          $("div[data-guid='" + currentNodeID + "'] .inputQueryValue").val($("div[data-guid='" + currentNodeID + "'] .inputQueryValue").val());
      }
      else {
          $("div[data-guid='" + currentNodeID + "'] .inputQueryValue").val((currentNode.clauseValue == null)? "" : currentNode.clauseValue);
      }


      //add two nodes
      //operator node
      addNodeToTree("operator", opertoruID, currentNode.parentNode, [currentNode.id, clauseID])
      currentNode.parentNode = opertoruID;
      addNodeToTree("clause", clauseID, opertoruID, []);
      $(this).prev(".clauseSection").remove();
      $(this).remove();

      $("div[data-guid='" + currentNodeID + "'] .inputQueryValue").datepicker({
        todayBtn: "linked",
        autoclose: true,
        todayHighlight: true
      });

      if($("div[data-guid='" + currentNodeID + "'] .selectQueryColumn option:selected").attr('data-field-type') != "DateTime")
      {
        $("div[data-guid='" + currentNodeID + "'] .inputQueryValue").datepicker("remove");
      }

      $("div[data-guid='" + clauseID + "'] .inputQueryValue").datepicker({
        todayBtn: "linked",
        autoclose: true,
        todayHighlight: true
      });

      $("div[data-guid='" + clauseID + "'] .inputQueryValue").datepicker("remove");

      //IsNull/IsNotNull case
      if(currentNode.clauseOperator == 'IsNull' || currentNode.clauseOperator == 'IsNotNull')
      {
        $("div[data-guid='" + currentNodeID + "'] .inputQueryValue").hide();
      }
    });
  }

  //CAML Generators
  function validateClauses()
  {
    var valid = true;
    for(j=0;j<camlTree.length;j++)
    {
      var currentNode = camlTree[j];
      if(!currentNode.operator)
      {
        //check column select
        if(currentNode.columnInternalName == null || currentNode.columnInternalName == 'select')
        {
          valid = false;
          invalidateField(currentNode.id, "selectQueryColumn");
        }
        if(currentNode.clauseOperator == null || currentNode.clauseOperator == 'select')
        {
          valid = false;
          invalidateField(currentNode.id, "selectQueryOperator");
        }
        if(currentNode.clauseValue == null || currentNode.clauseValue == '')
        {
          if(currentNode.clauseOperator != "IsNull" && currentNode.clauseOperator != "IsNotNull")
          {
            valid = false;
            invalidateField(currentNode.id, "inputQueryValue");
          }
        }
      }
    }
    return valid;
  }

  function invalidateField(id, className)
  {
    $("div[data-guid='" + id + "'] ." + className).css("box-shadow","0px 0px 8px red")
    window.setTimeout(function(){$("div[data-guid='" + id + "'] ." + className).css("box-shadow","")},2000);
  }

  function generateCAML(tree, startNodeGuid)
  {
    //find start Node
    var startNode = getNode(startNodeGuid);

    if(startNode.childNodes == null || startNode.childNodes.length == 0)
    {
      if(startNode.clauseOperator == 'IsNull' || startNode.clauseOperator == 'IsNotNull')
      {
          return "<" + startNode.clauseOperator + "><FieldRef Name='" + startNode.columnInternalName + "' /></" + startNode.clauseOperator + ">";
      }
      else {
        return "<" + startNode.clauseOperator + "><FieldRef Name='" + startNode.columnInternalName + "' /><Value Type='" + startNode.columnType + "'>" + startNode.clauseValue + "</Value></" + startNode.clauseOperator + ">";
      }

    }
    else {
        return "<" + startNode.operatorValue + ">" + generateCAML(tree, startNode.childNodes[0]) + generateCAML(tree, startNode.childNodes[1]) + "</" + startNode.operatorValue + ">";
    }

  }

  function generateCAMLFormatted(tree, startNodeGuid, tabs)
  {
    //find start Node
    var startNode = getNode(startNodeGuid);

    if(startNode.childNodes == null || startNode.childNodes.length == 0)
    {
      if(startNode.clauseOperator == 'IsNull' || startNode.clauseOperator == 'IsNotNull')
      {
        return addTabs(tabs) + "<" + startNode.clauseOperator + "><FieldRef Name='" + startNode.columnInternalName + "' /></" + startNode.clauseOperator + ">\n";
      }
      else {
          return addTabs(tabs) + "<" + startNode.clauseOperator + "><FieldRef Name='" + startNode.columnInternalName + "' /><Value Type='" + startNode.columnType + "'>" + startNode.clauseValue + "</Value></" + startNode.clauseOperator + ">\n";
      }

    }
    else {
        return addTabs(tabs) + "<" + startNode.operatorValue + ">\n" + generateCAMLFormatted(tree, startNode.childNodes[0], tabs+1) + generateCAMLFormatted(tree, startNode.childNodes[1], tabs+1) + addTabs(tabs) + "</" + startNode.operatorValue + ">\n";
    }
  }

  function generateJSOMCode(outputOptions)
  {
    var rowLimit = "";
    if(outputOptions.rowLimit)
    {
      rowLimit = "<RowLimit>" + outputOptions.rowLimit + "</RowLimit>";
    }

    var viewFields = "";
    if(outputOptions.viewFields.length != 0)
    {
      viewFields += ",'Include(";
      for(i=0;i<outputOptions.viewFields.length;i++)
      {
        if(i == (outputOptions.viewFields.length -1))
        {
          viewFields += outputOptions.viewFields[i];
        }
        else {
          viewFields += outputOptions.viewFields[i] + ",";
        }
      }
      viewFields += ")'"
    }

    var orderBy = "";
    if(outputOptions.orderBy.length != 0)
    {
      orderBy += "<OrderBy>";
      for(i=0;i<outputOptions.orderBy.length;i++)
      {
        orderBy += "<FieldRef Name='" + outputOptions.orderBy[i].field + "' Ascending='" + ((outputOptions.orderBy[i].direction == 'asc')? "TRUE":"FALSE") + "' />";
      }
      orderBy += "</OrderBy>";
    }

    var camlQuery = generateCAML(camlTree, rootNodeID, 0);
    //camlQuery = camlQuery.substring(0, str.length-1);

    var jsomCode ="function retrieveListItems() {\n" +
    "\tvar clientContext = SP.ClientContext.get_current();\n" +
    "\tvar oList = clientContext.get_web().get_lists().getByTitle('" + outputOptions.listTitle + "');\n" +
    "\tvar camlQuery = new SP.CamlQuery();\n" +
    "\tcamlQuery.set_viewXml(\"<View><Query><Where>" + camlQuery + "</Where>" + orderBy + "</Query>" + rowLimit + "</View>\");\n" +
    "\tthis.collListItem = oList.getItems(camlQuery);\n" +
    "\tclientContext.load(collListItem" + viewFields + ");\n" +
    "\tclientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));\n" +
    "}\n\n" +
    "function onQuerySucceeded(sender, args) {\n" +
    "\tvar listItemEnumerator = collListItem.getEnumerator();\n" +
    "\twhile (listItemEnumerator.moveNext()) {\n" +
    "\t\tvar oListItem = listItemEnumerator.get_current();\n" +
    "\t\tconsole.log(oListItem);\n" +
    "\t}\n" +
    "}\n\n" +
    "function onQueryFailed(sender, args) {\n" +
    "\tconsole.log('Request failed. ' + args.get_message());\n" +
    "}";

    return jsomCode;
  }

  function generateOutput(outputOptions)
  {
    if(validateClauses())
    {
      if(outputOptions.mode == "caml")
      {
        if(outputOptions.camlFormatted)
        {
          return generateCAMLFormatted(camlTree, rootNodeID, 0);
        }
        else {
          return generateCAML(camlTree, rootNodeID);
        }
      }
      else if(outputOptions.mode == "jsom")
      {
        return generateJSOMCode(outputOptions);
      }
    }
  }

  function addTabs(tabs)
  {
    var t = '';
    for(i=0;i<tabs;i++)
    {
      t += "\t";
    }
    return t;
  }

  //HTML generators
  function generateCAMLClauseSection(id, padding)
  {
    var paddingLeft = (padding == '') ? "" : "padding-left:" + padding;
    var camlClauseHTML = "<div class='clauseSection' id='clause" + camlTree.length +  "' data-guid='" + id + "' style='display:inline-block;" + paddingLeft + "'>" +
      "<select class='form-control selectQueryColumn' style='width: 220px;display:inline-block;'>" +
      generateColumnsOptions(listColumns) +
      "</select>" +
      "<select class='form-control selectQueryOperator' style='width: 120px;display:inline-block;'>" +
        "<option selected='selected' value='select'>Select</option>" +
        "<option value='Contains'>Contains</option>" +
        "<option value='Eq'>Eq</option>" +
        "<option value='Neq'>Neq</option>" +
        "<option value='Gt'>Gt</option>" +
        "<option value='Lt'>Lt</option>" +
        "<option value='Geq'>Geq</option>" +
        "<option value='Leq'>Leq</option>" +
        "<option value='IsNull'>IsNull</option>" +
        "<option value='IsNotNull'>IsNotNull</option>" +
        "<option value='BeginsWith'>BeginsWith</option>" +
      "</select>" +
      "<input class='form-control inputQueryValue' placeholder='Enter value' style='width: 200px;display:inline-block;'/>" +
      "</div>";

    return camlClauseHTML;
  }

  function generateRightButton()
  {
    var rightButtonHTML = "<button class='btn btn-primary addRight'>+</button>";
    return rightButtonHTML;
  }

  function generateBottomButton()
  {
    var bottomButtonHTML = "<button style='display:block' class='btn btn-primary addBottom'>+</button>";
    return bottomButtonHTML;
  }

  function generateClauseJoinOperator(opertorUid, padding)
  {
    var paddingLeft = (padding == '') ? "" : "padding-left:" + padding;
    var clauseJoinOperatorHTML = "<div class='operator' data-guid='" + opertorUid + "' style='" + paddingLeft + "'>" + "<select class='form-control clauseJoinOperator' style='width: 120px;display:inline-block;'><option value='And'>And</option><option value='Or'>OR</option></select></div>";
    return clauseJoinOperatorHTML;
  }

  function generateColumnsOptions(columnObjs)
  {
    var columnOptionsHTML = "";
    columnOptionsHTML += "<option value='select'>Select</option>";
    for(i=0;i<columnObjs.length;i++)
    {
      columnOptionsHTML += "<option value='" + columnObjs[i].internalName + "' data-field-type='" + columnObjs[i].type + "'>" + columnObjs[i].displayName + "</option>";
    }

    return columnOptionsHTML;
  }

  //Utility methods
  function generateRandomID()
  {
    var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var ID_LENGTH = 4;

    var randomID = '';
    for (var i = 0; i < ID_LENGTH; i++) {
      randomID += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }

    return randomID;
  }

  function getNode(identifier)
  {
    var node = camlTree.filter(function(node){
      return (node.id == identifier);
    });
    node = node[0];

    return node;
  }

  //expose public members
  var api = {
      init: init,
      generateOutput:generateOutput,
      validate:validateClauses,
  }

  return api;
}();

var mainController = function()
{
  var fields;
  var currentListTitle;
  var listNames;

  function init()
  {
    $.when(listOperations.getWebLists()).done(
      function(data)
      {
        var dataEnumerator = data.getEnumerator();
        listNames = [];
        while (dataEnumerator.moveNext())
        {
          var listItem = dataEnumerator.get_current();
          if(!listItem.get_hidden())
          {
            listNames.push(listItem.get_title());
          }
        }
        htmlReportManager.loadListSelector(listNames);
      }
    );

    $("#selectList").change(function()
    {
      if($(this).val() != "none")
      {
        currentListTitle = $("#selectList").val();
        $.when(listOperations.getFieldsforList(currentListTitle)).done(
          function(data)
          {
            var dataEnumerator = data.getEnumerator();
            fields = [];
            while (dataEnumerator.moveNext())
            {
              var item = dataEnumerator.get_current();
              if(!item.get_hidden())
              {
                var fieldItem = {
                  "internalName": item.get_internalName(),
                  "displayName": item.get_title(),
                  "type": item.get_typeAsString()
                }
                fields.push(fieldItem);
              }
            }
            fields = _.sortBy(_.uniq(fields,"displayName"),"displayName");

            camlTreeController.init({
              columns: fields,
              paddingDelta: 40,
              containerID:'mainContainer'
            });

          });
      }
    });

    $("#btnGenerate").click(function(e)
    {
      e.preventDefault();
      var options =
      {
        mode : 'caml',
        camlFormatted:true
      }
      $("#camlText").text(camlTreeController.generateOutput(options));

      options =
      {
        mode : "jsom",
        listTitle: currentListTitle,
        rowLimit:'',
        viewFields:[],
        orderBy:[]
      }
      $("#jsomText").text(camlTreeController.generateOutput(options));


    });

    $("#btnGetData").click(function(e)
    {
      e.preventDefault();

      var options =
      {
        mode : "caml",
        camlFormatted:false
      }

      var camlQuery = camlTreeController.generateOutput(options);

      options =
      {
        caml : camlQuery,
        listTitle :  currentListTitle,
        fields: fields
      }
      datatablesController.getData(options)

    });

  }

  var api =
  {
    init:init,
  }

  return api;

}();

var listOperations = function()
{
  function getListData(list,query,includeColumns) {

      var d = jQuery.Deferred();
      var clientContext = SP.ClientContext.get_current();
      var oList = clientContext.get_web().get_lists().getByTitle(list);
      var camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml("<View><Query><Where>" + query + "</Where></Query></View>");
      data = oList.getItems(camlQuery);


      if(includeColumns != '')
      {
        var includeString = "Include(";
        for(var i=0;i<includeColumns.length;i++)
        {
            if(i==includeColumns.length-1)
            {
              includeString += includeColumns[i];
            }
            else {
              includeString += includeColumns[i] + ",";
            }
        }
        includeString += ")";
        clientContext.load(data,includeString);
      }
      else {
          clientContext.load(data);
      }

      clientContext.executeQueryAsync(
        function()
        {
          d.resolve(data);
        },
        function()
        {
          d.reject();
        }
      );

      return d.promise();
  }

  function getWebLists() {
    var d = jQuery.Deferred();

    var clientContext = SP.ClientContext.get_current();
    data = clientContext.get_web().get_lists();
    clientContext.load(data);
    clientContext.executeQueryAsync(
      function()
      {
        d.resolve(data);
      },
      function()
      {
        d.reject();
      }
    );

    return d.promise();
  }

  function getFieldsforList(listName)
  {
    var d = jQuery.Deferred();
    var clientContext = SP.ClientContext.get_current();
    var list =  clientContext.get_web().get_lists().getByTitle(listName);
    data = list.get_fields();
    clientContext.load(data);
    clientContext.executeQueryAsync(
      function()
      {
        d.resolve(data);
      },
      function()
      {
        d.reject();
      }
    );

    return d.promise();
   }



  var api =
  {
    getListData:getListData,
    getFieldsforList:getFieldsforList,
    getWebLists:getWebLists
  }

  return api;

}();

var htmlReportManager = function()
{
  function loadListSelector(listNames)
  {
    var noneSelectedHMTL = "<option value='none' selected='selected'>None</option>";
    $("#selectList").append(noneSelectedHMTL);

    $(listNames).each(function(index,value){
      $("#selectList").append("<option value='" + value + "'>" + value + "</option>")
    });

    $("#listSelectLoader").hide();
    $("#selectList").removeAttr("disabled");
  }

  function loadFields(fields)
  {
    $("#columnSelect").empty();
    $("#rowSelect").empty();
    $("#selectQuery1Column").empty();
    $("#selectQuery2Column").empty();

    var noneSelectedHMTL = "<option value='none' selected='selected'>None</option>";
    $("#columnSelect").append(noneSelectedHMTL);
    $("#rowSelect").append(noneSelectedHMTL);
    $("#selectQuery1Column").append(noneSelectedHMTL);
    $("#selectQuery2Column").append(noneSelectedHMTL);

    $(fields).each(function(index,value)
    {
      $("#columnSelect").append("<option value='" + value.InternalName + "' data-field-type='" + value.FieldType + "'>" + value.DisplayName + "</option>");
      $("#rowSelect").append("<option value='" + value.InternalName + "' data-field-type='" + value.FieldType + "'>" + value.DisplayName + "</option>");

      if(value.FieldType == "Text" || value.FieldType == "Choice" || value.FieldType == "DateTime" || value.FieldType == "Integer"|| value.FieldType == "User")
      {
        $("#selectQuery1Column").append("<option value='" + value.InternalName + "' data-field-type='" + value.FieldType +  "'>" + value.DisplayName + "</option>");
        $("#selectQuery2Column").append("<option value='" + value.InternalName + "' data-field-type='" + value.FieldType +  "'>" + value.DisplayName + "</option>");
      }
    });

    $("#columnSelectLoader").hide();
    $("#rowSelectLoader").hide();

    $("#columnSelect").removeAttr("disabled");
    $("#rowSelect").removeAttr("disabled");
    $("#btnGetData").removeAttr("disabled");

    $("#linkFilterListData").show();
  }

  function getValue(arr)
  {
    return (arr == null) ? 0 : arr.length;
  }

  var api =
  {
    loadFields:loadFields,
    loadListSelector:loadListSelector
  }

  return api;
}();

var datatablesController = function()
{
  var jsonResultObjs = [];
  var columnNames = [];
  var dataTable = null;

  function getData(options)
  {
      $.when(listOperations.getListData(options.listTitle, options.caml,"")).done(
        function(data)
        {
          var dataEnumerator = data.getEnumerator();

          while (dataEnumerator.moveNext())
          {
            var currentItem = dataEnumerator.get_current();

            var columnDisplayName;
            var columnValue;

            var newItem = {}
            for(i=0;i<options.fields.length;i++)
            {
              try {
                  columnDisplayName = options.fields[i].displayName;
                  columnValue = currentItem.get_item(options.fields[i].internalName);

                  if(columnValue != null && typeof(columnValue.get_lookupValue) === "function")
                  {
                    columnValue = columnValue.get_lookupValue();
                  }

                  if(columnValue instanceof Date && !isNaN(columnValue.valueOf()))
                  {
                  	columnValue = $.format.date(columnValue ,"dd MMM yyyy");
                  }
                  newItem[columnDisplayName] = columnValue;

              }
              catch (e)
              {

              }
              finally
              {

              }
            }

          jsonResultObjs.push(newItem);
        }

        for(i=0;i<options.fields.length;i++)
        {
          columnNames.push({"mDataProp": options.fields[i].displayName,"sTitle": options.fields[i].displayName})
        }

        if(dataTable != null)
        {
          dataTable.destroy();
        }

        dataTable = $('#queryResultsTable').DataTable({
          "aaData": jsonResultObjs,
          "aoColumns": columnNames
        });
    });

  }

  var api =
  {
    getData : getData
  }

  return api;
}();
