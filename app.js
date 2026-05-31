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

function generateEvaluation(data) {
  const followers = Number(data.followers || 0);
  const total =
    Number(data.likes || 0) +
    Number(data.comments || 0) +
    Number(data.shares || 0) +
    Number(data.saves || 0);

  const er = followers ? (total / followers) * 100 : 0;

  let status = "";
  let recommendation = "";

  // =========================
  // LOGIC EVALUATION
  // =========================
  if (er >= 10) {
    status = "🔥 VIRAL / HIGH PERFORMANCE";
    recommendation =
      "Konten kamu sangat bagus. Pertahankan format video, gunakan trend audio, dan posting konsisten 1-2x sehari.";
  } else if (er >= 5) {
    status = "📈 GOOD PERFORMANCE";
    recommendation =
      "Engagement cukup baik. Tingkatkan hook di 3 detik pertama dan gunakan hashtag niche lebih spesifik.";
  } else if (er >= 2) {
    status = "⚠️ AVERAGE";
    recommendation =
      "Konten perlu ditingkatkan. Fokus pada storytelling, caption yang lebih menarik, dan konsistensi posting.";
  } else {
    status = "❌ LOW PERFORMANCE";
    recommendation =
      "Engagement rendah. Perbaiki kualitas video, gunakan tren TikTok, dan optimasi jam upload.";
  }

  return {
    engagementRate: er.toFixed(2),
    status,
    recommendation,
    totalEngagement: total
  };
}
