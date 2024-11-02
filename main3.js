const AudioContext = window.AudioContext || window.webkitAudioContext;
const meter = document.getElementById('volume');

const STAMINA = 1;
const HP = 2;
const ATTACK_PT = 3
const DIFFENCE_PT = 4;

const TAB_IDX_JUDEN = 0
const TAB_IDX_SEARCH_DN = 1
const TAB_IDX_ITEM_SHOP = 2
const TAB_IDX_CHANGE_ITEM = 3
const TAB_IDX_KANKIN = 4

const BUKI_KIND_COUNT = 4;
const BOUGU_KIND_COUNT = 4;

const KOSEKI_KIND_COUNT = 9
const KOSEKI_HAVING_MAX = 999;


const ENEMY_KIND_COUNT = 9

const WIN = 0;
const LOSE = 1;
const ON_BUTTLE = 2;

const KAIHOU_GOLD = 999999;



const buyItemNames = ["木の棒", "鉄の棒", "鉄の剣", "鋼の剣",
					  "木の盾", "鉄の盾", "銀の盾", "チタンの盾"]
					  
const buyItemPrices = [10, 20, 30, 40,
					   10, 20, 30, 40]
					   
const kosekiNames = ["銅", "鉄", "マンガン", "クリスタル", "石炭",
					 "石油", "銀", "金", "チタン"] 

const kosekiRndRates = [24, 17, 15, 13,11, 8,6,4,2]

const kosekiPrices = [10, 20, 30, 40, 50,
					  60, 70, 80, 90]
					  			
SoubiItemMaxTaikyu = [99, 70, 50, 50,
					  99, 70, 50, 50]	  

					  
BukiPowerRate = [1.5, 2, 2.5, 3]

BouguPowerRate = [1.5, 2.5, 3.5, 5]

SoubiBukiNasiFlg = true;
SoubiBouguNasiFlg = true;

OnButtleFlg = false;

const enemyRndRates = [17, 17, 17, 17, 8,8,8,5,3]

const EnemyNames = ["スライム","アルミラージ","コボルト","ゴブリン",
			  "ゴーレム","スケルトン","デュラハン","ケルベロス","ドラゴン"]
			  
const EnemyMaxLifePt = [10, 10, 20, 20, 
						30, 40, 50,100, 500]

const EnemyPowerPt = [10, 20, 15, 20,
					  30, 30, 40, 80, 100]
					  
const EnemyGold = [10, 10, 10, 10,
				   30, 30, 30, 100, 500]
					  

CurrentEnemyIdx = 0;
CurrentEnemyLifePt = 0;

						
let processor = null
let localstream = null

volumeThre = 30
addParamThre = 30

ThretholdCount = 0;
UpperVolCount = 0;
UpperVolEventCount = 0;
AddParamKind = 1;


class User {
	Stamina = 20;
	LifePt = 10;
	AttackPt = 10;
	DiffencePt = 10;
	WalkPt = 0;
	Gold = 100;

	KaihouCount = 0;

	HavingKosekis = [0, 2, 0, 5, 0,
				 0, 0, 4, 0]
				 
	HavingItems = [0, 0, 0, 0,
			  0, 0, 0, 0]
			  
	SoubiItemFlg = [0, 0, 0, 0,
				0, 0, 0, 0]
				
	SoubiItemCurrentTaikyu = [0, 0, 0, 0,
					  0, 0, 0, 0]

}

var MyUser = new User()



var textOfFile1;

//Form要素を取得する
var form = document.getElementById("myform1");
var file = document.getElementById("myfile1");
//ファイルが読み込まれた時の処理
file.addEventListener('change', function(e) {
  
  //ここにファイル取得処理を書く
  result2 = e.target.files[0];
  
    //FileReaderのインスタンスを作成する
    var reader = new FileReader();
  
    //読み込んだファイルの中身を取得する
    reader.readAsText( result2 );
  
    //ファイルの中身を取得後に処理を行う
    reader.addEventListener( 'load', function() {
    
        //ファイルの中身をtextarea内に表示する
        textOfFile1 = reader.result;    
    })

})


