const Papa = require("papaparse");



async function loadData(sheetID, sheetGID) {
    const sheetURL =
    `https://docs.google.com/spreadsheets/d/${sheetID}/export?format=csv&gid=${sheetGID}`;

    const response = await fetch(sheetURL);

    if (!response.ok) {
        throw new Error(
            `Could not load Google Sheet: ${response.status}`
        );
    }

    const csv = await response.text();

    const results = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true
    });

    let capitol = "";
    const capitole = {};

    results.data.forEach(row => {
        if (row["Capitol"] !== "") {
            capitol = row["Capitol"];
            capitole[capitol] ??= {
                "@@@suma": 0,
                "@@@nr_note": 0,
                "@@@medie": 0,
                "@@@ultima_evaluare": Date.parse("03 Aug 2005"),
            };
        }
        capitole[capitol][row["Subcapitol"]] ??= {
            "@@@nota_subcapitol": 0,
            "@@@ultima_evaluare": Date.parse("04 May 2005"),
        };

        for (const date of Object.keys(row).reverse()) {
            if (
                date === "Capitol" ||
                date === "Subcapitol" ||
                row[date] === ""
            ) { 
                continue; 
            }
            subcapitol = row["Subcapitol"];
            nota = row[date] === "P" ? "Predat" : row[date];
            capitole[capitol][subcapitol][date] = nota;
            if (Date.parse(date) > capitole[capitol][subcapitol]["@@@ultima_evaluare"]) {
                capitole[capitol][subcapitol]["@@@ultima_evaluare"] = Date.parse(date);
                capitole[capitol][subcapitol]["@@@nota_subcapitol"] = nota;
                if (!isNaN(nota) && nota.trim() !== "") {
                    capitole[capitol]["@@@suma"] += Number(nota);
                    capitole[capitol]["@@@nr_note"] += 1;
                    capitole[capitol]["@@@medie"] =
                        capitole[capitol]["@@@suma"] /
                        capitole[capitol]["@@@nr_note"];
                }
            }
            if (Date.parse(date) > capitole[capitol]["@@@ultima_evaluare"]) {
                capitole[capitol]["@@@ultima_evaluare"] = Date.parse(date);
            }
        } 
    });

    return {
        capitole: Object.fromEntries(
            Object.entries(capitole).sort(
                ([, a], [, b]) =>
                    b["@@@ultima_evaluare"] - a["@@@ultima_evaluare"]
            )
        )
    };
}

module.exports = loadData;

/*
function updateWebsite(data) {

    const content = document.getElementById("content");

    content.innerHTML = "";

    for (const item of data) {

        const chapter = document.createElement("div");
        chapter.className = "chapter";

        chapter.innerHTML = `
            <h2>${item.capitol}</h2>
            <h3>${item.subcapitol}</h3>
        `;

        for (const date in item.note) {

            const score = item.note[date];

            const scoreElement = document.createElement("div");

            scoreElement.className = "score";

            scoreElement.textContent =
                `${date}: ${score}`;

            chapter.appendChild(scoreElement);
        }

        content.appendChild(chapter);
    }
}


loadData();

*/