chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  addImagesToContainer(message);
  sendResponse("OK");
});

/**
 * Функция, генерирует HTML-разметку
 * списка изображений
 * @param {} urls - Массив путей к изображениям
 */
function addImagesToContainer(urls) {
  if (!urls || !urls.length) {
    return;
  }
  const container = document.querySelector(".container");
  urls.forEach((url) => addImageNode(container, url));
}

/**
 * Функция создает элемент DIV для каждого изображения
 * и добавляет его в родительский DIV.
 * Создаваемый блок содержит само изображение и флажок
 * чтобы его выбрать
 * @param {*} container - родительский DIV
 * @param {*} url - URL изображения
 */
function addImageNode(container, url) {
  const div = document.createElement("div");
  div.className = "imageDiv";
  const img = document.createElement("img");
  img.src = url;
  div.appendChild(img);
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.setAttribute("url", url);
  div.appendChild(checkbox);
  container.appendChild(div);
}

/**
 * Обработчик события "onChange" флажка Select All
 * Включает/выключает все флажки картинок
 */
document.getElementById("selectAll").addEventListener("change", (event) => {
  const items = document.querySelectorAll(".container input");
  for (let item of items) {
    item.checked = event.target.checked;
  }
});

/**
 * Обработчик события "onClick" кнопки Download.
 * Сжимает все выбранные картинки в ZIP-архив
 * и скачивает его.
 */
document.getElementById("downloadBtn").addEventListener("click", async () => {
  try {
    const urls = getSelectedUrls();
    const archive = await createArchive(urls);
    downloadArchive(archive);
  } catch (err) {
    alert(err.message);
  }
});

/**
 * Функция возвращает список URL всех выбранных картинок
 * @returns Array Массив путей к картинкам
 */
function getSelectedUrls() {
  const urls = Array.from(document.querySelectorAll(".container input"))
    .filter((item) => item.checked)
    .map((item) => item.getAttribute("url"));
  if (!urls || !urls.length) {
    throw new Error("Please, select at least one image");
  }
  return urls;
}

/**
 * Функция загружает картинки из массива "urls"
 * и сжимает их в ZIP-архив
 * @param {} urls - массив путей к картинкам
 * @returns BLOB-объект ZIP-архива
 */
async function createArchive(urls) {
  const zip = new JSZip();
  for (let index in urls) {
    try {
      const url = urls[index];
      const response = await fetch(url);
      const blob = await response.blob();
      zip.file(checkAndGetFileName(index, blob), blob);
    } catch (err) {
      console.error(err);
    }
  }
  return await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 9,
    },
  });
}

/**
 * Проверяет переданный объект blob, чтобы он был не пустой
 * картинкой и генерирует для него имя файла
 * @param {} index - Порядковый номер картинки в массиве
 * @param {*} blob - BLOB-объект с данными картинки
 * @returns string Имя файла с расширением
 */
function checkAndGetFileName(index, blob) {
  let name = parseInt(index) + 1;
  const [type, extension] = blob.type.split("/");
  if (type != "image" || blob.size <= 0) {
    throw Error("Incorrect content");
  }
  return name + "." + extension.split("+").shift();
}

/**
 * Функция генерирует ссылку на ZIP-архив
 * и автоматически ее нажимает что приводит
 * к скачиванию архива браузером пользователя
 * @param {} archive - BLOB архива для скачивания
 */
function downloadArchive(archive) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(archive);
  link.download = "images.zip";
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  document.body.removeChild(link);
}
