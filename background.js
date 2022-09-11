const windows = {};
const diff = 10 * 60 * 1000;
const refreshTime = 60 * 60 * 1000;
const active = {};

const registerTabs = () => {
  chrome.tabs.query({}, (tabs) => {
    console.log("register!");
    tabs.forEach((tab) => {
      if (!windows[tab.windowId]) {
        windows[tab.windowId] = {};
      }
      windows[tab.windowId][tab.id] = new Date().getTime();
    });
  });
};

const discardTabsCronJob = () => {
  setInterval(() => {
    console.log("discard");
    console.log("windows: ", windows);
    const time = new Date().getTime();
    Object.keys(windows).forEach((windowId) => {
      Object.keys(windows[windowId]).forEach((tabId) => {
        if (time - windows[windowId][tabId] > diff) {
          chrome.tabs.discard(tabId);
          delete windows[windowId][tabId];
        }
      });
    });
  }, diff);
};

const registerTabsCronJob = () => {
  setInterval(() => {
    registerTabs();
  }, refreshTime);
};

chrome.runtime.onInstalled.addListener(() => {
  registerTabs();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (
    windows[activeInfo.windowId] &&
    windows[activeInfo.windowId][activeInfo.tabId] &&
    active[activeInfo.windowId] !== activeInfo.tabId
  ) {
    delete windows[activeInfo.windowId][activeInfo.tabId];
  }

  if (active[activeInfo.windowId]) {
    if (!windows[activeInfo.windowId]) {
      windows[activeInfo.windowId] = {};
    }
    windows[activeInfo.windowId][active[activeInfo.windowId]] =
      new Date().getTime();
  }

  active[activeInfo.windowId] = activeInfo.tabId;
});

discardTabsCronJob();
registerTabsCronJob();
console.log("start");
