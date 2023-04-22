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


   // function readURL (input){
        //     if (input.files && input.files[0]){
        //        var reader = new FileReader()

        //        reader.onload =function(e){
        //         $("#imgPreview").attr("src", e.target.result).width(100).height(100)
        //        }
        //        reader.readAsDataURL(input.files[0])
        //     }
        // }
        // $("#img").change(function(){
        //     readURL(this)
        // })

     