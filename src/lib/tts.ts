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

export function getVoiceQualityScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const isPt = voice.lang.toLowerCase().startsWith('pt');
  const isCloud = voice.localService === false;

  let score = 0;

  // Prefer cloud/online voices (usually much more natural)
  if (isCloud) score += 50;

  // Prefer neural / premium / enhanced voices
  if (name.includes('neural')) score += 30;
  if (name.includes('wavenet')) score += 30;
  if (name.includes('premium')) score += 25;
  if (name.includes('enhanced')) score += 20;
  if (name.includes('natural')) score += 20;

  // Some browsers/OS expose high-quality voices with these keywords
  if (name.includes('online')) score += 15;
  if (name.includes('azure')) score += 15;

  // Portuguese is strongly preferred
  if (isPt) score += 40;

  // Penalize old/crude local voices
  if (name.includes('compact')) score -= 20;
  if (name.includes('low quality')) score -= 30;

  return score;
}

export function rankVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return [...voices].sort((a, b) => getVoiceQualityScore(b) - getVoiceQualityScore(a));
}

export function getRecommendedVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return rankVoices(voices).filter((v) => getVoiceQualityScore(v) > 0);
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
  const ranked = rankVoices(voices);

  const storedName = getStoredVoiceName();
  if (storedName) {
    const exact = voices.find((v) => v.name === storedName);
    if (exact) return exact;
  }

  // Prefer the top-ranked voice, ideally Portuguese and high-quality
  const bestPt = ranked.find((v) => v.lang.toLowerCase().startsWith('pt'));
  if (bestPt) return bestPt;

  // Fallback to any top-ranked voice
  return ranked[0] || null;
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