function kaihou(){

	if(MyUser.Gold < KAIHOU_GOLD){
		alert("解放に必要なゴールドが足りません")
		
	}else{
	
		if(!window.confirm("本当にゴールドを解放しますか?")){return}
		
		MyUser.Gold -= KAIHOU_GOLD;
		MyUser.KaihouCount++;
		
		link1 = document.getElementById("kifuLink1");
		span1 = document.getElementById("kaihouSpan1");
		
		url1 = "https://www.ashinaga.org/donation/";
		link1.setAttribute('href', url1);
		span1.innerHTML = "あしなが育英会の寄付用リンク"
		
		alert("ゴールドを解放しました");
		
		UpdatePrints();
	}
}

function SubtractBukiTaikyu(){
	span1 = document.getElementById("searchDnSpan1");
	
	idx1 = GetBukiIdx();
	if(idx1 == -1){
		return
	}
	
	taikyu1 = MyUser.SoubiItemCurrentTaikyu[idx1];
	if(taikyu1 >= 1){
		taikyu1--;
	}else{
		if(MyUser.HavingItems[idx1] >= 1){
			MyUser.HavingItems[idx1] = MyUser.HavingItems[idx1]-1;
			taikyu1 = SoubiItemMaxTaikyu[idx1];
			
			span1.innerHTML += "武器が壊れたため、追加で"
			span1.innerHTML += buyItemNames[idx1]
			span1.innerHTML += "を装備しなおしました<br>"
			
		}else{
			taikyu1 = 0;
			MyUser.HavingItems[idx1] = 0;
			MyUser.SoubiItemFlg[idx1] = 0;
			SoubiBukiNasiFlg=true
			
			span1.innerHTML += "武器が壊れたため、素手になりました<br>"
		}
	}
	
	MyUser.SoubiItemCurrentTaikyu[idx1] = taikyu1;
	if(SoubiBukiNasiFlg == false){
		span1.innerHTML += "武器の耐久値:"
		span1.innerHTML += String(taikyu1);
		span1.innerHTML += "<br>"
	}
}

function SubtractBouguTaikyu(){
	span1 = document.getElementById("searchDnSpan1");
	
	idx1 = GetBouguIdx();
	if(idx1 == -1){
		return
	}
	
	taikyu1 = MyUser.SoubiItemCurrentTaikyu[idx1];
	if(taikyu1 >= 1){
		taikyu1--;
	}else{
		if(MyUser.HavingItems[idx1] >= 1){
			MyUser.HavingItems[idx1] = MyUser.HavingItems[idx1]-1;
			taikyu1 = SoubiItemMaxTaikyu[idx1];
			
			span1.innerHTML += "防具が壊れたため、追加で"
			span1.innerHTML += buyItemNames[idx1]
			span1.innerHTML += "を装備しなおしました<br>"
			
		}else{
			taikyu1 = 0;
			MyUser.HavingItems[idx1] = 0;
			MyUser.SoubiItemFlg[idx1] = 0;
			SoubiBouguNasiFlg=true
			
			span1.innerHTML += "防具が壊れたため、防具なしになりました<br>"
		}
	}
	
	MyUser.SoubiItemCurrentTaikyu[idx1] = taikyu1;
	if(SoubiBouguNasiFlg == false){
		span1.innerHTML += "武器の耐久値:"
		span1.innerHTML += String(taikyu1);
		span1.innerHTML += "<br>"
	}
}

function GetBukiIdx(){
	for(i=0; i<BUKI_KIND_COUNT; i++){
		if(MyUser.SoubiItemFlg[i] == 1){
			return i
		}
	}
	
	return -1
}

function GetBouguIdx(){
	for(i=BUKI_KIND_COUNT; i<(BUKI_KIND_COUNT+BOUGU_KIND_COUNT); i++){
		if(MyUser.SoubiItemFlg[i] == 1){
			return i
		}
	}
	
	return -1
}

