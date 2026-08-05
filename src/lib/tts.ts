// Text-to-Speech utility using the Web Speech API
let currentUtterance: SpeechSynthesisUtterance | null = null;
const SELECTED_VOICE_KEY = 'chronos_tts_voice';

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export async function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSynthesisSupported()) return [];

  const load = (): SpeechSynthesisVoice[] => window.speechSynthesis.getVoices();

  let voices = load();
  if (voices.length > 0) return voices;

  return new Promise((resolve) => {
    const handle = () => {
      voices = load();
      window.speechSynthesis.removeEventListener('voiceschanged', handle);
      resolve(voices);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handle);
  });
}

export function getStoredVoiceName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SELECTED_VOICE_KEY);
}

export function setStoredVoiceName(name: string | null): void {
  if (typeof window === 'undefined') return;
  if (name) {
    localStorage.setItem(SELECTED_VOICE_KEY, name);
  } else {
    localStorage.removeItem(SELECTED_VOICE_KEY);
  }
}

async function pickVoice(): Promise<SpeechSynthesisVoice | null> {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = await getAvailableVoices();

  const storedName = getStoredVoiceName();
  if (storedName) {
    const exact = voices.find((v) => v.name === storedName);
    if (exact) return exact;
  }

  const ptBR = voices.find((v) => v.lang.toLowerCase() === 'pt-br');
  if (ptBR) return ptBR;

  const pt = voices.find((v) => v.lang.toLowerCase().startsWith('pt'));
  if (pt) return pt;

  return null;
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

    pickVoice()
      .then((voice) => {
        if (voice) {
          utterance.voice = voice;
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
      })
      .catch(() => {
        currentUtterance = null;
        reject(new Error('Não foi possível carregar uma voz'));
      });
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

// Load voices early so they are available when the user opens the selector
if (isSpeechSynthesisSupported()) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
