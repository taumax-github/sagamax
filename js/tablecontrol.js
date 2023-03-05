//===============================================================
//  フィルタテーブルの共通変数　設定要！
//===============================================================
//  var gTabldID = 'filterableTable';  // テーブルのエリアのIDを設定
var filterableTabldID = 'sortableTable';  // テーブルのエリアのIDを設定
var gTfStartRow = 0;
var gTfColList  = [];             // ボタンが配置されている列番号
var gTfListSave = {};             // フィルタリストの保存状態
var gTabldIDList = ['sortableTable'];  // テーブルのエリアのIDを設定
var gSortNum = 1;              // 1 : 数値に見える列は数値でソート
var gSortAa  = 1;              // 1 : 英大文字と小文字を区別しない
var gSortBtnRow = 0;

//===============================================================
// テーブルの初期設定
//===============================================================
function tFilterInit() {
  var wTABLE  = document.getElementById(filterableTabldID);
  var wTR     = wTABLE.rows;
  var wAddBtn = '';

  // テーブル内をフィルタボタンを付ける
  for (var i=0; i < wTR.length; i++) {
    var wTD     = wTABLE.rows[i].cells;
    for (var j=0; j < wTD.length; j++) {
      // 「」の定義があるセルを対象とする
      if (wTD[j].getAttribute('cmanFilterBtn') !== null) {
        // フィルタ対象はボタンの次の行から
        gTfStartRow = i + 1;

        // ボタンを追加（画像はsvgを使用）
        wAddBtn  = '<div class="tfArea">';
        wAddBtn += '<svg class="tfImg" id="tsBtn_'+j+'" onclick="tFilterCloseOpen('+j+')"><path d="M0 0 L9 0 L6 4 L6 8 L3 8 L3 4Z"></path></svg>';
        wAddBtn += '<div class="tfList" id="tfList_'+j+'" style="display:none">';
        wAddBtn += tFilterCreate(j);
        wAddBtn += '</div>';
        wAddBtn += '</div>';
        wTD[j].innerHTML = wTD[j].innerHTML+wAddBtn;
  
        // フィルタボタンなる列を保存
        gTfColList.push(j);
      }
    }

    // ボタンを付けたら以降の行は無視する
    if (wAddBtn != '') {
      gSortBtnRow = i;
      break;
    }
  }
}
 
//===============================================================
// 指定列のフィルタリスト作成
//===============================================================
function tFilterCreate(argCol) {
  var wTABLE    = document.getElementById(filterableTabldID);
  var wTR       = wTABLE.rows;
  var wItem     = [];              // クリックされた列の値
  var wNotNum   = 0;               // 1 : 数字でない
  var wItemSave = {};              // フィルタに設定した値がキー
  var rcList    = '';              // 返すフィルタリスト
  
  // クリックされた列の値を取得する
  for (var i=gTfStartRow; i < wTR.length; i++) {
    var j = i - gTfStartRow;

    wItem[j] = wTR[i].cells[argCol].innerText.toString();

    if (wItem[j].match(/^[-]?[0-9,\.]+$/)) {
    } else {
      wNotNum = 1;
    }
  }

  // 列の値でソートを実行
  if (wNotNum == 0) {
    // 数値で昇順
    wItem.sort(sortNumA);
  } else {
    // 文字で昇順
    wItem.sort(sortStrA);
  }
  
  // 「すべて」のチェックボックス作成
  var wItemId =  id='tfData_ALL_'+argCol;

  rcList += '<div class="tfMeisai">';
  rcList += '<input type="checkbox" id="'+wItemId+'" checked onclick="tFilterAllSet('+argCol+')">';
  rcList += '<label for="'+wItemId+'">(すべて)</label>';
  rcList += '</div>';

  // 列の値でフィルタのチェックボックスを作成する
  // チェックボックスはformで囲む
  rcList += '<form name="tfForm_'+argCol+'">';

  for (var i=0; i < wItem.length; i++) {

    wVal = trim(wItem[i]);
  
    if (wVal in wItemSave) {
      // 値でチェックボックスが作成されている(重複) 
    } else {
      // ---チェックボックスの作成
      wItemId =  id='tfData_'+argCol+'_r'+i;
      rcList += '<div class="tfMeisai">';
      rcList += '<input type="checkbox" id="'+wItemId+'" value="'+wVal+'" checked onclick="tFilterClick('+argCol+')">';
      rcList += '<label for="'+wItemId+'">'+( wVal=='' ? '(空白)' : wVal )+'</label>';
      rcList += '</div>';
  
      // 重複判定用にチェックボックスの値を保存
      wItemSave[wVal]='1';
    }
  }
  rcList += '</form>';
  
  // 文字抽出のinputを作成
  rcList += '<div class="tfInStr">';
  rcList += '<input type="text" placeholder="含む文字抽出" id="tfInStr_'+argCol+'">';
  rcList += '</div>';
  
  // 「OK」「Cancel」ボタンの作成
  rcList += '<div class="tfBtnArea">';
  rcList += '<input type="button" value="OK" onclick="tFilterGo()">';
  rcList += '<input type="button" value="Cancel" onclick="tFilterCancel('+argCol+')">';
  rcList += '</div>';
  
  // 作成したhtmlを返す
  return rcList;
}
 
