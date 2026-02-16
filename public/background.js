// Background service worker for Chrome Extension
// Opens side panel when extension icon is clicked

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Error setting panel behavior:", error));

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("DevCenter extension installed");

  // Create context menu
  chrome.contextMenus.create({
    id: "openDevCenter",
    title: "Abrir DevCenter",
    contexts: ["all"],
  });
});

// Handle context menu clicks and shortcuts
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openDevCenter") {
    // This will open side panel
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

// Handle shortcuts if needed (though _execute_action handles toggle automatically)
// chrome.commands.onCommand.addListener((command) => {
//   if (command === "_execute_action") {
//     // For _execute_action, browser handles opening action (side panel) automatically
//     // due to setPanelBehavior above.
//   }
// });