function CalcReducePt(){
	if(MyUser.DiffencePt >= 10){
		rnd1 = getRandom(1, 10);
		MyUser.DiffencePt -= rnd1
	}else{
		rnd1 = 1
	}
	
	reduceRate = 0;
	if(SoubiBouguNasiFlg == true){
		reduceRate = 1;
	}else{
		reduceRate = BouguPowerRate[GetBouguIdx()];
	}
	
	reducePt1 = rnd1 * reduceRate
	
	return reducePt1
}


function CalcAttackPt(){
	if(MyUser.AttackPt >= 10){
		rnd1 = getRandom(1, 10);
		MyUser.AttackPt -= rnd1
		
	}else{
		rnd1 = 1;
	}
	
	attackRate = 0;
	if(SoubiBukiNasiFlg == true){
		attackRate = 1;
	}else{
		attackRate = BukiPowerRate[GetBukiIdx()];
	}
	
	attackPt1 = rnd1 * attackRate
	
	return attackPt1
}
function GetDamage(){

	rnd1 = getRandom(20, 100);
	power1 = EnemyPowerPt[CurrentEnemyIdx]
	
	power2 = Math.floor(power1 * rnd1 / 100)
	
	reduce1 = CalcReducePt()
	SubtractBouguTaikyu()
	
	damage = Math.max(0, power2-reduce1);
	
	MyUser.LifePt = MyUser.LifePt - damage
	
	return damage
}


function SetEnemy(){

	span1 = document.getElementById("searchDnSpan1");
	
	rnd1 = getRandom(1, 100);
	
	
	total = 0;
	for(i=0; i<enemyRndRates.length; i++){
		total += enemyRndRates[i];
		
		if(total >=  rnd1){
			str1 = String(EnemyNames[i]);
			str1 += "に遭遇しました<br>"
			
			idx = i
			break;
		}
	}
	
	CurrentEnemyIdx = idx;
	CurrentEnemyLifePt = EnemyMaxLifePt[idx]
	
	span1.innerHTML = str1;
	
}

function JudgeWinOrLose(){
	if(MyUser.LifePt <= 0){
		return LOSE
	}else if(CurrentEnemyLifePt <= 0){
		return WIN
	}else{
		return ON_BUTTLE;
	}
}

function SaveAsTextFile(text, filename){
  const blob = new Blob([text], { type: 'text/plain' });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.click();
  
}


function save(){

	SaveAsTextFile(JSON.stringify(MyUser), "saveOtoRPGGameData1.txt");
	
	alert("ゲームデータを保存しました");
}

function LoadSaveDataFile(){

	LoadGameDataFromJsonFile(textOfFile1)
}

function LoadGameDataFromJsonFile(JsonFileText1){

	text1 = JsonFileText1
	
	MyUser = JSON.parse(text1)

}

function load(){

	LoadSaveDataFile();
	
	PrintParams();
	PrintTotalWalk();
	PrintHavingItems();
	PrintSoubiHin();
	PrintHavingKosekis();
	UnSetButtle();
		
	alert("ゲームデータをロードしました");
}


document.addEventListener('DOMContentLoaded', function () {
    const targets = document.getElementsByClassName('tab');
    for (let i = 0; i < targets.length; i++) {
        targets[i].addEventListener('click', changeTab, false);
    }
    // タブメニューボタンをクリックすると実行
    function changeTab() {
        // タブのclassを変更
        document.getElementsByClassName('is-active')[0].classList.remove('is-active');
        this.classList.add('is-active');
        // コンテンツのclassの値を変更
        document.getElementsByClassName('is-display')[0].classList.remove('is-display');
        const arrayTabs = Array.prototype.slice.call(targets);
        const index = arrayTabs.indexOf(this);
        if(index != TAB_IDX_SEARCH_DN){
        	MyUser.WalkPt = 0;
        	PrintTotalWalk();
        }
        
        if(index == TAB_IDX_CHANGE_ITEM){
			PrintHavingItems();
			PrintSoubiHin();
        }
        
        if(index == TAB_IDX_KANKIN){
        	PrintHavingKosekis();
        }
        
        document.getElementsByClassName('content')[index].classList.add('is-display');
    };
}, false);

