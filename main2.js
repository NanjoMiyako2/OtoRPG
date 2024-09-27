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
					  
HavingKosekis = [0, 2, 0, 5, 0,
				 0, 0, 4, 0]
					   
HavingItems = [0, 0, 0, 0,
			  0, 0, 0, 0]
			  
SoubiItemFlg = [0, 0, 0, 0,
				0, 0, 0, 0]
				
SoubiItemMaxTaikyu = [99, 70, 50, 50,
					  99, 70, 50, 50]
					  
SoubiItemCurrentTaikyu = [0, 0, 0, 0,
					  0, 0, 0, 0]
					  
BukiPowerRate = [1.5, 2, 2.5, 3]

BouguPowerRate = [1.5, 2.5, 3.5, 5]

SoubiBukiNasiFlg = true;
SoubiBouguNasiFlg = true;

OnButtleFlg = false;

KaihouCount = 0;

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

Stamina = 10;
LifePt = 10;
AttackPt = 10;
DiffencePt = 10;
WalkPt = 0;
Gold = 100;

function kaihou(){

	if(Gold < KAIHOU_GOLD){
		alert("解放に必要なゴールドが足りません")
		
	}else{
	
		if(!window.confirm("本当にゴールドを解放しますか?")){return}
		
		Gold -= KAIHOU_GOLD;
		KaihouCount++;
		
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
	
	taikyu1 = SoubiItemCurrentTaikyu[idx1];
	if(taikyu1 >= 1){
		taikyu1--;
	}else{
		if(HavingItems[idx1] >= 1){
			HavingItems[idx1] = HavingItems[idx1]-1;
			taikyu1 = SoubiItemMaxTaikyu[idx1];
			
			span1.innerHTML += "武器が壊れたため、追加で"
			span1.innerHTML += buyItemNames[idx1]
			span1.innerHTML += "を装備しなおしました<br>"
			
		}else{
			taikyu1 = 0;
			HavingItems[idx1] = 0;
			SoubiItemFlg[idx1] = 0;
			SoubiBukiNasiFlg=true
			
			span1.innerHTML += "武器が壊れたため、素手になりました<br>"
		}
	}
	
	SoubiItemCurrentTaikyu[idx1] = taikyu1;
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
	
	taikyu1 = SoubiItemCurrentTaikyu[idx1];
	if(taikyu1 >= 1){
		taikyu1--;
	}else{
		if(HavingItems[idx1] >= 1){
			HavingItems[idx1] = HavingItems[idx1]-1;
			taikyu1 = SoubiItemMaxTaikyu[idx1];
			
			span1.innerHTML += "防具が壊れたため、追加で"
			span1.innerHTML += buyItemNames[idx1]
			span1.innerHTML += "を装備しなおしました<br>"
			
		}else{
			taikyu1 = 0;
			HavingItems[idx1] = 0;
			SoubiItemFlg[idx1] = 0;
			SoubiBouguNasiFlg=true
			
			span1.innerHTML += "防具が壊れたため、防具なしになりました<br>"
		}
	}
	
	SoubiItemCurrentTaikyu[idx1] = taikyu1;
	if(SoubiBouguNasiFlg == false){
		span1.innerHTML += "武器の耐久値:"
		span1.innerHTML += String(taikyu1);
		span1.innerHTML += "<br>"
	}
}

function GetBukiIdx(){
	for(i=0; i<BUKI_KIND_COUNT; i++){
		if(SoubiItemFlg[i] == 1){
			return i
		}
	}
	
	return -1
}

function GetBouguIdx(){
	for(i=BUKI_KIND_COUNT; i<(BUKI_KIND_COUNT+BOUGU_KIND_COUNT); i++){
		if(SoubiItemFlg[i] == 1){
			return i
		}
	}
	
	return -1
}

function CalcReducePt(){
	if(DiffencePt >= 10){
		rnd1 = getRandom(1, 10);
		DiffencePt -= rnd1
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
	if(AttackPt >= 10){
		rnd1 = getRandom(1, 10);
		AttackPt -= rnd1
		
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
	
	LifePt = LifePt - damage
	
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
	if(LifePt <= 0){
		return LOSE
	}else if(CurrentEnemyLifePt <= 0){
		return WIN
	}else{
		return ON_BUTTLE;
	}
}

function save(){

	window.localStorage.clear();
	
	window.localStorage.setItem("Stamina",String(Stamina))
	window.localStorage.setItem("LifePt",String(LifePt))
	window.localStorage.setItem("AttackPt",String(AttackPt))
	window.localStorage.setItem("DiffencePt",String(DiffencePt))
	window.localStorage.setItem("WalkPt",String(WalkPt))
	window.localStorage.setItem("Gold",String(Gold))
	window.localStorage.setItem("KaihouCount",String(KaihouCount))
	
	ary1 = [];
	for(i=0; i<HavingKosekis.length; i++){
		ary1.push(String(HavingKosekis[i]));
	}
	window.localStorage.setItem("HavingKosekis", ary1.join(','))
	
	alert("ゲームデータを保存しました");
}

function load(){

	Stamina = Number(window.localStorage.getItem("Stamina"));
	LifePt = Number(window.localStorage.getItem("LifePt"));
	AttackPt = Number(window.localStorage.getItem("AttackPt"));
	DiffencePt = Number(window.localStorage.getItem("DiffencePt"));
	WalkPt = Number(window.localStorage.getItem("WalkPt"));
	Gold = Number(window.localStorage.getItem("Gold"));
	HavingKosekis = window.localStorage.getItem("HavingKosekis").split(",");
	KaihouCount = window.localStorage.getItem("KaihouCount");
	
	for(i=0; i<HavingKosekis.length; i++){
		HavingKosekis[i] = Number(HavingKosekis[i]);
	}
	
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
        	WalkPt = 0;
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
		str1 += String(HavingKosekis[i]);
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
  
    
  span1.innerHTML = Stamina;
  span2.innerHTML = LifePt;
  span3.innerHTML = AttackPt;
  span4.innerHTML = DiffencePt;
  span5.innerHTML = Gold;
  span6.innerHTML = KaihouCount;
  
}

function PrintTotalWalk(){

	span1 = document.getElementById("totalWalk1");

	span1.innerHTML =""
	span1.innerHTML += String(WalkPt);
	span1.innerHTML += "<br>"
}


function PrintHavingItems(){

	span1 = document.getElementById("havingItemSpan1")

	str1 = ""
	for(i=0; i<buyItemNames.length; i++){
		str1 += buyItemNames[i];
		str1 += ":"
		str1 += String(HavingItems[i]);
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
			if(SoubiItemFlg[i] == 1){
				span1.innerHTML = buyItemNames[i];
				span1.innerHTML += "(耐久値:";
				span1.innerHTML += String(SoubiItemCurrentTaikyu[i]);
				span1.innerHTML += ")"
			}
		}
		

	}
	
	if(SoubiBouguNasiFlg == true){
		span2.innerHTML = "防具なし"
	}else{
		for(i=BUKI_KIND_COUNT; i<(BUKI_KIND_COUNT+BOUGU_KIND_COUNT); i++){
			if(SoubiItemFlg[i] == 1){
				span2.innerHTML = buyItemNames[i];
				span2.innerHTML += "(耐久値:";
				span2.innerHTML += String(SoubiItemCurrentTaikyu[i]);
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
	Stamina = Math.floor(Stamina * 0.8);
	LifePt = 10;
	WalkPt = 0
	HavingKosekis = [0, 0, 0, 0, 0,
				 	0, 0, 0, 0]
	
	UnSetButtle();
	
	span1 = document.getElementById("searchDnSpan1");
	span1.innerHTML += "敗北しました<br>"
}

function SetWin(){
	
	Gold = Gold + EnemyGold[CurrentEnemyIdx];
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
		totalPrice += (kosekiPrices[i] * HavingKosekis[i]);
	}
	
	Gold += totalPrice;
	
	HavingKosekis = [0, 0, 0, 0, 0,
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
	
	HavingKosekis[idx] += rnd2
	HavingKosekis[idx] = Math.min(KOSEKI_HAVING_MAX, HavingKosekis[idx])
	span1.innerHTML += str1
}

function soubiChange(){

	span1 = document.getElementById("ChangeSoubiSpan1");
	id1 = document.getElementById("Item2").value
	id1 = Number(id1);
	
	if(id1 == 100){
		SoubiBukiNasiFlg = true;
		
		SoubiItemFlg = [0, 0, 0, 0,
						0, 0, 0, 0]
						
		span1.innerHTML = "武器を外しました";

						
	}else if(id1 == 101){
		SoubiBouguNasiFlg = true;
		
		SoubiItemFlg = [0, 0, 0, 0,
						0, 0, 0, 0]
						
		span1.innerHTML = "防具を外しました";

						
	}else{
	
		idx = id1-1;
		if(HavingItems[idx] <= 0){
			span1.innerHTML = "持っていないため、装備変更ができませんでした";
		}else{
			if(idx <= 3){
				SoubiBukiNasiFlg = false
			}else if(idx <= 7){
				SoubiBouguNasiFlg = false
			}
			
			HavingItems[idx] = HavingItems[idx] - 1;
			
			str1 = ""
			str1 += buyItemNames[idx]
			str1 += "を装備しなおしました<br>"
			
			span1.innerHTML = str1;
			
			SoubiItemFlg = [0, 0, 0, 0,
							0, 0, 0, 0]
			SoubiItemFlg[idx] = 1;
			
			
			SoubiItemCurrentTaikyu[idx] = SoubiItemMaxTaikyu[idx]
			
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
	if(Gold < price){
		span1.innerHTML = "ゴールド不足で購入できませんでした"
	}else{
		Gold = Gold - price;
		HavingItems[kind]++;
		
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
			Stamina++;
		}else if(kind == HP){
			LifePt++;
		}else if(kind == ATTACK_PT){
			AttackPt++;
		}else if(kind == DIFFENCE_PT){
			DiffencePt++;
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

function searchDanjon(){
	span1 = document.getElementById("searchDnSpan1");
	
	span1.innerHTML = "";
	if(Stamina <= 0){
		span1.innerHTML = "スタミナ不足で探索できませんでした<br>"
		
	}else if(OnButtleFlg == false){
		WalkPt++;
		Stamina--;
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