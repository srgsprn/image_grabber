const grabBtn = document.getElementById("grabBtn");
grabBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true }, function (tabs) {
    var tab = tabs[0];
    if (tab) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id, allFrames: true },
          func: grabImages,
        },
        onResult
      );
    } else {
      alert("There are no active tabs");
    }
  });
});

function execScript(tab) {
  // Выполнить функцию на странице указанной вкладки
  // и передать результат ее выполнения в функцию onResult
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id, allFrames: true },
      func: grabImages,
    },
    onResult
  );
}

function grabImages() {
  const images = document.querySelectorAll("img");
  return Array.from(images).map((image) => image.src);
}

function grabImages() {
  const images = document.querySelectorAll("img");
  return Array.from(images).map((image) => image.src);
}

function onResult(frames) {
  if (!frames || !frames.length) {
    alert("Could not retrieve images from specified page");
    return;
  }
  const imageUrls = frames
    .map((frame) => frame.result)
    .reduce((r1, r2) => r1.concat(r2));
  openImagesPage(imageUrls);
}

function openImagesPage(urls) {
  chrome.tabs.create({ url: "page.html", active: false }, (tab) => {
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, urls, (resp) => {
        chrome.tabs.update(tab.id, { active: true });
      });
    }, 500);
  });
}
