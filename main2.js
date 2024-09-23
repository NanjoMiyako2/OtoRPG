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

const buyItemNames = ["木の棒", "鉄の棒", "鉄の剣", "鋼の剣",
					  "木の盾", "鉄の盾", "銀の盾", "チタンの盾"]
const buyItemPrices = [10, 20, 30, 40,
					   10, 20, 30, 40]
					   
HavingItems = [0, 0, 0, 0,
			  0, 0, 0, 0]
			  
SoubiItemFlg = [0, 0, 0, 0,
				0, 0, 0, 0]
					   

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
        }
        
        document.getElementsByClassName('content')[index].classList.add('is-display');
    };
}, false);




function PrintParams(){
  span1 = document.getElementById("stamina1");
  span2 = document.getElementById("hp1");
  span3 = document.getElementById("attackPt1");
  span4 = document.getElementById("diffencePt1");
  span5 = document.getElementById("money1");
  
    
  span1.innerHTML = Stamina;
  span2.innerHTML = LifePt;
  span3.innerHTML = AttackPt;
  span4.innerHTML = DiffencePt;
  span5.innerHTML = Gold;
  
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
	
}
PrintParams();
PrintTotalWalk();
PrintHavingItems();



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
		
	}else{
		WalkPt++;
		Stamina--;
		span1.innerHTML = "ダンジョン探索をしました<br>"

		
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