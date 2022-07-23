const dotImgFile = ["front1.png", "front2.png", "left1.png",
             "left2.png", "back1.png", "back2.png",
             "kick.png", "atack.png", "chant.png", 
             "damaged.png", "danger.png", "fainted.png"];

const walkImg = ["left1.png", "left2.png"];

function picRandom(id, dotImgPath) {
  'use strict';
  // 乱数生成
  let randNum = Math.floor(Math.random() * dotImgFile.length)
  // 画像選択
  let elem = document.getElementById(id);
  elem.src = dotImgPath + dotImgFile[randNum];
  // 1秒ごとに実行
  setTimeout(function(){picRandom(id, dotImgPath)}, 1000);
}

function walk(id, dotImgPath, index) {
  'use strict';
  // カウントが最大になれば初期値に戻す
  if (index == walkImg.length) index = 0;
  let elem = document.getElementById(id);
  elem.src = dotImgPath + walkImg[index];
  index++
  //1秒ごとに実行
  setTimeout(function(){walk(id, dotImgPath, index)}, 1000);
}