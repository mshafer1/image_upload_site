function init() {
  console.log("loading...");
  const form = document.querySelector("form"),
    fileInput = document.querySelector(".file-input"),
    progressArea = document.querySelector(".progress-area"),
    uploadedArea = document.querySelector(".uploaded-area");

  form.addEventListener("click", () => {
    fileInput.files = null;
    fileInput.click();
  });

  fileInput.onchange = ({ target }) => {
    console.log(target.files);
    for (const file of target.files) {
      if (file) {
        console.log("uploading file:", file.name);
        uploadFile(file);
      }
    }
  };

  const dropZone = document.getElementById("drop-zone");

  dropZone.addEventListener("drop", dropHandler);

  window.addEventListener("drop", (e) => {
    if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
      e.preventDefault();
    }
  });

  dropZone.addEventListener("dragover", (e) => {
    const fileItems = [...e.dataTransfer.items].filter(
      (item) => item.kind === "file"
    );
    if (fileItems.length > 0) {
      e.preventDefault();
      if (fileItems.some((item) => item.type.startsWith("image/"))) {
        e.dataTransfer.dropEffect = "copy";
      } else {
        e.dataTransfer.dropEffect = "none";
      }
    }
  });

  window.addEventListener("dragover", (e) => {
    const fileItems = [...e.dataTransfer.items].filter(
      (item) => item.kind === "file"
    );
    if (fileItems.length > 0) {
      e.preventDefault();
      if (!dropZone.contains(e.target)) {
        e.dataTransfer.dropEffect = "none";
      }
    }
  });

  function dropHandler(ev) {
    ev.preventDefault();
    console.log(ev.dataTransfer.items);
    const files = [...ev.dataTransfer.items].map((item) => item.getAsFile());
    console.log("files:", files);

    for (const file of files) {
      if (file) {
        console.log("uploading file:", file.name);
        uploadFile(file);
      }
    }
  }

  function addProgressBar(name, namePreview, _id, preview_img) {
    let fileLoaded = 0;
    let progressHTML = `
      <li class="row" id="${_id}">
          <img src="${preview_img.src}" style="max-height: 40px; width: auto; max-width: 40px;" alt=""></img>
          <div class="content">
              <div class="details">
                  <span class="name" title="${name}">${namePreview}<br/>Uploading</span>
                  <span class="percent">${fileLoaded}%</span>
              </div>
              <div class="progress-bar">
                  <div class="progress" style="width: ${fileLoaded}%"></div>
              </div>
          </div>
      </li>`;
    uploadedArea.classList.add("onprogress");
    progressArea.insertAdjacentHTML("afterbegin", progressHTML);
  }

  function updateProgressBar(
    name,
    namePreview,
    _id,
    loaded,
    total,
    preview_img
  ) {
    let fileLoaded = Math.floor((loaded / total) * 100);
    let progressHTML = `
      <img src="${preview_img.src}" style="max-height: 40px; width: auto; max-width: 40px;" alt=""></img>
      <div class="content">
          <div class="details">
              <span class="name" title="${name}">${namePreview}<br/>Uploading</span>
              <span class="percent">${fileLoaded}%</span>
          </div>
          <div class="progress-bar">
              <div class="progress" style="width: ${fileLoaded}%"></div>
          </div>
      </div>`;
    document.getElementById(_id).innerHTML = progressHTML;
  }

  function setProgressBarDone(
    name,
    namePreview,
    _id,
    fileSize,
    successful,
    previewImg
  ) {
    resultIcon = successful ? "fa-check" : "fa-times";
    let progressHTML = `
      <img src="${previewImg.src}" style="max-height: 40px; width: auto; max-width: 40px;" alt=""></img>
      <div class="content upload">
          <div class="details" style="padding-right: 5px">
              <span class="name" title="${name}">${namePreview}<br/>Uploaded</span>
              <span class="size">${fileSize}</span>
          </div>
      </div>
      <i class="fas ${resultIcon}"></i>`;
    uploadedArea.classList.remove("onprogress");
    document.getElementById(_id).innerHTML = progressHTML;
  }

  function uploadFile(file) {
    let name = file.name;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/");
    let namePreview = name;
    if (name.length > 12) {
      let shortname = name.split(".");
      namePreview = shortname[0].substring(0, 13) + "... ." + shortname[1];
    }
    var reader = new FileReader();
    let previewImg = document.createElement("img");
    reader.onloadend = function () {
      previewImg.src = reader.result;
    };
    reader.readAsDataURL(file);
    let _id = Math.random().toString(36).substring(2, 9);
    console.log("prepping to upload", file);
    addProgressBar(name, namePreview, _id, previewImg);

    let fileSize;
    file.size < 1024
      ? (fileSize = file.size + " KB")
      : (fileSize = (file.size / (1024 * 1024)).toFixed(2) + " MiB");

    xhr.upload.addEventListener("progress", ({ loaded, total }) => {
      let fileLoaded = Math.floor((loaded / total) * 100);
      let fileTotal = Math.floor(total / 1000);
      fileTotal < 1024
        ? (fileSize = fileTotal + " KB")
        : (fileSize = (loaded / (1024 * 1024)).toFixed(2) + " MiB");

      updateProgressBar(
        name,
        namePreview,
        _id,
        fileLoaded,
        fileTotal,
        previewImg
      );

      if (loaded == total) {
        setProgressBarDone(name, namePreview, _id, fileSize, true, previewImg);
      }
    });
    xhr.onload = () => {
      console.log(xhr);
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("Upload successful");
        return;
      }
      console.log("Upload failed");
      setProgressBarDone(name, namePreview, _id, fileSize, false, previewImg);
    };
    let data = new FormData();
    data.append("pic", file);
    xhr.send(data);
  }
}

document.addEventListener("DOMContentLoaded", init);