//===============================================================
// フィルタリストのチェックボックスクリック
// 「すべて」のチェックボックスと整合性を合わせる
//===============================================================
function tFilterClick(argCol) {
  var wForm   = document.forms['tfForm_'+argCol];
  var wCntOn  = 0;
  var wCntOff = 0;
  // 「すべて」のチェックボックス
  var wAll    = document.getElementById('tfData_ALL_'+argCol);
  
  // 各チェックボックスの状態を集計する
  for (var i = 0; i < wForm.elements.length; i++) {
    if (wForm.elements[i].type == 'checkbox') {
      if (wForm.elements[i].checked) {
        wCntOn++;
      } else {
        wCntOff++;
      }
    }
  }
  
  // 各チェックボックス集計で「すべて」を整備する
  if ((wCntOn == 0)||(wCntOff == 0)) {
    // 「すべて」をチェックする
    wAll.checked = true;
    // 各フィルタのチェックする
    tFilterAllSet(argCol);
  } else {
    // 「すべて」をチェックを外す
    wAll.checked = false;
  }
}
 
//===============================================================
// キャンセルボタン押下
//===============================================================
function tFilterCancel(argCol) {
  tFilterSave(argCol, 'load');    // フィルタ条件の復元
  tFilterCloseOpen('');           // フィルタリストを閉じる
}

//===============================================================
// フィルタの実行
//===============================================================
function tFilterGo() {
  var wTABLE  = document.getElementById(filterableTabldID);
  var wTR     = wTABLE.rows;
  
  // 全ての非表示を一旦クリア
  for (var i = 0; i < wTR.length; i++) {
    if (wTR[i].getAttribute('cmanFilterNone') !== null) {
      wTR[i].removeAttribute('cmanFilterNone');
    }
  }
  
  // フィルタボタンのある列を繰り返す
  for (var wColList = 0; wColList < gTfColList.length; wColList++) {
    var wCol       = gTfColList[wColList];
    // 「すべて」のチェックボックス
    var wAll       = document.getElementById('tfData_ALL_'+wCol);
    var wItemSave  = {};
    var wFilterBtn =  document.getElementById('tsBtn_'+wCol);
    var wFilterStr =  document.getElementById('tfInStr_'+wCol);
  
    var wForm      = document.forms['tfForm_'+wCol];
    // チェックボックスの整備（「すべて」の整合性）
    for (var i = 0; i < wForm.elements.length; i++) {
      if (wForm.elements[i].type == 'checkbox') {
        if (wForm.elements[i].checked) {
          // チェックされている値を保存
          wItemSave[wForm.elements[i].value] = 1;
        }
      }
    }
  
    // フィルタ（非表示）の設定
    if ((wAll.checked)&&(trim(wFilterStr.value) == '')) {
      // フィルタなし色
      wFilterBtn.style.backgroundColor = '';
    } else {
      // フィルタあり色
      wFilterBtn.style.backgroundColor = '#ffff00';
  
      for (var i=gTfStartRow; i < wTR.length; i++) {
        var wVal = trim(wTR[i].cells[wCol].innerText.toString());
  
        // --- チェックボックス選択によるフィルタ ----------------
        if (!wAll.checked) {
          if (wVal in wItemSave) {
          } else {
            wTR[i].setAttribute('cmanFilterNone','');
          }
        }
  
        // 抽出文字によるフィルタ
        if (wFilterStr.value != '') {
          reg = new RegExp(wFilterStr.value);
          if (wVal.match(reg)) {
          } else {
            wTR[i].setAttribute('cmanFilterNone','');
          }
        }
      }
    }
  }
  tFilterCloseOpen('');
}
 
