const API_URL = "http://localhost:3000";

let chart = null;

let historyData =
JSON.parse(
localStorage.getItem(
"engagement_history"
) || "[]"
);

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

/* BUTTONS */

document
.getElementById("themeBtn")
.addEventListener(
"click",
toggleTheme
);

document
.getElementById("analyzeBtn")
.addEventListener(
"click",
analyzeLocal
);

document
.getElementById("mcpBtn")
.addEventListener(
"click",
connectMCP
);

document
.getElementById("historyBtn")
.addEventListener(
"click",
loadHistory
);

document
.getElementById("exportBtn")
.addEventListener(
"click",
exportJSON
);

document
.getElementById("csvFile")
.addEventListener(
"change",
handleCSV
);

/* THEME */

function toggleTheme(){

document.body
.classList.toggle(
    "light"
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
        ? "🔥 VIRAL"
        : er > 5
        ? "⚡ MEDIUM"
        : "📉 LOW"
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

const ctx =
canvas.getContext("2d");

if(chart){
    chart.destroy();
}

chart =
new Chart(ctx,{

    type:"line",

    data:{

        labels:
        historyData.map(
            (_,i)=>
            i+1
        ),

        datasets:[{

            label:
            "Engagement Rate",

            data:
            historyData.map(
                h=>h.er
            )

        }]

    },

    options:{
        responsive:true
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

localStorage.setItem(

    "engagement_history",

    JSON.stringify(
        historyData
    )

);

renderHistory();

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

const a =
document.createElement(
    "a"
);

a.href =
URL.createObjectURL(
    blob
);

a.download =
"engagement-history.json";

a.click();

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
            `<td>${col}</td>`;

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

renderHistory();

updateChart();