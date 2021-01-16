const scraper = require('./scripts/scraper.js');
const refreshBtn = document.getElementById('refreshBtn');
const $ = require('jQuery');

const tournamentURL = 'https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams';


// Was already run and the teams were stored
// I don't know why this is running even when it is not called
function refreshTeams() {
    scraper.scrape(tournamentURL);
}

// Dropdown Menu
let dropdown = $('#teamMenu');

dropdown.empty();

dropdown.append('<option selected="true" disabled>Choose Team</option>');
dropdown.prop('selectedIndex', 0);

// Populate dropdown with list of provinces
$.getJSON('E:/GitHub/T3.5Scraper/files/teams.json', function (data) {
  $.each(data, function (key, entry) {
    dropdown.append($('<option></option>').attr('value', entry.abbreviation).text(entry.name));
  })
});