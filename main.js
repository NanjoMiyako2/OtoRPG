const AudioContext = window.AudioContext || window.webkitAudioContext;
const meter = document.getElementById('volume');


volumeThre = 30

ThretholdCount = 0;
UpperVolCount = 0;
UpperVolEventCount = 0;

function render(percent) {
  console.log('Percent:', percent);
  meter.style.width = Math.min(Math.max(0, percent), 100) + '%';
  
  if(percent > volumeThre){
	ThretholdCount++;
	UpperVolCount++;
	
	if(ThretholdCount >= 100){
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

async function start() {
  const media = await navigator.mediaDevices
    .getUserMedia({ audio: true })
    .catch(console.error);
  const ctx = new AudioContext();
  console.log('Sampling Rate:', ctx.sampleRate);

  const processor = ctx.createScriptProcessor(1024, 1, 1);
  processor.onaudioprocess = onProcess;
  processor.connect(ctx.destination);

  const source = ctx.createMediaStreamSource(media);
  source.connect(processor);
}