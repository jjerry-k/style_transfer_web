//========================================================================
// Drag and drop image handling
//========================================================================

var stylefileDrag = document.getElementById("style-drag");
var stylefileSelect = document.getElementById("style-upload");
var contentfileDrag = document.getElementById("content-drag");
var contentfileSelect = document.getElementById("content-upload");

// Add event listeners
stylefileDrag.addEventListener("dragover", stylefileDragHover, false);
stylefileDrag.addEventListener("dragleave", stylefileDragHover, false);
stylefileDrag.addEventListener("drop", stylefileSelectHandler, false);
stylefileSelect.addEventListener("change", stylefileSelectHandler, false);

contentfileDrag.addEventListener("dragover", contentfileDragHover, false);
contentfileDrag.addEventListener("dragleave", contentfileDragHover, false);
contentfileDrag.addEventListener("drop", contentfileSelectHandler, false);
contentfileSelect.addEventListener("change", contentfileSelectHandler, false);

function stylefileDragHover(e) {
  // prevent default behaviour
  e.preventDefault();
  e.stopPropagation();

  stylefileDrag.className = e.type === "dragover" ? "upload-box dragover" : "upload-box";
}

function stylefileSelectHandler(e) {
  // handle file selecting
  var files = e.target.files || e.dataTransfer.files;
  stylefileDragHover(e);
  for (var i = 0, f; (f = files[i]); i++) {
    stylepreviewFile(f);
  }
}

function contentfileDragHover(e) {
  // prevent default behaviour
  e.preventDefault();
  e.stopPropagation();

  contentfileDrag.className = e.type === "dragover" ? "upload-box dragover" : "upload-box";
}

function contentfileSelectHandler(e) {
  // handle file selecting
  var files = e.target.files || e.dataTransfer.files;
  contentfileDragHover(e);
  for (var i = 0, f; (f = files[i]); i++) {
    contentpreviewFile(f);
  }
}

//========================================================================
// Web page elements for functions to use
//========================================================================

var styleimagePreview = document.getElementById("style-image");
var contentimagePreview = document.getElementById("content-image");
var imageDisplay = document.getElementById("image-display");
var styleCaption = document.getElementById("style-caption");
var contentCaption = document.getElementById("content-caption");
var predResult = document.getElementById("pred-result");
var loader = document.getElementById("loader");

//========================================================================
// Main button events
//========================================================================

function submitImage() {
  // action for the submit button
  console.log("submit");

  if (!contentimagePreview.src || !contentimagePreview.src.startsWith("data")) {
    window.alert("Please select an content image before submit.");
    return;
  }

  if (!styleimagePreview.src || !styleimagePreview.src.startsWith("data")) {
    window.alert("Please select an style image before submit.");
    return;
  }
  show(loader);
  // call the transfer function of the backend
  transferImage(contentimagePreview.src, styleimagePreview.src);
}

function clearImage() {
  // reset selected files
  stylefileSelect.value = "";
  contentfileSelect.value = "";

  // remove image sources and hide them
  styleimagePreview.src = "";
  contentimagePreview.src = "";
  imageDisplay.src = "";
  predResult.innerHTML = "";

  hide(styleimagePreview);
  hide(contentimagePreview);
  hide(imageDisplay);
  hide(loader);
  hide(predResult);
  show(styleCaption);
  show(contentCaption);

  imageDisplay.classList.remove("loading");
}

function stylepreviewFile(file) {
  // show the preview of the image
  console.log(file.name);
  var stylefileName = encodeURI(file.name);

  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    styleimagePreview.src = URL.createObjectURL(file);

    displayImage(reader.result, "style-image");
    hide(styleCaption);

    // reset
    // predResult.innerHTML = "";
    // imageDisplay.classList.remove("loading");

    // displayImage(reader.result, "image-display");
  };
}

function contentpreviewFile(file) {
  // show the preview of the image
  console.log(file.name);
  var contentfileName = encodeURI(file.name);

  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    // imagePreview.src = URL.createObjectURL(file);
    contentimagePreview.src = URL.createObjectURL(file);

    // show(imagePreview);
    displayImage(reader.result, "content-image");
    hide(contentCaption);

    // reset
    // predResult.innerHTML = "";
    // imageDisplay.classList.remove("loading");

    // displayImage(reader.result, "image-display");
  };
}

//========================================================================
// Helper functions
//========================================================================

function transferImage(contentimage, styleimage) {
  fetch("/transfer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "Content-Image": JSON.stringify(contentimage),
      "Style-Image": JSON.stringify(styleimage)
    })
    
})
    .then(resp => {
      if (resp.ok)
        resp.json().then(data => {
          // displayResult(data);
          displayImage(data.result, "image-display")
        });
    })
    .catch(err => {
      console.log("An error occured", err.message);
      window.alert("Oops! Something went wrong.");
    });
}

function displayImage(image, id) {
  // display image on given id <img> element
  hide(loader);
  let display = document.getElementById(id);
  display.src = image;
  show(display);
}

function displayResult(data) {
  // display the result
  // imageDisplay.classList.remove("loading");
  hide(loader);
  predResult.innerHTML = data.result;
  show(predResult);
}

function hide(el) {
  // hide an element
  el.classList.add("hidden");
}

function show(el) {
  // show an element
  el.classList.remove("hidden");
}