function getRandom( min, max ) {
    var random = Math.floor( Math.random() * (max + 1 - min) ) + min;
  
    return random;
}

function PrintHavingKosekis(){
	span1 = document.getElementById("havingKosekiSpan1")

	str1 = ""
	for(i=0; i<buyItemNames.length; i++){
		str1 += kosekiNames[i];
		str1 += "(売値:";
		str1 += String(kosekiPrices[i]);
		str1 += ")";
		str1 += ":"
		str1 += String(MyUser.HavingKosekis[i]);
		str1 += "<br>"
	}
	
	span1.innerHTML = str1;
	str1 = String("");

}


function PrintParams(){
  span1 = document.getElementById("stamina1");
  span2 = document.getElementById("hp1");
  span3 = document.getElementById("attackPt1");
  span4 = document.getElementById("diffencePt1");
  span5 = document.getElementById("money1");
  span6 = document.getElementById("kaihouCount1")
  
    
  span1.innerHTML = MyUser.Stamina;
  span2.innerHTML = MyUser.LifePt;
  span3.innerHTML = MyUser.AttackPt;
  span4.innerHTML = MyUser.DiffencePt;
  span5.innerHTML = MyUser.Gold;
  span6.innerHTML = MyUser.KaihouCount;
  
}

function PrintTotalWalk(){

	span1 = document.getElementById("totalWalk1");

	span1.innerHTML =""
	span1.innerHTML += String(MyUser.WalkPt);
	span1.innerHTML += "<br>"
}


function PrintHavingItems(){

	span1 = document.getElementById("havingItemSpan1")

	str1 = ""
	for(i=0; i<buyItemNames.length; i++){
		str1 += buyItemNames[i];
		str1 += ":"
		str1 += String(MyUser.HavingItems[i]);
		str1 += "<br>"
	}
	
	span1.innerHTML = str1;
	str1 = String("")
	
}

function PrintSoubiHin(){
	span1 = document.getElementById("soubiBukiSpan1");
	span2 = document.getElementById("soubiBouguSpan1");
	
	if(SoubiBukiNasiFlg == true){
		span1.innerHTML = "素手(武器なし)"
	}else{
		for(i=0; i<BUKI_KIND_COUNT; i++){
			if(MyUser.SoubiItemFlg[i] == 1){
				span1.innerHTML = buyItemNames[i];
				span1.innerHTML += "(耐久値:";
				span1.innerHTML += String(MyUser.SoubiItemCurrentTaikyu[i]);
				span1.innerHTML += ")"
			}
		}
		

	}
	
	if(SoubiBouguNasiFlg == true){
		span2.innerHTML = "防具なし"
	}else{
		for(i=BUKI_KIND_COUNT; i<(BUKI_KIND_COUNT+BOUGU_KIND_COUNT); i++){
			if(MyUser.SoubiItemFlg[i] == 1){
				span2.innerHTML = buyItemNames[i];
				span2.innerHTML += "(耐久値:";
				span2.innerHTML += String(MyUser.SoubiItemCurrentTaikyu[i]);
				span2.innerHTML += ")"
			}
		}
	}
}

function SetButtle(){
	btn1 = document.getElementById("searchBtn1")
	btn2 = document.getElementById("escapeBtn1")
	btn3 = document.getElementById("attackBtn1")
	
	btn1.disabled = true;
	btn2.disabled = false;
	btn3.disabled = false;
	
	OnButtleFlg = true;
	
}

