const API_BASE = "https://cool-cell-c8d3.ear-one-syah.workers.dev";

// =========================
// TIKTOK BUTTON (STABLE)
// =========================
document.getElementById("tiktokBtn").addEventListener("click", async () => {
  const username = prompt("Masukkan username TikTok:");
  if (!username) return;

  try {
    const url = `${API_BASE}/tiktok?username=${encodeURIComponent(username)}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("HTTP Error: " + res.status);
    }

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "API error");
    }

    document.getElementById("followers").value = data.followers;
    document.getElementById("likes").value = data.likes;
    document.getElementById("comments").value = data.comments;
    document.getElementById("shares").value = data.shares;
    document.getElementById("saves").value = data.saves;

    document.getElementById("analysisResult").innerText =
      `✅ TikTok @${username} berhasil dimuat`;

  } catch (err) {
    console.error(err);
    alert("❌ Gagal mengambil data TikTok. Cek Worker/API");
  }
});
