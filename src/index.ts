import Scanner from 'zbar.wasm';

function hasGetUserMedia() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

interface Window {
  stream: any
}

(async () => {
  const scanner = await Scanner({locateFile: (file: any) => console.log(file)});
  console.log(scanner);
})();

if (hasGetUserMedia()) {
  const videoElement = document.querySelector('video');
  const videoSelect: HTMLSelectElement = document.querySelector('select#videoSelect');

  navigator.mediaDevices.enumerateDevices()
    .then(gotDevices)
    .then(getStream)
    .catch(handleError);

  videoSelect.onchange = getStream;

  function gotDevices(deviceInfos: any[]) {
    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      const option = document.createElement('option');
      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || 'camera ' +
          (videoSelect.length + 1);
        videoSelect.appendChild(option);
      } else {
        console.log('Found another kind of device: ', deviceInfo);
      }
    }
  }

  function getStream() {
    if (window.stream) {
      window.stream.getTracks().forEach(function(track) {
        track.stop();
      });
    }

    const constraints = {
      video: {
        deviceId: { exact: videoSelect.value }
      }
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(gotStream)
      .catch(handleError);
  }

  function gotStream(stream: MediaStream | MediaSource | Blob) {
    window.stream = stream; // make stream available to console
    videoElement.srcObject = stream;
  }

  function handleError(error: any) {
    console.error('Error: ', error);
  }
} else {
  alert('getUserMedia() is not supported by your browser');
}
