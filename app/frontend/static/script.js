function init() {
  console.log("loading...");
  const form = document.querySelector("form"),
    fileInput = document.querySelector(".file-input"),
    progressArea = document.querySelector(".progress-area"),
    uploadedArea = document.querySelector(".uploaded-area");

  form.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.onchange = ({ target }) => {
    let file = target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

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
    let img = document.createElement("img");
    reader.onloadend = function() {
            img.src = reader.result;
    }
    reader.readAsDataURL(file);
    xhr.upload.addEventListener("progress", ({ loaded, total }) => {
      let fileLoaded = Math.floor((loaded / total) * 100);
      let fileTotal = Math.floor(total / 1000);
      let fileSize;
      fileTotal < 1024
        ? (fileSize = fileTotal + " KB")
        : (fileSize = (loaded / (1024 * 1024)).toFixed(2) + " MB");
      let _id=Math.random().toString(36).substring(2, 9);
      let progressHTML = `
        <li class="row">
            <img src="${img.src}" style="max-height: 40px; width: auto; max-width: 40px;" alt=""></img>
            <div class="content">
                <div class="details">
                    <span class="name" title="${name}">${namePreview} • Uploading</span>
                    <span class="percent">${fileLoaded}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${fileLoaded}%"></div>
                </div>
            </div>
        </li>`;
      uploadedArea.classList.add("onprogress");
      progressArea.innerHTML = progressHTML;
      

      if (loaded == total) {
        progressArea.innerHTML = "";
        let uploadedHTML = `
            <li class="row">
                <div class="content upload">
                    <img src="${img.src}" style="max-height: 40px; width: auto; max-width: 40px;" alt=""></img>
                    <div class="details">
                        <span class="name" title="${name}">${namePreview} • Uploaded</span>
                        <span class="size">${fileSize}</span>
                    </div>
                </div>
                <i class="fas fa-check"></i>
            </li>`;
        uploadedArea.classList.remove("onprogress");
        uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
      }
    });
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("Upload successful");
        return;
      }
      console.log("Upload failed");
      let failedHtml = `
            <li class="row">
                <div class="content upload">
                    <i class="fas fa-file-alt"></i>
                    <div class="details">
                        <span class="name">${name} • Failed</span>
                        <span class="size">&nbsp;</span>
                    </div>
                </div>
                <i class="fas fa-times"></i>
            </li>`;
      uploadedArea.classList.remove("onprogress");
      uploadedArea.insertAdjacentHTML("afterbegin", failedHtml);
    };
    let data = new FormData(form);
    xhr.send(data);
  }
}

document.addEventListener("DOMContentLoaded", init);