function UnSetButtle(){
	btn1 = document.getElementById("searchBtn1")
	btn2 = document.getElementById("escapeBtn1")
	btn3 = document.getElementById("attackBtn1")
	
	btn1.disabled = false;
	btn2.disabled = true;
	btn3.disabled = true;
	
	OnButtleFlg = false;
}

function UpdatePrints(){
	PrintParams();
	PrintTotalWalk();
	PrintHavingItems();
	PrintSoubiHin();
	PrintHavingKosekis();
	
}
function escapeButtle(){
	rnd1 = getRandom(1, 100);
	
	span1 = document.getElementById("searchDnSpan1");
	
	if(rnd1 <= 50){
		UnSetButtle();
		span1.innerHTML = "戦闘から離脱しました<br>"
	}else{

		dg = GetDamage();
		
		span1.innerHTML = "逃走に失敗しました<br>"
		span1.innerHTML += String(dg)
		span1.innerHTML += "のダメージを受けました<br>"
		
		ret1 = JudgeWinOrLose()
		
		if(ret1 == LOSE){
			SetLose();
			
			UpdatePrints();
			
		}
		
	}
}

function SetLose(){
	MyUser.Stamina = Math.floor(MyUser.Stamina * 0.8);
	MyUser.LifePt = 10;
	MyUser.WalkPt = 0
	MyUser.HavingKosekis = [0, 0, 0, 0, 0,
				 	0, 0, 0, 0]
	
	UnSetButtle();
	
	span1 = document.getElementById("searchDnSpan1");
	span1.innerHTML += "敗北しました<br>"
}

function SetWin(){
	
	MyUser.Gold = MyUser.Gold + EnemyGold[CurrentEnemyIdx];
	UnSetButtle();
	
	span1 = document.getElementById("searchDnSpan1");
	str1 += EnemyNames[CurrentEnemyIdx]
	str1 += "に勝利しました<br>"
	str1 += String(EnemyGold[CurrentEnemyIdx])
	str1 += "ゴールドを獲得しました<br>"
	
	span1.innerHTML = str1
}

function attack(){
	span1 = document.getElementById("searchDnSpan1");
	
	power1 = CalcAttackPt()
	CurrentEnemyLifePt = Math.max(CurrentEnemyLifePt - power1, 0)
	SubtractBukiTaikyu();
	
	span1.innerHTML = "攻撃しました<br>"
	span1.innerHTML += EnemyNames[CurrentEnemyIdx]
	span1.innerHTML += "に"
	span1.innerHTML += String(power1)
	span1.innerHTML += "のダメージ<br>"
	
	ret1 = JudgeWinOrLose()
	if(ret1 == WIN){
		SetWin();
		UnSetButtle();
		UpdatePrints();
		return
		
	}
	
	dg = GetDamage();
	span1.innerHTML += EnemyNames[CurrentEnemyIdx]
	span1.innerHTML += "の攻撃<br>"
	span1.innerHTML += String(dg)
	span1.innerHTML += "のダメージを受けました<br>"
	
	ret1 = JudgeWinOrLose()
	if(ret1 == LOSE){
		SetLose();
		UnSetButtle();
		UpdatePrints();
		return
		
	}
	
	UpdatePrints();
	return
	
}

function kankin(){

	span1 = document.getElementById("kankinSpan1");
	
	totalPrice = 0;
	for(i=0; i<kosekiNames.length; i++){
		totalPrice += (kosekiPrices[i] * MyUser.HavingKosekis[i]);
	}
	
	MyUser.Gold += totalPrice;
	
	MyUser.HavingKosekis = [0, 0, 0, 0, 0,
				 0, 0, 0, 0]
				 
	span1.innerHTML = "鉱石を換金しました<br>"
	span1.innerHTML += "売値:"
	span1.innerHTML += String(totalPrice);
	span1.innerHTML += "<br>"
	
	PrintHavingKosekis();
	PrintParams();
}


