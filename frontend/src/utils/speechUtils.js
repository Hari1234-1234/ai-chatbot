export function speakText(text) {
  if (!text || !("speechSynthesis" in window)) {
    alert("Text-to-Speech is not supported in this browser.");
    return;
  }

  // Stop any previous speech
  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  // Configure voice
  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 1;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);
}

export function pauseSpeech() {
  window.speechSynthesis.pause();
}

export function resumeSpeech() {
  window.speechSynthesis.resume();
}

export function stopSpeech() {
  window.speechSynthesis.cancel();
}