//===============================================================
// フィルタリストの保存または復元
// 「すべて」のチェックボックス値を保存
//===============================================================
function tFilterSave(argCol, argFunc) {
  var wAllCheck = document.getElementById('tfData_ALL_'+argCol);
  if (argFunc == 'save') {
    gTfListSave[wAllCheck.id] = wAllCheck.checked;
  } else {
    wAllCheck.checked = gTfListSave[wAllCheck.id];
  }
  
  // 各チェックボックス値を保存
  var wForm    = document.forms['tfForm_'+argCol];
  for (var i = 0; i < wForm.elements.length; i++) {
    if (wForm.elements[i].type == 'checkbox') {
      if (argFunc == 'save') {
        gTfListSave[wForm.elements[i].id] = wForm.elements[i].checked;
      } else {
        wForm.elements[i].checked = gTfListSave[wForm.elements[i].id];
      }
    }
  }
  
  // 含む文字の入力を保存
  var wStrInput = document.getElementById('tfInStr_'+argCol);
  if (argFunc == 'save') {
    gTfListSave[wStrInput.id] = wStrInput.value;
  } else {
    wStrInput.value = gTfListSave[wStrInput.id];
  }
}
 
//==============================================================
//  フィルタを閉じて開く
//==============================================================
function tFilterCloseOpen(argCol) {
  // フィルタリストを一旦すべて閉じる
  for (var i=0; i < gTfColList.length; i++) {
    document.getElementById("tfList_"+gTfColList[i]).style.display = 'none';
  }
  
  // 指定された列のフィルタリストを開く
  if (argCol != '') {
    document.getElementById("tfList_"+argCol).style.display = '';
    // フィルタ条件の保存（キャンセル時に復元するため）
    tFilterSave(argCol, 'save');
  }
}
 
//==============================================================
//  「すべて」のチェック状態に合わせて、各チェックをON/OFF
//==============================================================
function tFilterAllSet(argCol) {
  var wChecked = false;
  var wForm    = document.forms['tfForm_'+argCol];
  
  if (document.getElementById('tfData_ALL_'+argCol).checked) {
    wChecked = true;
  }
  
  for (var i = 0; i < wForm.elements.length; i++) {
    if (wForm.elements[i].type == 'checkbox') {
      wForm.elements[i].checked = wChecked;
    }
  }
}
 
//==============================================================
//  数字のソート関数（昇順）
//==============================================================
function sortNumA(a, b) {
  a = parseInt(a.replace(/,/g, ''));
  b = parseInt(b.replace(/,/g, ''));
  return a - b;
}
 
//==============================================================
//  trim
//==============================================================
function trim(argStr) {
  var rcStr = argStr;
  rcStr	= rcStr.replace(/^[ 　\r\n]+/g, '');
  rcStr	= rcStr.replace(/[ 　\r\n]+$/g, '');
  return rcStr;
}
 
//===============================================================
//  テーブルの初期設定
//===============================================================
function tSortInit() {
  gTabldIDList.forEach(function(element) {
    var wTABLE  = document.getElementById(element);
    var wTR     = wTABLE.rows;
    var wAddBtn = '';
    
    // テーブル内を検索してソートボタンを付ける
    for (var i=0; i < wTR.length; i++) {
      var wTD     = wTABLE.rows[i].cells;
      for (var j=0; j < wTD.length; j++) {
        if (wTD[j].getAttribute('cmanSortBtn') !== null) {
          wAddBtn  = '<div class="tsImgArea">';
          wAddBtn += '<svg class="tsImg" id="ts_A_'+j+","+element+'" onclick="tSort(this)"><path d="M4 0 L0 6 L8 6 Z"></path></svg>';
          wAddBtn += '<svg class="tsImg" id="ts_D_'+j+","+element+'" onclick="tSort(this)"><path d="M0 0 L8 0 L4 7 Z"></path></svg>';
          wAddBtn += '</div>';
    
          wTD[j].innerHTML = wTD[j].innerHTML+wAddBtn;
        }
      }
    
      // ボタンを付けたら以降の行は無視する
      if (wAddBtn != '') {
        gSortBtnRow = i;
        break;
      }
    }
  });
}
 
