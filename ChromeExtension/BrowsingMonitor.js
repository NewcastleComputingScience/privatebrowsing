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

function appendToLog(action, logLine) {
  //document.getElementById('log')
  //    .appendChild(document.createElement('div'))
  //    .innerText = new Date().toUTCString() +"> " + logLine;
      
  var table = document.getElementById('activityTable');
  var rowCount = table.rows.length;
  var row = table.insertRow(rowCount);
      
  var timestampCell = row.insertCell(0);
  timestampCell.innerHTML = new Date().toUTCString();
  var actionCell = row.insertCell(1);
  actionCell.innerHTML = action;
  var detailsCell = row.insertCell(2);
  detailsCell.innerHTML = logLine;
}

chrome.windows.onCreated.addListener(function(createInfo) {
  appendToLog("windows.onCreated","Window " + createInfo.id + " created.");
  loadWindowList();
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  focusedWindowId = windowId;
  //	appendToLog('windows.onFocusChanged -- window: ' + windowId);
  if (windowId != -1)
  {
    appendToLog("windows.onFocusChanged","Chrome Window Id " + windowId + " is now in focus.");
  }
  else
  {
    appendToLog("windows.onFocusChanged","Chrome browser has lost focus.");
  }
  
  loadWindowList();
});

chrome.windows.onRemoved.addListener(function(windowId) {
  appendToLog("windows.onRemoved",'Window ' + windowId + " has been removed");
  loadWindowList();
});

chrome.tabs.onCreated.addListener(function(tab) {
  //appendToLog("tabs.onCreated",
  //  "Tab " + tab.id + " created in Window " + tab.windowId + "<br/>Title: " + tab.title + '<br/>' + ' Url: ' + tab.url);
  appendToLog("tabs.onCreated",
      "Tab " + tab.id + " created in Window " + tab.windowId + '<br/>' + ' Url: ' + tab.url);
  loadWindowList();
});

chrome.tabs.onAttached.addListener(function(tabId, props) {
  appendToLog(
      "tabs.onAttached","Tab " + tabId + " in Window: " + props.newWindowId 
      + " has been attached at position " + props.newPosition);
  loadWindowList();
});

chrome.tabs.onMoved.addListener(function(tabId, props) {
  appendToLog(
      "tabs.onMoved","Tab " + tabId + ' in Window ' + props.windowId +
      " has been moved from position " + props.fromIndex + " to " +  props.toIndex + ".");
  loadWindowList();
});

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  appendToLog("tabs.onUpdated","Tab " + tabId + " has been updated, with status " + props.status + ".");
});

chrome.tabs.onDetached.addListener(function(tabId, props) {
  appendToLog(
      "tabs.onDetached","Tab " + tabId + " has been detached.");
  loadWindowList();
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
  appendToLog(
      "tabs.onSelectionChanged","Tab " + tabId + " in Window " + props.windowId + " has been selected.");
  loadWindowList();
});

chrome.tabs.onRemoved.addListener(function(tabId) {
  appendToLog("tabs.onRemoved","Tab " + tabId + " has been removed.");
  loadWindowList();
});

document.addEventListener('DOMContentLoaded', function() {
  bootStrap();
});