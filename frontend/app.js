const form = document.getElementById('lofi-form');
const loading = document.getElementById('loading');
const audioSection = document.getElementById('audio-section');
const audioPlayer = document.getElementById('audio-player');
const downloadLink = document.getElementById('download-link');
const surpriseBtn = document.getElementById('surprise');

const moods = [
  'chill sunset', 'cozy rain', 'retro daydream', 'study', 'sleep', 'nostalgic'
];
const effects = [
  'vinyl crackle', 'tape hum', 'city noise', 'rain'
];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

surpriseBtn.addEventListener('click', () => {
  document.getElementById('mood').value = moods[getRandomInt(moods.length)];
  document.getElementById('tempo').value = getRandomInt(3);
  document.getElementById('vibe').value = getRandomInt(101);
  document.querySelectorAll('input[type=checkbox]').forEach((cb) => {
    cb.checked = Math.random() > 0.5;
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  loading.classList.remove('hidden');
  loading.innerHTML = `
    <svg class="animate-spin h-8 w-8 text-purple-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
    <span>Generating your vibe... <br><span class='text-xs text-gray-400'>(est. 20-40s)</span></span>
  `;
  audioSection.classList.add('hidden');

  // Collect form data
  const mood = document.getElementById('mood').value;
  const tempoVal = document.getElementById('tempo').value;
  const tempo = tempoVal === '0' ? 'slow' : tempoVal === '1' ? 'medium' : 'fast';
  const vibe = document.getElementById('vibe').value;
  const selectedEffects = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value);

  // Compose prompt
  let prompt = `${mood}, ${tempo} tempo, vibe ${vibe}/100`;
  if (selectedEffects.length > 0) {
    prompt += ', ' + selectedEffects.join(', ');
  }

  // For now, generate a random melody file (simulate, as file upload is not in UI yet)
  // In production, you would allow users to upload a melody or generate one
  // We'll send an empty file for now
  const emptyBlob = new Blob([new Uint8Array([0])], { type: 'audio/wav' });
  const formData = new FormData();
  formData.append('content', emptyBlob, 'melody.wav');
  formData.append('prompt', prompt);

  try {
    const response = await fetch('http://127.0.0.1:8000/', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to generate audio');
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    audioPlayer.src = audioUrl;
    downloadLink.href = audioUrl;
    loading.classList.add('hidden');
    loading.innerHTML = '';
    audioSection.classList.remove('hidden');
  } catch (err) {
    loading.classList.add('hidden');
    loading.innerHTML = '';
    alert('Error generating audio: ' + err.message);
  }
}); 