//===============================================================
//  ソート実行
//===============================================================
function tSort(argObj) {
  var wSortKeyId  = argObj.id.split(',')[0];
  var gTabldID  = argObj.id.split(',')[1];
  // 「ts_A_1」形式 [1]:A-昇順,D-降順  [2]:列番号
  var wSortKey  = wSortKeyId.split('_');
  
  var wTABLE    = document.getElementById(gTabldID);
  var wTR       = wTABLE.rows;
  var wItem     = [];              // クリックされた列の値
  var wItemSort = [];              // クリックされた列の値（項目ソート後）
  var wMoveRow  = [];              // 元の行位置（行削除考慮位置）
  var wNotNum   = 0;               // 1 : 数字でない
  var wStartRow = gSortBtnRow + 1; // ソートを開始する行はボタンの次の行
  
  // クリックされた列の値を取得する
  for (var i=wStartRow; i < wTR.length; i++) {
    var j = i - wStartRow;
    wItem[j] = wTR[i].cells[wSortKey[2]].innerText.toString();
  
    if (wItem[j].match(/^[-]?[0-9,\.]+$/)) {
    } else {
      wNotNum = 1;
    }
  }
  // ソート用に配列をコピー
  wItemSort = wItem.slice(0, wItem.length);
  
  // 列の値でソートを実行
  if (wSortKey[1] == 'A') {
    if ((gSortNum == 1)&&(wNotNum == 0)) {
      // 数値で昇順
      wItemSort.sort(sortNumA);
    } else {
      // 文字で昇順
      wItemSort.sort(sortStrA);
    }
  } else {
    if ((gSortNum == 1)&&(wNotNum == 0)) {
      // 数値で降順
      wItemSort.sort(sortNumD);
    } else {
      // 文字で降順
      wItemSort.sort(sortStrD);
    }
  }
  
  // 行の入れ替え順を取得
  // ソート前後の列の値を比較して行の移動順を確定
  // 配列を削除して前詰めしている（移動時も同じ動き）
  for (var i=0; i < wItemSort.length; i++) {
    for (var j=0; j < wItem.length; j++) {
      if (wItemSort[i] == wItem[j]) {
        wMoveRow[i] = j + wStartRow;
        wItem.splice(j, 1);
        break;
      }
    }
  }
  
  // ソート順に行を移動
  for (var i=0; i < wMoveRow.length; i++) {
    // 移動対象
    var wMoveTr = wTABLE.rows[wMoveRow[i]];
    // 最終行
    var wLastTr = wTABLE.rows[wTABLE.rows.length - 1];
  
    // 最終行にコピーしてから移動元を削除
    wLastTr.parentNode.insertBefore(wMoveTr.cloneNode(true), wLastTr.nextSibling);
    wTABLE.deleteRow(wMoveRow[i]);
  }
  
  // クリックされたソートボタンの色付け
  var elmImg = document.getElementsByClassName('tsImg');
  for (var i=0; i < elmImg.length; i++) {
    if (elmImg[i].id == argObj.id) {
      elmImg[i].style.backgroundColor = '#ffff00';
    } else {
      elmImg[i].style.backgroundColor = '';
    }
  }
}
 
//===============================================================
//  数字のソート関数（降順）
//===============================================================
function sortNumD(a, b) {
  a = parseInt(a.replace(/,/g, ''));
  b = parseInt(b.replace(/,/g, ''));
  return b - a;
}
 
//===============================================================
//  文字のソート関数（昇順）
//===============================================================
function sortStrA(a, b) {
  a = a.toString();
  b = b.toString();

  // 1 : 英大文字小文字を区別しない
  if (gSortAa == 1) {
    a = a.toLowerCase();
    b = b.toLowerCase();
  }
  if (a < b) {
    return -1;
  } else if (a > b) {
    return  1;
  }
  return 0;
}
 
//===============================================================
//  文字のソート関数（降順）
//===============================================================
function sortStrD(a, b) {
  a = a.toString();
  b = b.toString();
  // 1 : 英大文字小文字を区別しない
  if (gSortAa == 1) {
    a = a.toLowerCase();
    b = b.toLowerCase();
  }
  
  if (b < a) {
    return -1;
  } else if (b > a) {
    return  1;
  }
  return 0;
}