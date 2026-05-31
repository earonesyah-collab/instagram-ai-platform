const API_BASE = "https://YOUR-WORKER.workers.dev";

document.getElementById("tiktokBtn").addEventListener("click", async () => {
  const username = prompt("Masukkan username TikTok:");

  if (!username) return;

  try {
    const res = await fetch(`${API_BASE}/tiktok?username=${username}`);
    const data = await res.json();

    // isi otomatis ke input
    document.getElementById("followers").value = data.followers;
    document.getElementById("likes").value = data.likes;
    document.getElementById("comments").value = data.comments;
    document.getElementById("shares").value = data.shares;
    document.getElementById("saves").value = data.saves;

    // update UI
    document.getElementById("analysisResult").innerText =
      `📱 Data TikTok @${username} berhasil dimuat`;

    console.log("TikTok Data:", data);

  } catch (err) {
    console.error(err);
    alert("Gagal mengambil data TikTok");
  }
});
