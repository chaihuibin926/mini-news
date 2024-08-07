
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })

// chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//   await chrome.sidePanel.setOptions({
//     tabId,
//     path: 'index.html',
//     enabled: true
//   });
// });