let name = "shiro"; 
let isCat = false  ;


function changePic() {
  const img = document.getElementById('myImage');
  if (isCat) {
    img.src = "assets/images/dog.jpg";
  } else {
    img.src = "assets/images/cat.jpg";
  }
  isCat = !isCat;
}
setInterval(changePic, 1000);  