function GetKoseki(){
	rnd1 = getRandom(1, 100);
	rnd2 = getRandom(1, 5)
	
	span1 = document.getElementById("searchDnSpan1");
	
	total = 0;
	for(i=0; i<kosekiRndRates.length; i++){
		total += kosekiRndRates[i];
		
		if(total >=  rnd1){
			str1 = String(kosekiNames[i]);
			str1 += "を"
			str1 += String(rnd2)
			str1 += "個"
			str1 += "見つけました<br>"
			
			idx = i
			break;
		}
	}
	
	MyUser.HavingKosekis[idx] += rnd2
	MyUser.HavingKosekis[idx] = Math.min(KOSEKI_HAVING_MAX, MyUser.HavingKosekis[idx])
	span1.innerHTML += str1
}

function GetKoseki2(stamina1){

	totalGetKoseki = [0, 0, 0, 0, 0,
				 0, 0, 0, 0]
				 
	idx = 0;
	total = 0;
	for(j=0; j<=(stamina1-10); j++){
		MyUser.LifePt -= 3;
		
		rnd0 = getRandom(1, 100)
		total = 0;
		
		if(rnd0 >= 50){
		
			rnd1 = getRandom(1, 100);
			rnd2 = getRandom(1, 5)
			
			total = 0;
			for(i=0; i<kosekiRndRates.length; i++){
				total += kosekiRndRates[i];
				
				if(total >=  rnd1){	
					idx = i
					break;
				}
			}
			
			totalGetKoseki[idx] += rnd2
			totalGetKoseki[idx] = Math.min(KOSEKI_HAVING_MAX, totalGetKoseki[idx])
		
		
		}
	}


	span1 = document.getElementById("searchDnSpan1");
	span1.innerHTML = "自動探索を行った<br>";
	
	for(k=0; k<kosekiRndRates.length; k++){
		str1 = String(kosekiNames[k]);
		str1 += "を"
		str1 += String(totalGetKoseki[k])
		str1 += "個"
		str1 += "見つけました<br>"
		

		MyUser.HavingKosekis[k] += totalGetKoseki[k]

		span1.innerHTML += str1		

	}
	
	UpdatePrints()
	


}

function soubiChange(){

	span1 = document.getElementById("ChangeSoubiSpan1");
	id1 = document.getElementById("Item2").value
	id1 = Number(id1);
	
	if(id1 == 100){
		SoubiBukiNasiFlg = true;
		
		MyUser.SoubiItemFlg = [0, 0, 0, 0,
						0, 0, 0, 0]
						
		span1.innerHTML = "武器を外しました";

						
	}else if(id1 == 101){
		SoubiBouguNasiFlg = true;
		
		MyUser.SoubiItemFlg = [0, 0, 0, 0,
						0, 0, 0, 0]
						
		span1.innerHTML = "防具を外しました";

						
	}else{
	
		idx = id1-1;
		if(MyUser.HavingItems[idx] <= 0){
			span1.innerHTML = "持っていないため、装備変更ができませんでした";
		}else{
			if(idx <= 3){
				SoubiBukiNasiFlg = false2
			}else if(idx <= 7){
				SoubiBouguNasiFlg = false
			}
			
			MyUser.HavingItems[idx] = MyUser.HavingItems[idx] - 1;
			
			str1 = ""
			str1 += buyItemNames[idx]
			str1 += "を装備しなおしました<br>"
			
			span1.innerHTML = str1;
			
			MyUser.SoubiItemFlg = [0, 0, 0, 0,
							0, 0, 0, 0]
			MyUser.SoubiItemFlg[idx] = 1;
			
			
			MyUser.SoubiItemCurrentTaikyu[idx] = SoubiItemMaxTaikyu[idx]
			
		}
	}
	
	PrintHavingItems();
	PrintSoubiHin();
}

