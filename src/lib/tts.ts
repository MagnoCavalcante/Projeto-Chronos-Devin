// Text-to-Speech utility using the Web Speech API
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string, lang = 'pt-BR'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSynthesisSupported()) {
      reject(new Error('Navegador não suporta síntese de voz'));
      return;
    }

    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a Portuguese voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith('pt') || v.lang.toLowerCase().includes('brazil')
    );
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };

    utterance.onerror = (event) => {
      currentUtterance = null;
      reject(new Error(`Erro na narração: ${event.error}`));
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return isSpeechSynthesisSupported() && window.speechSynthesis.speaking;
}

// Ensure voices are loaded (some browsers load asynchronously)
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const handleVoicesChanged = () => {
      resolve(window.speechSynthesis.getVoices());
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
  });
}
