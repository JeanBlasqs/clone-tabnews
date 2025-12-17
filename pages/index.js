function createFlower() {
  var flower = document.createElement("div");
  flower.className = "flower";

  flower.style.left = Math.random() * window.innerWidth + "px";
  flower.style.animationDuration = (8 + Math.random() * 6) + "s";

  // pétalas
  for (var i = 0; i < 8; i++) {
    var petal = document.createElement("div");
    petal.className = "petal";
    petal.style.transform =
      "rotate(" + (i * 45) + "deg) translateZ(20px)";
    flower.appendChild(petal);
  }

  // centro
  var center = document.createElement("div");
  center.className = "center";
  flower.appendChild(center);

  document.body.appendChild(flower);

  setTimeout(function () {
    flower.remove();
  }, 15000);
}

// cria flores continuamente
setInterval(createFlower, 2000);
