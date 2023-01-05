chrome.action.onClicked.addListener(function () {
  chrome.windows.create({
    focused: true,
    width: 600,
    height: 1100,
    type: "popup",
    url: ["index.html"],
    top: 0,
    left: 0,
  });
});