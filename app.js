const API_URL = "https://cool-cell-c8d3.ear-one-syah.workers.dev";

let chart = null;

let historyData =
JSON.parse(
localStorage.getItem("engagement_history") || "[]"
);

/* ELEMENTS */

const followers = document.getElementById("followers");
const likes = document.getElementById("likes");
const comments = document.getElementById("comments");
const shares = document.getElementById("shares");
const saves = document.getElementById("saves");
const caption = document.getElementById("caption");
const contentType = document.getElementById("contentType");

const erEl = document.getElementById("er");
const predictionEl = document.getElementById("prediction");
const totalEl = document.getElementById("totalEngagement");
const statusEl = document.getElementById("status");

const historyContainer =
document.getElementById("historyContainer");

const previewTable =
document.getElementById("previewTable");

/* BUTTONS */

document.getElementById("themeBtn")
.addEventListener("click", toggleTheme);

document.getElementById("analyzeBtn")
.addEventListener("click", analyzeLocal);

document.getElementById("historyBtn")
.addEventListener("click", renderHistory);

document.getElementById("exportBtn")
.addEventListener("click", exportJSON);

document.getElementById("csvFile")
.addEventListener("change", handleCSV);

document.getElementById("mcpBtn")
.addEventListener("click", connectAPI);

/* THEME */

function toggleTheme() {
document.body.classList.toggle("light");
}

/* CALCULATION */

function calculateER(
followers,
likes,
comments,
shares,
saves
) {

if (followers <= 0) return 0;

const total =
likes +
comments +
shares +
saves;

return (total / followers) * 100;

}

function predictEngagement(
er,
total
) {

return Number(
(
er * 0.8 +
Math.log10(total + 1) * 5
).toFixed(2)
);

}

/* ANALYSIS */

function analyzeLocal() {

const f = Number(followers.value) || 0;
const l = Number(likes.value) || 0;
const c = Number(comments.value) || 0;
const sh = Number(shares.value) || 0;
const sv = Number(saves.value) || 0;

if (f <= 0) {
alert("Followers harus lebih dari 0");
return;
}

const total =
l + c + sh + sv;

const er =
calculateER(
f,
l,
c,
sh,
sv
);

const prediction =
predictEngagement(
er,
total
);

updateDashboard({
er,
prediction,
total,
status:
er > 10
? "🔥 VIRAL"
: er > 5
? "⚡ MEDIUM"
: "📉 LOW"
});

saveHistory({
    er,
    prediction,
    total,
    date:
    new Date().toISOString()
});

generateAnalysis({
    followers: f,
    likes: l,
    comments: c,
    shares: sh,
    saves: sv,
    contentType: contentType.value,
    caption: caption.value
});

}


/* DASHBOARD */

function updateDashboard(data) {

erEl.innerText =
Number(data.er).toFixed(2) + "%";

predictionEl.innerText =
Number(data.prediction).toFixed(2) + "%";

totalEl.innerText =
data.total;

statusEl.innerText =
data.status;

updateChart();

}

/* CHART */

function updateChart() {

const canvas =
document.getElementById(
"engagementChart"
);

if (!canvas) return;

const ctx =
canvas.getContext("2d");

if (chart) {
chart.destroy();
}

chart = new Chart(ctx, {

type: "line",

data: {

labels:
historyData.map(
(_, i) => i + 1
),

datasets: [{

label:
"Engagement Rate",

data:
historyData.map(
h => h.er
)

}]

},

options: {
responsive: true
}

});

}

/* HISTORY */

function saveHistory(item) {

historyData.push(item);

localStorage.setItem(
"engagement_history",
JSON.stringify(historyData)
);

renderHistory();

}

function renderHistory() {

if (!historyData.length) {

historyContainer.innerHTML =
"Belum ada data";

return;

}

historyContainer.innerHTML =
historyData
.slice()
.reverse()
.map(item => `

<div class="history-item"><strong>
ER:
${item.er.toFixed(2)}%
</strong><br>Prediction:
${item.prediction.toFixed(2)}%

<br>Total:
${item.total}

</div>`)
.join("");

}

/* EXPORT */

