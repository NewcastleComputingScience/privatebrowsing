// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Code adapted from Tab Inspector available at
// http://developer.chrome.com/extensions/samples.html#062d24295dce5def19f91da9c449e1e4

// Author: Matthew Forshaw
// Email: m.j.forshaw@ncl.ac.uk

tabs = {};
tabIds = [];

focusedWindowId = undefined;
currentWindowId = undefined;

function bootStrap() {
  chrome.windows.getCurrent(function(currentWindow) {
    currentWindowId = currentWindow.id;
    chrome.windows.getLastFocused(function(focusedWindow) {
      focusedWindowId = focusedWindow.id;
      loadWindowList();
    });
  });
}

function isInt(i) {
  return (typeof i == "number") && !(i % 1) && !isNaN(i);
}

function loadWindowList() {
  chrome.windows.getAll({ populate: true }, function(windowList) {
    tabs = {};
    tabIds = [];
    for (var i = 0; i < windowList.length; i++) {
      windowList[i].current = (windowList[i].id == currentWindowId);
      windowList[i].focused = (windowList[i].id == focusedWindowId);

      for (var j = 0; j < windowList[i].tabs.length; j++) {
        tabIds[tabIds.length] = windowList[i].tabs[j].id;
        tabs[windowList[i].tabs[j].id] = windowList[i].tabs[j];
      }
    }

    var input = new JsExprContext(windowList);
    var output = document.getElementById('windowList');
    jstProcess(input, output);
  });
}

function updateTabData(id) {
  var retval = {
    url: document.getElementById('url_' + id).value,
    selected: document.getElementById('selected_' + id).value ? true : false
  }

  return retval;
}

function updateTab(id){
  try {
    chrome.tabs.update(id, updateTabData(id));
  } catch (e) {
    alert(e);
  }
}

function moveTabData(id) {
  return {
    'index': parseInt(document.getElementById('index_' + id).value),
    'windowId': parseInt(document.getElementById('windowId_' + id).value)
  }
}
function moveTab(id) {
  try {
    chrome.tabs.move(id, moveTabData(id));
  } catch (e) {
    alert(e);
  }
}

function createTabData(id) {
  return {
    'index': parseInt(document.getElementById('index_' + id).value),
    'windowId': parseInt(document.getElementById('windowId_' + id).value),
    'index': parseInt(document.getElementById('index_' + id).value),
    'url': document.getElementById('url_' + id).value,
    'selected': document.getElementById('selected_' + id).value ? true : false
  }
}

function createTab() {
  var args = createTabData('new')

  if (!isInt(args.windowId))
    delete args.windowId;
  if (!isInt(args.index))
    delete args.index;

  try {
    chrome.tabs.create(args);
  } catch (e) {
    alert(e);
  }
}

function updateAll() {
  try {
    for (var i = 0; i < tabIds.length; i++) {
      chrome.tabs.update(tabIds[i], updateTabData(tabIds[i]));
    }
  } catch(e) {
    alert(e);
  }
}

function moveAll() {
  appendToLog('moving all');
  try {
    for (var i = 0; i < tabIds.length; i++) {
      chrome.tabs.move(tabIds[i], moveTabData(tabIds[i]));
    }
  } catch(e) {
    alert(e);
  }
}

function removeTab(tabId) {
  try {
    chrome.tabs.remove(tabId, function() {
      appendToLog('tab: ' + tabId + ' removed.');
    });
  } catch (e) {
    alert(e);
  }
}

// function appendToLog(logLine) {
// 	
// 	db.transaction(function (tx) {
// 	  tx.executeSql('SELECT * FROM LOGS', [], function (tx, results) {
// 	   var len = results.rows.length, i;
// 	   msg = "<p>Found rows: " + len + "</p>";
// 	   document.querySelector('#status').innerHTML +=  msg;
// 	   for (i = 0; i < len; i++){
// 		 msg = "<p>" + results.rows.item(i).id + " <b>" + results.rows.item(i).log + "</b></p>";
// 		 document.querySelector('#status').innerHTML +=  msg;
// 	   }
// 	 }, null);
// 	});
// 
// 
//   document.getElementById('log')
//       .appendChild(document.createElement('div'))
//       .innerText = "> " + logLine;
// }

