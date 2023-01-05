window.onload = () => {
  const warningEl = document.getElementById("warning");
  const videoElement = document.getElementById("videoElement");
  const captureBtn = document.getElementById("captureBtn");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const download = document.getElementById("download");
  const audioToggle = document.getElementById("audioToggle");
  const micAudioToggle = document.getElementById("micAudioToggle");

  if ("getDisplayMedia" in navigator.mediaDevices)
    warningEl.style.display = "none";
  console.log("1");
  let blobs;
  let blob;
  let rec;
  let stream;
  let voiceStream;
  let desktopStream;

  const mergeAudioStreams = (desktopStream, voiceStream) => {
    console.log("2");
    const context = new AudioContext();
    console.log("3");
    const destination = context.createMediaStreamDestination();
    console.log("4");
    let hasDesktop = false;
    let hasVoice = false;
    if (desktopStream && desktopStream.getAudioTracks().length > 0) {
      console.log("5");
      // If you don't want to share Audio from the desktop it should still work with just the voice.
      const source1 = context.createMediaStreamSource(desktopStream);
      const desktopGain = context.createGain();
      console.log("6");
      desktopGain.gain.value = 0.7;
      source1.connect(desktopGain).connect(destination);
      console.log("7");
      hasDesktop = true;
    }

    if (voiceStream && voiceStream.getAudioTracks().length > 0) {
      const source2 = context.createMediaStreamSource(voiceStream);
      console.log("8");
      const voiceGain = context.createGain();
      console.log("9");
      voiceGain.gain.value = 0.7;
      console.log("10");
      source2.connect(voiceGain).connect(destination);
      hasVoice = true;
    }

    return hasDesktop || hasVoice ? destination.stream.getAudioTracks() : [];
  };

  captureBtn.onclick = async () => {
    console.log("11");
    download.style.display = "none";
    const audio = audioToggle.checked || false;
    const mic = micAudioToggle.checked || false;

    desktopStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        ptional: [],
        mandatory: {
          maxWidth: 2560,
          maxHeight: 1440,
          maxFrameRate: 60,
        },
      },
      audio: audio,
    });
    console.log("12");
    if (mic === true) {
      console.log("13");
      voiceStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: mic,
      });
    }

    const tracks = [
      ...desktopStream.getVideoTracks(),
      ...mergeAudioStreams(desktopStream, voiceStream),
    ];

    console.log("Tracks to add to stream", tracks);
    console.log("14");
    stream = new MediaStream(tracks);
    console.log("Stream", stream);
    console.log("15");
    videoElement.srcObject = stream;
    videoElement.muted = true;
    console.log("16");

    blobs = [];

    rec = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp8,opus",
    });
    console.log("17");
    rec.ondataavailable = (e) => blobs.push(e.data);
    rec.onstop = async () => {
      console.log("18");
      //blobs.push(MediaRecorder.requestData());
      blob = new Blob(blobs, { type: "video/webm" });
      console.log("19");
      let url = window.URL.createObjectURL(blob);
      console.log("20");
      download.href = url;
      console.log("21");
      download.download = "test.webm";
      console.log("22");
      download.style.display = "block";
      console.log("23");
    };
    startBtn.disabled = false;
    captureBtn.disabled = true;
    audioToggle.disabled = true;
    micAudioToggle.disabled = true;
  };

  startBtn.onclick = () => {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    console.log("24");
    rec.start();
    console.log("25");
  };

  stopBtn.onclick = () => {
    captureBtn.disabled = false;
    audioToggle.disabled = false;
    micAudioToggle.disabled = false;
    startBtn.disabled = true;
    stopBtn.disabled = true;
    console.log("26");
    rec.stop();
    console.log("27");
    stream.getTracks().forEach((s) => s.stop());
    console.log("28");
    videoElement.srcObject = null;
    console.log("29")
    stream = null;
    console.log("30");
  };
};