function exportJSON() {

const blob = new Blob(
[
JSON.stringify(
historyData,
null,
2
)
],
{
type:
"application/json"
}
);

const a =
document.createElement("a");

a.href =
URL.createObjectURL(blob);

a.download =
"engagement-history.json";

a.click();

}

/* CLOUDLFARE API */

async function connectAPI() {

try {

statusEl.innerText =
"Connecting...";

const response =
await fetch(
API_URL + "/api/analytics"
);

const data =
await response.json();

updateDashboard({

er:
data.engagement_rate || 0,

prediction:
data.prediction || 0,

total:
data.total_engagement || 0,

status:
data.status || "Online"

});

}
catch (err) {

console.error(err);

statusEl.innerText =
"🔴 Offline";

}

}

async function checkBackend() {

try {

const response =
await fetch(API_URL);

await response.json();

statusEl.innerText =
"🟢 Online";

}
catch {

statusEl.innerText =
"🔴 Offline";

}

}

/* CSV */

function generateAnalysis(data){

    const {
        followers,
        likes,
        comments,
        shares,
        saves,
        contentType,
        caption
    } = data;

    const total =
        likes + comments + shares + saves;

    const er =
        (total / followers) * 100;

    let score = 0;

    // Engagement Rate
    if(er > 10) score += 40;
    else if(er > 5) score += 30;
    else if(er > 2) score += 20;
    else score += 10;

    // Saves
    if(saves > likes * 0.2) score += 20;

    // Shares
    if(shares > likes * 0.15) score += 20;

    // Comments
    if(comments > likes * 0.05) score += 10;

    // Caption
    if(caption.length > 80) score += 10;

    let analysis = "";
    let recommendation = "";

    if(score >= 80){

        analysis =
        "Konten memiliki potensi viral tinggi. Audiens tidak hanya memberi like tetapi juga menyimpan dan membagikan konten.";

        recommendation =
        "Replikasi format konten ini dan buat seri lanjutan dengan topik serupa.";

    }else if(score >= 60){

        analysis =
        "Konten berkinerja baik dan menghasilkan interaksi yang sehat.";

        recommendation =
        "Tingkatkan CTA pada caption untuk mendorong lebih banyak komentar dan share.";

    }else if(score >= 40){

        analysis =
        "Konten mendapatkan perhatian tetapi belum cukup kuat untuk mendorong distribusi organik.";

        recommendation =
        "Fokus pada hook 3 detik pertama dan gunakan format Reel.";

    }else{

        analysis =
        "Konten kurang menarik bagi audiens dan berpotensi memiliki jangkauan rendah.";

        recommendation =
        "Ubah konsep konten, optimalkan thumbnail, caption, dan waktu posting.";
    }

    // rekomendasi spesifik
    if(contentType === "Tutorial"){
        recommendation +=
        "<br>• Tutorial singkat 15-30 detik biasanya memiliki retention lebih tinggi.";
    }

    if(contentType === "Edukatif"){
        recommendation +=
        "<br>• Tambahkan poin carousel agar jumlah save meningkat.";
    }

    if(contentType === "Promosi"){
        recommendation +=
        "<br>• Kurangi hard selling dan tambahkan storytelling.";
    }

    if(contentType === "Hiburan"){
        recommendation +=
        "<br>• Gunakan audio tren untuk meningkatkan discoverability.";
    }

    document.getElementById("analysisResult")
        .innerHTML = analysis;

    document.getElementById("recommendationResult")
        .innerHTML = recommendation;

    return score;
}

function handleCSV(event) {

const file =
event.target.files[0];

if (!file) return;

const reader =
new FileReader();

reader.onload =
function(e) {

const rows =
e.target.result
.split("\n");

let html =
"<table>";

rows.forEach(row => {

html += "<tr>";

row.split(",")
.forEach(col => {

html +=
"<td>${col}</td>";

});

html += "</tr>";

});

html += "</table>";

previewTable.innerHTML =
html;

};

reader.readAsText(file);

}

/* INIT */

renderHistory();

updateChart();

checkBackend();

setInterval(
checkBackend,
10000
);