function appendToLog(logLine) {
}

function clearLog() {
  document.getElementById('log').innerText = '';
}

chrome.windows.onCreated.addListener(function(createInfo) {
  appendToLog('windows.onCreated -- window: ' + createInfo.id);
  loadWindowList();
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  focusedWindowId = windowId;
  appendToLog('windows.onFocusChanged -- window: ' + windowId);
  loadWindowList();
});

chrome.windows.onRemoved.addListener(function(windowId) {
  appendToLog('windows.onRemoved -- window: ' + windowId);
  loadWindowList();
});

chrome.tabs.onCreated.addListener(function(tab) {
  appendToLog(
      'tabs.onCreated -- window: ' + tab.windowId + ' tab: ' + tab.id +
      ' title: ' + tab.title + ' index ' + tab.index + ' url ' + tab.url);
  loadWindowList();
});

chrome.tabs.onAttached.addListener(function(tabId, props) {
  appendToLog(
      'tabs.onAttached -- window: ' + props.newWindowId + ' tab: ' + tabId +
      ' index ' + props.newPosition);
  loadWindowList();
});

chrome.tabs.onMoved.addListener(function(tabId, props) {
  appendToLog(
      'tabs.onMoved -- window: ' + props.windowId + ' tab: ' + tabId +
      ' from ' + props.fromIndex + ' to ' +  props.toIndex);
  loadWindowList();
});

chrome.experimental.processes.onUpdatedWithMemory.addListener(function(processes) {


		 var table = "<table class=\"table table-striped table-bordered\">\n";
		 table +=        "<tr><td><b>Process</b></td>" +
        "<td>OS ID</td>" +
        "<td>Type</td>" +
        "<td>Tabs</td>" +
        "<td>CPU</td>" +
        "<td>Network</td>" +
        "<td>Private Memory</td>" +
        "<td>FPS</td>" +
        "<td>JS Memory</td>" +
        "<td></td>" +
        "</tr>\n";
	 //   table += templateData;
      for (pid in processes) {
        console.log("Calling displayProcessInfo for " + pid);
        //if (processes[pid].type === "renderer")
        //{
        	table = displayProcessInfo(processes[pid], table);
        //}
      }
      table += "</table>\n";
      var div = document.getElementById("process-list");
      div.innerHTML = table;
      localStorage["logs"] = table;
});

var isTabIncognito = new Array();


// Assumption: Tabs cannot become incognito?

function addTabToList(id)
{
    if (typeof isTabIncognito[id] !== 'undefined' && isTabIncognito[id] !== null) {
	}
	else
	{
	  localStorage["tabInformation"] += "New tab <i>" + id + "</i> created.";
	  isTabIncognito[id] = "<span style=\"color:red\">Yes</span>";
	}
}

function makeNoise(id, title, url)
{
	if (typeof isTabIncognito[id] !== 'undefined' && isTabIncognito[id] !== null) {
	  isTabIncognito[id] = "No, it's " + url + " with title " + title;
	}
	//else
	//{
	//  isTabIncognito[id] = "";
	//}
  //document.getElementById("div" + id).innerHTML = "actioned";
}

function getIsTabIncognito(id)
{
  if (typeof isTabIncognito[id] !== 'undefined' && isTabIncognito[id] !== null) {
    return isTabIncognito[id];
  }
  else
  {
	return "Unknown tab";
  }
}

