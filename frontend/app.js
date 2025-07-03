const form = document.getElementById('lofi-form');
const loading = document.getElementById('loading');
const audioSection = document.getElementById('audio-section');
const audioPlayer = document.getElementById('audio-player');
const downloadLink = document.getElementById('download-link');
const surpriseBtn = document.getElementById('surprise');
const waveformDiv = document.getElementById('waveform');
let wavesurfer = null;

const moods = [
  'chill sunset', 'cozy rain', 'retro daydream', 'study', 'sleep', 'nostalgic'
];
const effects = [
  'vinyl crackle', 'tape hum', 'city noise', 'rain'
];

const promptSuggestions = [
  'A relaxing lo-fi hip hop beat with soft piano and vinyl crackle',
  'Chill jazz instrumental with smooth saxophone and gentle drums',
  'Dreamy ambient synths with mellow guitar and slow tempo',
  'Warm acoustic guitar melody with soft background rain',
  'Nostalgic 90s boom bap beat with jazzy chords and vinyl noise',
  'Energetic EDM track with punchy bass and bright synths',
  'Upbeat pop song with catchy melody and claps',
  'Epic orchestral soundtrack with strings and brass',
  'Funky groove with slap bass and wah guitar',
  'Dark trap beat with heavy 808s and eerie bells',
  'Peaceful morning in a quiet forest, birds chirping and soft pads',
  'Rainy night in the city, distant thunder and smooth jazz',
  'Retro video game music with chiptune synths and fast tempo',
  'Cinematic adventure with soaring strings and powerful percussion',
  'Spacey electronic music with shimmering arpeggios and deep bass',
  'Seamless loop, perfect for background music',
  'Loopable chillhop with jazzy chords',
  'Ambient textures with evolving soundscape',
  'Minimalist piano with gentle reverb',
  'Groovy funk with brass section'
];

const customPromptInput = document.getElementById('custom-prompt');
const promptSuggestionsDiv = document.getElementById('prompt-suggestions');

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
  const duration = document.getElementById('duration').value;

  // Compose prompt
  const customPrompt = document.getElementById('custom-prompt').value.trim();
  let prompt = '';
  if (customPrompt !== '') {
    prompt = customPrompt;
    if (mood !== 'chill sunset') prompt += `, mood: ${mood}`;
    if (tempoVal !== '1') prompt += `, tempo: ${tempoVal === '0' ? 'slow' : tempoVal === '2' ? 'fast' : 'medium'}`;
    if (vibe !== '50') prompt += `, vibe: ${vibe}/100`;
    if (selectedEffects.length > 0) prompt += `, effects: ${selectedEffects.join(', ')}`;
  } else {
    // Use the old logic to generate prompt from options
    prompt = `${mood}, ${tempoVal === '0' ? 'slow' : tempoVal === '2' ? 'fast' : 'medium'} tempo, vibe ${vibe}/100`;
    if (selectedEffects.length > 0) {
      prompt += ', ' + selectedEffects.join(', ');
    }
  }

  // For now, generate a random melody file (simulate, as file upload is not in UI yet)
  // In production, you would allow users to upload a melody or generate one
  // We'll send an empty file for now
  const emptyBlob = new Blob([new Uint8Array([0])], { type: 'audio/wav' });
  const formData = new FormData();
  formData.append('content', emptyBlob, 'melody.wav');
  formData.append('prompt', prompt);
  formData.append('duration', duration);

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
    // Waveform visualization
    if (wavesurfer) {
      wavesurfer.destroy();
    }
    waveformDiv.innerHTML = '';
    wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#a78bfa',
      progressColor: '#6d28d9',
      height: 80,
      responsive: true,
      barWidth: 2,
      cursorColor: '#fff',
    });
    wavesurfer.load(audioUrl);
    // Sync play/pause with audio element
    audioPlayer.onplay = () => wavesurfer.play();
    audioPlayer.onpause = () => wavesurfer.pause();
    wavesurfer.on('seek', (progress) => {
      audioPlayer.currentTime = progress * audioPlayer.duration;
    });
    loading.classList.add('hidden');
    loading.innerHTML = '';
    audioSection.classList.remove('hidden');
  } catch (err) {
    loading.classList.add('hidden');
    loading.innerHTML = '';
    alert('Error generating audio: ' + err.message);
  }
});

customPromptInput.addEventListener('input', function() {
  const value = this.value.toLowerCase();
  promptSuggestionsDiv.innerHTML = '';
  if (value === '') {
    promptSuggestionsDiv.classList.add('hidden');
    return;
  }
  const matches = promptSuggestions.filter(s => s.toLowerCase().includes(value));
  if (matches.length === 0) {
    promptSuggestionsDiv.classList.add('hidden');
    return;
  }
  promptSuggestionsDiv.classList.remove('hidden');
  matches.forEach(suggestion => {
    const div = document.createElement('div');
    div.className = 'px-3 py-2 cursor-pointer hover:bg-gray-600';
    div.textContent = suggestion;
    div.onclick = () => {
      customPromptInput.value = suggestion;
      promptSuggestionsDiv.classList.add('hidden');
      customPromptInput.focus();
    };
    promptSuggestionsDiv.appendChild(div);
  });
});

customPromptInput.addEventListener('blur', function() {
  setTimeout(() => promptSuggestionsDiv.classList.add('hidden'), 150);
}); 