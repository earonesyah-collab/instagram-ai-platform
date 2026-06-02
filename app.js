

const API_URL = "http://localhost:3000";

let chart = null;

let historyData =
JSON.parse(
localStorage.getItem(
"engagement_history"
) || "[]"
);

const savedTheme =
localStorage.getItem(
    "theme"
);

if(savedTheme === "light"){

    document.body.classList.add(
        "light"
    );

}

/* ELEMENTS */

const followers =
document.getElementById("followers");

const likes =
document.getElementById("likes");

const comments =
document.getElementById("comments");

const shares =
document.getElementById("shares");

const saves =
document.getElementById("saves");

const caption =
document.getElementById("caption");

const contentType =
document.getElementById("contentType");

const erEl =
document.getElementById("er");

const predictionEl =
document.getElementById("prediction");

const totalEl =
document.getElementById("totalEngagement");

const statusEl =
document.getElementById("status");

const historyContainer =
document.getElementById(
"historyContainer"
);

const previewTable =
document.getElementById(
"previewTable"
);

const tiktokFile =
document.getElementById("tiktokFile");

tiktokFile.addEventListener(
    "change",
    (e) => {

        const file =
        e.target.files[0];

        if(!file) return;

        const reader =
        new FileReader();

        reader.onload = () => {

            console.log(
                reader.result
            );

            document.getElementById(
                "tiktokStatus"
            ).textContent =
            "Data TikTok berhasil dimuat";

        };

        reader.readAsText(file);

    }
);
/* BUTTONS */
const tiktokBtn =
document.getElementById("tiktokBtn");

tiktokBtn.addEventListener("click", async () => {

    document.getElementById(
        "tiktokStatus"
    ).textContent = "Memuat...";

    try {

        // simulasi request API
        await new Promise(resolve =>
            setTimeout(resolve, 2000)
        );

        const followers = 25000;
        const likes = 3200;
        const comments = 280;
        const shares = 150;

        const er =
        (
            (likes + comments + shares)
            / followers
        ) * 100;

        document.getElementById(
            "tiktokStatus"
        ).textContent = "Akun Aktif";

        document.getElementById(
            "tiktokER"
        ).textContent =
        er.toFixed(2) + "%";

        document.getElementById(
            "tiktokRecommendation"
        ).textContent =
        er > 5
        ? "Performa sangat baik"
        : "Perlu meningkatkan interaksi";

    } catch(err){

        document.getElementById(
            "tiktokStatus"
        ).textContent = "Gagal Memuat";

        console.error(err);
    }

});

/* SAFE EVENT BIND */

function bindEvent(
id,
event,
callback
){

    const element =
    document.getElementById(id);

    if(!element){
        console.warn(
            `Element ${id} tidak ditemukan`
        );
        return;
    }

    element.addEventListener(
        event,
        callback
    );

}

/* BUTTONS */

bindEvent(
    "themeBtn",
    "click",
    toggleTheme
);

bindEvent(
    "analyzeBtn",
    "click",
    analyzeLocal
);

bindEvent(
    "mcpBtn",
    "click",
    connectMCP
);

bindEvent(
    "historyBtn",
    "click",
    loadHistory
);

bindEvent(
    "exportBtn",
    "click",
    exportJSON
);

bindEvent(
    "csvFile",
    "change",
    handleCSV
);

/* OPTIONAL */

bindEvent(
    "excelFile",
    "change",
    handleExcel
);

bindEvent(
    "tiktokBtn",
    "click",
    loadTikTokData
);

function handleExcel(){

    alert(
        "Import Excel belum tersedia"
    );

}

function loadTikTokData(){

    alert(
        "TikTok Loader belum tersedia"
    );

}

/* THEME */

function toggleTheme(){

    document.body.classList.toggle(
        "light"
    );

    localStorage.setItem(

        "theme",

        document.body.classList.contains(
            "light"
        )
        ? "light"
        : "dark"

    );

}

/* ENGAGEMENT */

function calculateER(
followers,
likes,
comments,
shares,
saves
){

if(
    followers <= 0
){
    return 0;
}

const total =
    likes +
    comments +
    shares +
    saves;

return (
    total /
    followers
) * 100;

}