function displayProcessInfo(process, table) {
  // Format network string like task manager
  var network = process.network;
  if (network > 1024) {
    network = (network / 1024).toFixed(1) + " kB/s";
  } else if (network > 0) {
    network += " B/s";
  } else if (network == -1) {
    network = "N/A";
  }

  
//  table +=
//    "<tr><td>" + process.id + "</td>" +
//    "<td>" + process.osProcessId + "</td>" +
//    "<td>" + process.type + "</td>" +
//    "<td>" + process.tabs + "</td>" +
//   "<td>" + process.cpu + "</td>" +
//    "<td>" + network + "</td>";

  table +=
    "<tr><td>" + process.id + "</td>" +
    "<td>" + process.osProcessId + "</td>" +
    "<td>" + process.type + "</td>";
  table += "<td>" + new String(process.tabs) + " <br/> ";
  
  if (new String(process.tabs).length > 0)
  {
	//table += "here";
	
    //table += "Length = " + process.tabs.length + "<br/>";
    
    for (counter=0; counter<process.tabs.length; counter++)
    {
      //table += "<div id=\"div" + process.tabs[counter] + "\"></div>" + getIsTabIncognito(process.tabs[counter]);
      
      table += "<p><b>" + process.tabs[counter] + "</b> :  " + getIsTabIncognito(process.tabs[counter]) + "</p><br/>";
      //table += typeof(process.tabs[counter]) + " and a ";
      addTabToList(process.tabs[counter]);
		//----
		
		//var tabList = JSON.parse(typeof localStorage['tabList'] == "undefined" ? null : localStorage['tabList']);
		
		//if (tabList == null)
		//{
		//	tabList = new Array();
		//}
		
		//alert(tabList);
		//tabList[process.tabs[counter]] = "Not sure";
		
		//localStorage["tabList"] = JSON.stringify(tabList);
		
		//----    
    
    //localStorage["tabList"][process.tabs[counter]] = "Unknown";
      
      chrome.tabs.get(process.tabs[counter],
		function(tab) {
			//localStorage["logs"] += process.tabs[counter] + " " + tab.title + "   <br/>";
			//localStorage["tabInformation"] += tab.id + " in";
			
			
			//localStorage["tabList"][process.tabs[counter]] = "Normal";
			//return false;
			
			
			//makeNoise(tab.id, tab.incognito, tab.incognito);
			//table += "asdf" + tab.incognito + "asdf";
			makeNoise(tab.id, tab.title, tab.url);
		});
		
		//localStorage["tabInformation"] += "<br/><b>" + process.tabs[counter] + "</b>";
    }
  }
  
  if (process.type === "renderer")
  {
	console.log(process.id + " is a renderer.");
  }
  
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  
  table += "</td>";
  
  table += "<td>" + process.cpu + "</td>" +
    "<td>" + network + "</td>";

  if ("privateMemory" in process) {
    table += "<td>" + (process.privateMemory / 1024) + "K</td>";
  } else {
    table += "<td>N/A</td>";
  }
  
  if ("fps" in process) {
    table += "<td>" + process.fps.toFixed(2) + "</td>";
  } else {
    table += "<td>N/A</td>";
  }

  if ("jsMemoryAllocated" in process) {
    var allocated = process.jsMemoryAllocated / 1024;
    var used = process.jsMemoryUsed / 1024;
    table += "<td>" + allocated.toFixed(2) + "K (" + used.toFixed(2) +
        "K live)</td>";
  } else {
    table += "<td>N/A</td>";
  }


  if (process.type === "renderer")
  {
    // Add details to process trace.
	document.querySelector('#tabTraces').innerHTML += new Date().getTime() + "," + process.id + "," + process.cpu
  														 + "," + process.network + "\n";
  }
  
  table +=
    "<td></td>" +
    "</tr>\n";
  return table;
}

function refreshTab(tabId) {
  chrome.tabs.get(tabId, function(tab) {
    var input = new JsExprContext(tab);
    var output = document.getElementById('tab_' + tab.id);
    jstProcess(input, output);
    appendToLog('tab refreshed -- tabId: ' + tab.id + ' url: ' + tab.url);
  });
}

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  appendToLog(
      'tabs.onUpdated -- tab: ' + tabId + ' status ' + props.status +
      ' url ' + props.url);
  refreshTab(tabId);
});