function buyItem(){

	var select1 = document.getElementById('Item1')
	var kind = Number(select1.value);
	
	kind = kind - 1;
	
	price = buyItemPrices[kind];
	
	span1 = document.getElementById("buyItemSpan1");
	if(MyUser.Gold < price){
		span1.innerHTML = "ゴールド不足で購入できませんでした"
	}else{
		MyUser.Gold = MyUser.Gold - price;
		MyUser.HavingItems[kind]++;
		
		span1.innerHTML = buyItemNames[kind]
		span1.innerHTML += "を一個購入しました"
		
	}
	
	PrintParams();

}

function render(percent) {
  console.log('Percent:', percent);
  meter.style.width = Math.min(Math.max(0, percent), 100) + '%';
  
  if(percent > volumeThre){
	ThretholdCount++;
	UpperVolCount++;
	
	if(ThretholdCount >= addParamThre){
		var select1 = document.getElementById('addParam')
		var kind = Number(select1.value);
		
		if(kind == STAMINA){
			MyUser.Stamina++;
		}else if(kind == HP){
			MyUser.LifePt++;
		}else if(kind == ATTACK_PT){
			MyUser.AttackPt++;
		}else if(kind == DIFFENCE_PT){
			MyUser.DiffencePt++;
		}
		
		PrintParams();
		
		
		ThretholdCount = 0;
		UpperVolCount = 0;
		UpperVolEventCount++;
	}
	
  }
  
  span1 = document.getElementById("UpperVolCount1");
  span2 = document.getElementById("UpperVolEventCount1");
  
  span1.innerHTML = UpperVolCount;
  span2.innerHTML = UpperVolEventCount;
  
}

function onProcess(event) {
  const data = event.inputBuffer.getChannelData(0);
  const peak = data.reduce((max, sample) => {
    const cur = Math.abs(sample);
    return max > cur ? max : cur;
  });
  render(100 * peak);
}

function autoSearch(){

	if(MyUser.LifePt < MyUser.Stamina*3){
		alert("自動探索ではスタミナの3倍のHPが必要です")
		
	}else if(MyUser.Stamina <= 10){
		alert("自動探索では11以上のスタミナが必要です")
		
	}else{
		GetKoseki2(MyUser.Stamina);
		
		MyUser.Stamina = 10;
		
		MyUser.AttackPt = Math.floor(MyUser.AttackPt * 0.5);
		MyUser.DiffencePt = Math.floor(MyUser.DiffencePt * 0.5)
		
		

	}
	
	UpdatePrints();
}

function searchDanjon(){
	span1 = document.getElementById("searchDnSpan1");
	
	span1.innerHTML = "";
	if(MyUser.Stamina <= 0){
		span1.innerHTML = "スタミナ不足で探索できませんでした<br>"
		
	}else if(OnButtleFlg == false){
		MyUser.WalkPt++;
		MyUser.Stamina--;
		span1.innerHTML = "ダンジョン探索をしました<br>"
		
		rnd1 = getRandom(1, 100);
		
		if(rnd1 <= 50){
			UnSetButtle();
			
			span1.innerHTML += "鉱石を見つけました<br>"
			GetKoseki()
			
		}else{
			SetButtle()
			SetEnemy()
		}
		

		
	}

	
	PrintTotalWalk();
	PrintParams();
}


async function start() {
  let media = await navigator.mediaDevices
    .getUserMedia({ audio: true })
    .catch(console.error);
    
  localstream = media.stream
  
  let ctx = new AudioContext();
  console.log('Sampling Rate:', ctx.sampleRate);

  processor = ctx.createScriptProcessor(1024, 1, 1);
  processor.onaudioprocess = onProcess;
  processor.connect(ctx.destination);

  let source = ctx.createMediaStreamSource(media);
  source.connect(processor);
}

async function end(){
    console.log('stop recording')
    processor.disconnect()
    processor.onaudioprocess = null
    processor = null
    localstream.getTracks().forEach((track) => {
        track.stop()
    })

}

function main(){
	PrintParams();
	PrintTotalWalk();
	PrintHavingItems();
	PrintSoubiHin();
	PrintHavingKosekis();
	UnSetButtle();
}

main();