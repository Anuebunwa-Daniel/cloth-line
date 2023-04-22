$('.pro').owlCarousel({
  loop:true,
  margin:10,
  autoplay: true,
  autoplayTimeout: 3000,
  nav:true,
  responsive:{
      0:{
          items:1
      },
      600:{
          items:1
      },
      1000:{
          items:3
      }
  }
})

$('.testit').owlCarousel({
    loop:true,
    margin:10,
    autoplay: true,
    autoplayTimeout: 3000,
    nav:true,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:1
        },
        1000:{
            items:1
        }
    }
  })

// const owlCarousel = document.querySelector('.owl-carousel');

// if (owlCarousel) {
//   const owl = new OwlCarousel({
//     loop: true,
//     margin: 10,
//     autoplay: true,
//     autoplayTimeout: 3000,
//     nav: true,
//     responsive: {
//       0: {
//         items: 1
//       },
//       600: {
//         items: 3
//       },
//       1000: {
//         items: 3
//       }
//     }
//   });
// }