chrome.tabs.onDetached.addListener(function(tabId, props) {
  appendToLog(
      'tabs.onDetached -- window: ' + props.oldWindowId + ' tab: ' + tabId +
      ' index ' + props.oldPosition);
  loadWindowList();
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
  appendToLog(
      'tabs.onSelectionChanged -- window: ' + props.windowId + ' tab: ' +
      tabId);
  loadWindowList();
});

chrome.tabs.onRemoved.addListener(function(tabId) {
  appendToLog('tabs.onRemoved -- tab: ' + tabId);
  loadWindowList();
});

function createWindow() {
  var args = {
    'left': parseInt(document.getElementById('new_window_left').value),
    'top': parseInt(document.getElementById('new_window_top').value),
    'width': parseInt(document.getElementById('new_window_width').value),
    'height': parseInt(document.getElementById('new_window_height').value),
    'url': document.getElementById('new_window_url').value
  }

  if (!isInt(args.left))
    delete args.left;
  if (!isInt(args.top))
    delete args.top;
  if (!isInt(args.width))
    delete args.width;
  if (!isInt(args.height))
    delete args.height;
  if (!args.url)
    delete args.url;

  try {
    chrome.windows.create(args);
  } catch(e) {
    alert(e);
  }
}

function refreshWindow(windowId) {
  chrome.windows.get(windowId, function(window) {
    chrome.tabs.getAllInWindow(window.id, function(tabList) {
      window.tabs = tabList;
      var input = new JsExprContext(window);
      var output = document.getElementById('window_' + window.id);
      jstProcess(input, output);
      appendToLog(
          'window refreshed -- windowId: ' + window.id + ' tab count:' +
          window.tabs.length);
    });
  });
}

function updateWindowData(id) {
  var retval = {
    left: parseInt(document.getElementById('left_' + id).value),
    top: parseInt(document.getElementById('top_' + id).value),
    width: parseInt(document.getElementById('width_' + id).value),
    height: parseInt(document.getElementById('height_' + id).value)
  }
  if (!isInt(retval.left))
    delete retval.left;
  if (!isInt(retval.top))
    delete retval.top;
  if (!isInt(retval.width))
    delete retval.width;
  if (!isInt(retval.height))
    delete retval.height;

  return retval;
}

function updateWindow(id){
  try {
    chrome.windows.update(id, updateWindowData(id));
  } catch (e) {
    alert(e);
  }
}

function removeWindow(windowId) {
  try {
    chrome.windows.remove(windowId, function() {
      appendToLog('window: ' + windowId + ' removed.');
    });
  } catch (e) {
    alert(e);
  }
}

function refreshSelectedTab(windowId) {
  chrome.tabs.getSelected(windowId, function(tab) {
    var input = new JsExprContext(tab);
    var output = document.getElementById('tab_' + tab.id);
    jstProcess(input, output);
    appendToLog(
        'selected tab refreshed -- tabId: ' + tab.id + ' url:' + tab.url);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  bootStrap();
});


// ----------------------------------------------------------------------
// Start of WebDatabase code
//      http://www.tutorialspoint.com/html5/html5_web_sql.htm
// ----------------------------------------------------------------------

var dbLogTableAutonumber = 3;
var dbTabActivityTableAutonumber = 0;

var db = openDatabase('mydb3', '1.0', 'Test DB', 5 * 1024 * 1024);
var msg;
db.transaction(function (tx) {
  tx.executeSql('DROP TABLE LOGS');
  tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (id unique, log)');
  
  tx.executeSql('DROP TABLE IF EXISTS LOGS');
  tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (id unique, tabid, title, url, timestamp, cpu, network)');
});

db.transaction(function (tx) {
  tx.executeSql('SELECT * FROM LOGS', [], function (tx, results) {
   var len = results.rows.length, i;
   msg = "<p>Found rows: " + len + "</p>";
   document.querySelector('#status').innerHTML +=  msg;
   for (i = 0; i < len; i++){
     msg = "<p><b>" + results.rows.item(i).log + "</b></p>";
     document.querySelector('#status').innerHTML +=  msg;
   }
 }, null);
});




// ----------------------------------------------------------------------
// End of WebDatabase code.
// ----------------------------------------------------------------------