function predictEngagement(
er,
total
){

return Number(

    (
        er * 0.8 +

        Math.log10(
            total + 1
        ) * 5

    ).toFixed(2)

);

}

/* LOCAL ANALYSIS */

function analyzeLocal(){

const f =
    Number(
        followers.value
    ) || 0;

const l =
    Number(
        likes.value
    ) || 0;

const c =
    Number(
        comments.value
    ) || 0;

const sh =
    Number(
        shares.value
    ) || 0;

const sv =
    Number(
        saves.value
    ) || 0;

if(f <= 0){

    alert(
        "Followers harus lebih dari 0"
    );

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
? " VIRAL"
: er > 5
? " MEDIUM"
: " LOW"
});

saveLocalHistory({
    er,
    prediction,
    total,
    date:
    new Date()
    .toISOString()
});

}

/* UPDATE UI */

function updateDashboard(
data
){

erEl.innerText =
    Number(
        data.er
    ).toFixed(2)
    + "%";

predictionEl.innerText =
    Number(
        data.prediction
    ).toFixed(2)
    + "%";

totalEl.innerText =
    data.total;

statusEl.innerText =
    data.status;

updateChart();

}

/* CHART */

function updateChart(){

    const canvas =
    document.getElementById(
        "engagementChart"
    );

    if(!canvas){
        console.warn(
            "Canvas engagementChart tidak ditemukan"
        );
        return;
    }

    const ctx =
    canvas.getContext("2d");

    if(!ctx){
        console.warn(
            "Context canvas gagal dibuat"
        );
        return;
    }

    if(chart){
        chart.destroy();
        chart = null;
    }

    chart =
    new Chart(ctx,{

        type:"line",

        data:{

            labels:
            historyData.map(
                (_,i)=>i+1
            ),

            datasets:[{

                label:
                "Engagement Rate",

                data:
                historyData.map(
                    item=>item.er
                ),

                borderWidth:2,

                tension:0.3,

                fill:false

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            animation:{
                duration:500
            },

            plugins:{
                legend:{
                    display:true
                }
            },

            scales:{

                y:{
                    beginAtZero:true
                }

            }

        }

    });

}

/* SAVE HISTORY */

function saveLocalHistory(
item
){

    historyData.push(
        item
    );

    /* BATASI MAKSIMAL 100 DATA */

    if(
        historyData.length > 100
    ){
        historyData.shift();
    }

    localStorage.setItem(

        "engagement_history",

        JSON.stringify(
            historyData
        )

    );

    renderHistory();

    updateChart();

}
/* RENDER HISTORY */

function renderHistory(){

if(
    historyData.length === 0
){

    historyContainer
    .innerHTML =
    "Belum ada data";

    return;
}

historyContainer
.innerHTML =
historyData
.slice()
.reverse()
.map(item=>`

    <div class="history-item">

        <strong>
        ER:
        ${item.er.toFixed(2)}%
        </strong>

        <br>

        Prediction:
        ${item.prediction.toFixed(2)}%

        <br>

        Total:
        ${item.total}

    </div>

`)
.join("");

}

/* EXPORT */

function exportJSON(){

    const blob =
    new Blob(

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

    const url =
    URL.createObjectURL(
        blob
    );

    const a =
    document.createElement(
        "a"
    );

    a.href = url;

    a.download =
    "engagement-history.json";

    document.body.appendChild(
        a
    );

    a.click();

    document.body.removeChild(
        a
    );

    setTimeout(()=>{

        URL.revokeObjectURL(
            url
        );

    },100);

}

/* MCP */

async function connectMCP(){

try{

    const response =
    await fetch(

        API_URL +
        "/mcp",

        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                followers:
                Number(
                    followers.value
                ),

                likes:
                Number(
                    likes.value
                ),

                comments:
                Number(
                    comments.value
                ),

                shares:
                Number(
                    shares.value
                ),

                saves:
                Number(
                    saves.value
                ),

                caption:
                caption.value,

                contentType:
                contentType.value

            })

        }

    );

    const data =
    await response.json();

    updateDashboard({

        er:
        data.engagement_rate,

        prediction:
        data.prediction,

        total:
        data.total_engagement,

        status:
        data.status

    });

}
catch(err){

    alert(
        "Backend tidak terhubung"
    );

    console.error(
        err
    );

}

}

