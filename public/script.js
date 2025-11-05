const input = document.getElementById('text-input');
const button = document.getElementById('generate-btn');
const preview = document.getElementById('gif-preview');
const downloadBtn = document.getElementById('download-btn');

button.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return alert('Enter some text');

  const res = await fetch('/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  const data = await res.json();
  preview.src = data.url + '?t=' + Date.now(); // prevent caching
  downloadBtn.href = data.url;
  downloadBtn.download = `lain_text_${Date.now()}.gif`;
});
