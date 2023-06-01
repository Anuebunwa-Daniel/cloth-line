const confirmationLinks = document.querySelectorAll('a.confirmDeletion');
confirmationLinks.forEach(link => {
  link.addEventListener('click', event => {
    if (!confirm('Confirm deletion')) {
      event.preventDefault();
    }
  });
});

const previewImage = (event) => {
  const imageFiles = event.target.files;
  const imageFilesLength = imageFiles.length;

  if (imageFilesLength > 0) {
      const imageSrc = URL.createObjectURL(imageFiles[0]);

      const imgPreview = document.querySelector('#imgPreview');

      imgPreview.src = imageSrc;

      imgPreview.style.display = "block";
      imgPreview.style.height = "80px";
      imgPreview.style.width = "80px";



  }
}


     