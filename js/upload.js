// select file input
const image = document.getElementById("imagen");
const description = document.getElementById("description");
const btn = document.getElementById("uploadBtn");

const uploadFile = (e) => {
  e.preventDefault();
  // check file type
  const file = image.files[0];
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    toastr.error("No es un formato válido, solo JPG o PNG");
    return;
  }

  // check file size (< 2MB)
  if (file.size > 2 * 1024 * 1024) {
    toastr.error("El archivo es muy grande, sólo 2MB máximo");
    console.log("File must be less than 2MB.");
    return;
  }

  // add file to FormData object
  const fd = new FormData();
  console.log(file, description.value);
  fd.append("imagen", file);
  fd.append("description", description.value);

  // send `POST` request
  fetch("http://localhost:8080/api/images", {
    method: "POST",
    body: fd,
  })
    .then((res) => res.json())
    .then((json) => toastr.success(json.message))
    .catch((err) => toastr.error("Ocurrió un error, intenta de nuevo"));
};

toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: "toast-bottom-center",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};
