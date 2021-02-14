// ==================================
//            Main Page
// ==================================
let homePage = 
    `
    <link rel="stylesheet" href="./css/index.css">
    <div class="team-main">

        <div class="team-disp">

            <div class="team-drop">

                <select id="tournMenu" onchange="refreshTeams()" class="tourn-selector">
                    <option value="">Select a Tournament</option>
                </select>

                <select id="teamMenu" onchange="loadTeam(this.value)" class="team-selector">
                    <option value="">Select a Team</option>
                </select>

                <button id="refreshBtn" class="team-refresh" onclick="refreshTeams()">Refresh</button>

            </div>

            <div class="team-table">

                <table>
                    <thead>
                        <tr class=".team-table-header">
                            <td style="border-bottom: 1px solid white;">BNet</td>
                            <td style="border-bottom: 1px solid white;" class="table-right">Tank</td>
                            <td style="border-bottom: 1px solid white;" class="table-right">Damage</td>
                            <td style="border-bottom: 1px solid white;" class="table-right">Support</td>
                        </tr>
                    </thead>
                    <tbody id="teamTable">
                    </tbody>
                </table>

                <p class="notice"><i>*These skill ratings are taken from overbuff</i></p>
                <!--Should refresh the team's SR and reload the table-->
                <button id="refreshTeamTable" class="team-table-refresh" onclick="refreshTeamSR()">Refresh</button>

            </div>

        </div>

        <div class="team-stats">

            <h3>Team Statistics</h3>

            <table>
                <tbody id="stats">

                </tbody>
            </table>
            
        </div>

    </div>

    <div class="team-footer">

        <h3>Match Results</h3>
        <table>
            <tbody id="matches">

            </tbody>
        </table>

        <button id="refreshAll" class="refresh-all" onclick="refreshTournament()">Refresh All</button>
    </div>
    `;


// ==================================
//            Bracket Page
// ==================================
let bracketPage = 
    `
    <link rel="stylesheet" href="./css/bracket.css">
    <div class="team-main">

            <div class="team-display"></div>

            <div class="team-display"></div>

        </div>

    <div class="team-footer"></div>
    `;

// ==================================
//            Information Page
// ==================================
let infoPage = 
    `
    <link rel="stylesheet" href="./css/info.css">
    <h1>Information</h1>

    <p>This is going to be the main page that holds app information</p>
    `;


// Exporting the Pages
module.exports = {
    bracketPage,
    homePage,
    infoPage,
};