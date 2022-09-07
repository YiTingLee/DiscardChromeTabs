const windows = {};
const diff = 10 * 60 * 1000;
const active = {};

const discard = () => {
  setTimeout(() => {
    discard();
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

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ discarded: false }, (tabs) => {
    tabs.forEach((tab) => {
      if (!windows[tab.windowId]) {
        windows[tab.windowId] = {};
      }
      windows[tab.windowId][tab.id] = new Date().getTime();
    });
  });
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (
    windows[activeInfo.windowId] &&
    windows[activeInfo.windowId][activeInfo.tabId]
  ) {
    delete windows[activeInfo.windowId][activeInfo.tabId];
  }

  if (active[activeInfo.windowId]) {
    windows[activeInfo.windowId][active[activeInfo.windowId]] =
      new Date().getTime();
  }

  active[activeInfo.windowId] = activeInfo.tabId;
});

discard();
