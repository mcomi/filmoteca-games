// select file input
const image = document.getElementById("imagen");
const alias = document.getElementById("alias");
const description = document.getElementById("description");
const btn = document.getElementById("uploadBtn");

const uploadFile = (e) => {
  e.preventDefault();
  // check file type
  const file = image.files[0];
  if (
    !["image/jpeg", "image/gif", "image/png", "image/svg+xml"].includes(
      file.type
    )
  ) {
    console.log("Only images are allowed.");
    return;
  }

  // check file size (< 2MB)
  if (file.size > 2 * 1024 * 1024) {
    console.log("File must be less than 2MB.");
    return;
  }

  // add file to FormData object
  const fd = new FormData();
  console.log(file, alias.value, description.value);
  fd.append("imagen", file);
  fd.append("alias", alias.value);
  fd.append("description", description.value);

  // send `POST` request
  fetch("http://localhost:8080/api/images", {
    method: "POST",
    body: fd,
  })
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch((err) => console.error(err));
};