/* LOAD HISTORY */

async function loadHistory(){

try{

    const response =
    await fetch(
        API_URL +
        "/history"
    );

    const data =
    await response.json();

    console.log(
        data
    );

}
catch(err){

    console.error(
        err
    );
}

}

function escapeHtml(text){

 return text
 .replace(/&/g,"&amp;")
 .replace(/</g,"&lt;")
 .replace(/>/g,"&gt;")
 .replace(/"/g,"&quot;")
 .replace(/'/g,"&#039;");

}

/* CSV */

function handleCSV(
event
){

const file =
event.target.files[0];

if(!file)
    return;

const reader =
new FileReader();

reader.onload =
function(e){

    const text =
    e.target.result;

    const rows =
    text.split(
        "\n"
    );

    let html =
    "<table>";

    rows.forEach(
    row=>{

        html +=
        "<tr>";

        row
        .split(",")

        .forEach(
        col=>{

            html +=
`<td>${escapeHtml(col)}</td>`;

        });

        html +=
        "</tr>";

    });

    html +=
    "</table>";

    previewTable
    .innerHTML =
    html;

};

reader.readAsText(
    file
);

}

/* INIT */

document.addEventListener(
"DOMContentLoaded",
()=>{

    renderHistory();

    if(historyData.length){
        updateChart();
    }

}
);

document.getElementById("analyzeBtn").addEventListener("click", () => {

    const followers = Number(
        document.getElementById("followers").value
    );

    const likes = Number(
        document.getElementById("likes").value
    );

    const comments = Number(
        document.getElementById("comments").value
    );

    const shares = Number(
        document.getElementById("shares").value
    );

    const saves = Number(
        document.getElementById("saves").value
    );

    const contentType =
        document.getElementById("contentType").value;

    if (followers <= 0) {
        alert("Masukkan jumlah followers");
        return;
    }

    const totalEngagement =
        likes +
        comments +
        shares +
        saves;

    const er =
        (totalEngagement / followers) * 100;

    let prediction = er;

    if (contentType === "Tutorial")
        prediction *= 1.15;

    if (contentType === "Edukatif")
        prediction *= 1.10;

    if (contentType === "Motivasi")
        prediction *= 1.05;

    if (contentType === "Promosi")
        prediction *= 0.90;

    prediction = prediction.toFixed(2);

    let status = "";

    if (er < 1)
        status = "Kurang";

    else if (er < 3)
        status = "Cukup";

    else if (er < 6)
        status = "Bagus";

    else
        status = "Viral";

    document.getElementById("er").textContent =
        er.toFixed(2) + "%";

    document.getElementById("prediction").textContent =
        prediction + "%";

    document.getElementById("totalEngagement").textContent =
        totalEngagement;

    document.getElementById("status").textContent =
        status;

    document.getElementById("analysisResult").innerHTML = `
        <b>Analisa AI:</b><br>
        Total engagement: ${totalEngagement}<br>
        Engagement Rate: ${er.toFixed(2)}%<br>
        Jenis konten: ${contentType}<br>
        Status performa: ${status}
    `;

    let recommendation = "";

    if (er < 1) {
        recommendation =
        "Perbanyak Reels, gunakan hashtag relevan, dan posting pada jam aktif.";
    }
    else if (er < 3) {
        recommendation =
        "Tambahkan CTA pada caption dan tingkatkan kualitas visual.";
    }
    else if (er < 6) {
        recommendation =
        "Performa bagus. Pertahankan pola konten saat ini.";
    }
    else {
        recommendation =
        "Konten sangat kuat. Pertimbangkan boosting atau iklan untuk menjangkau audiens lebih luas.";
    }

    document.getElementById(
        "recommendationResult"
    ).textContent = recommendation;

});
