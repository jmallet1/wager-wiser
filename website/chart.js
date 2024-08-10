var barChart;
var szn_donut;
var h2h_donut;

var currentURL = window.location.href;

// Parse the URL to extract the query parameters
var urlParams = new URLSearchParams(window.location.search);

// Get the value of the 'variable' parameter
var raw_name = urlParams.get('player');
var player_name = raw_name.replace(/_/g, " ");

if(isMalicious(player_name)){
    throw new Error("Malicious Code Detected");
}

// Make an AJAX request to fetch the JSON data
var xhr = new XMLHttpRequest();
xhr.open('GET', 'db_query.php?variable=' + encodeURIComponent(player_name), true);
xhr.onload = function () {

    if (xhr.status >= 200 && xhr.status < 300) {

        try {
            // Parse the JSON response
            var data = JSON.parse(xhr.responseText);
        }
        catch (error) {
            // eventually put an image on all of the divs/a frowny face and say 'player not found' in the bar graph
            var dataContainer = document.getElementById("graph-container");
            var error_message = document.createElement('div');
            error_message.textContent = "Player not found :( try again: ";
            dataContainer.appendChild(error_message);
            console.log(error);
        }

        var max = {
            // variables for max props
            points: data.max_points_prop,
            rebounds: data.max_rebounds_prop,
            assists: data.max_assists_prop,
            steals: data.max_steals_prop,
            blocks: data.max_blocks_prop,
            threes: data.max_threes_prop,
            turnovers: data.max_turnovers_prop
        }

        var min = {
            // variables for min props
            points: data.min_points_prop,
            rebounds: data.min_rebounds_prop,
            assists: data.min_assists_prop,
            steals: data.min_steals_prop,
            blocks: data.min_blocks_prop,
            threes: data.min_threes_prop,
            turnovers: data.min_turnovers_prop
        }

        var szn = {
            // store season long data and covnert most to array of numbers, not strings
            position: data.position[data.position.length - 1],
            team: data.team[data.team.length - 1],
            games: calcGames(data.matchup_abbv, data.home, data.dates),
            points: (data.points).map(Number),
            rebounds: (data.rebounds).map(Number),
            assists: (data.assists).map(Number),
            steals: (data.steals).map(Number),
            blocks: (data.blocks).map(Number),
            threes: (data.threes).map(Number),
            turnovers: (data.turnovers).map(Number)
        }

        // store players lines for the day and cover to array of numbers, not strings
        var lines = {
            points: parseFloat(data.points_line),
            rebounds: parseFloat(data.rebounds_line),
            assists: parseFloat(data.assists_line),
            steals: parseFloat(data.steals_line),
            blocks: parseFloat(data.blocks_line),
            threes: parseFloat(data.threes_line),
            turnovers: parseFloat(data.turnovers_line)
        };

        var h2h = {
            // variables for h2h stats
            points: (data.points_h2h).map(Number),
            rebounds: (data.rebounds_h2h).map(Number),
            assists: (data.assists_h2h).map(Number),
            steals: (data.steals_h2h).map(Number),
            blocks: (data.blocks_h2h).map(Number),
            threes: (data.threes_h2h).map(Number),
            turnovers: (data.turnovers_h2h).map(Number)
        }

        var last_10 = {
            games: getLastTen(szn.games),
            points: getLastTen(szn.points),
            rebounds: getLastTen(szn.rebounds),
            assists: getLastTen(szn.assists),
            steals: getLastTen(szn.steals),
            blocks: getLastTen(szn.blocks),
            threes: getLastTen(szn.threes),
            turnovers: getLastTen(szn.turnovers)
        };

        renderAverages(data.name, szn);

        var initial_prop = getFirstNonNullLine(lines);

        //pass data to chart creation function
        var bar_config = createBarChart(data.name, last_10, lines, initial_prop);

        barChart = new Chart(
            document.getElementById('barChart'),
            bar_config
        );

        var szn_donut_config = createDonutChart(szn[initial_prop], lines[initial_prop]);

        szn_donut = new Chart(
            document.getElementById('szn-donut'),
            szn_donut_config
        );

        var h2h_donut_config = createDonutChart(h2h[initial_prop], lines[initial_prop]);

        h2h_donut = new Chart(
            document.getElementById('h2h-donut'),
            h2h_donut_config
        );

        h2h_donut.config.options.plugins.title.text = 'H2H Hit Rate';
        h2h_donut.update();

        var date_and_headlines = []
        for (var i = 0; i < data.news_date.length; i++) {
            // Combine the elements from both arrays at the corresponding index
            var date_and_headline = data.news_date[i] + ' - ' + data.headline[i];
            date_and_headlines.push(date_and_headline);
        }

        var split_max_initial_prop = max[initial_prop].split('|');
        var split_min_initial_prop = min[initial_prop].split('|');

        renderArray(date_and_headlines, "recent-news", data.link, "Related News", true);
        renderArray(split_max_initial_prop, "highest-line", [], "Highest Line", false);
        renderArray(split_min_initial_prop, "lowest-line", [], "Lowest Line", false);

        renderButtons(lines, szn, h2h, max, min, last_10);
    }
};
xhr.send();


function createDonutChart(prop, line){

    var dataset = calcHitRate(prop, line);

    const data = {
        labels: ['Over', 'Under', 'Push'],
        datasets: [{
            data: dataset,
            backgroundColor: [
                'rgb(0, 181, 113)',
                'rgb(255, 39, 42)'
            ],
            hoverOffset: 4
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            cutout: "45%",
            //cutout: "35%",
            plugins: {
                labels: {
                    render: 'percentage',
                    precision: '1'
                },
                legend: {
                    display: false
                },
                title: {
                    text: "Season Long Hit Rate",
                    display: true,
                    color: '#333',
                    font: {
                        size: 25,
                        family: 'Lato',
                    }
                }
            }
        }
    };
    
    return config;
}

function createBarChart(name, last_10, lines, category) {

    // create the dataset. each date has all props attached to them
    var dataset = [{}];
    for(let i=0; i<last_10.games.length; i++){
        dataset.push(
            {
                date: last_10.games[i], 
                value: { 
                    points: last_10.points[i], 
                    rebounds: last_10.rebounds[i],
                    assists: last_10.assists[i], 
                    steals: last_10.steals[i],
                    blocks: last_10.blocks[i], 
                    threes: last_10.threes[i],
                    turnovers: last_10.turnovers[i]
                }
            }
        );
    }

    // data block
    const data = {
        labels: last_10.games,
        datasets: [
            {
                data: dataset,
                borderWidth: 1,
                backgroundColor: calcColorOfBars(last_10[category], lines[category]),
                borderRadius: 5,
                barPercentage: 1,
                categoryPercentage: 0.95,
                parsing: {
                    xAxisKey: 'date',
                    yAxisKey: 'value.points'
                }
            }
        ]
    };


    // config block
    const config = {    
        type: 'bar',
        data,
        options: {
            maintainAspectRatio: false,
            plugins: {
                autocolors: false,
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: lines[category],
                            yMax: lines[category],
                            borderColor: 'rgb(255, 99, 132)',
                            borderWidth: 4
                        }
                    }
                },
                legend: {
                    display: false
                },
                datalabels: {
                    anchor: 'end', // Position of the labels (start, end, center, etc.)
                    align: 'end', // Alignment of the labels (start, end, center, etc.)
                    color: '#2272FF', // Color of the labels
                    font: {
                        weight: 'bold',
                    },
                    formatter: function (value, context) {
                        return value; // Display the actual data value
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color:'#333'
                    },
                    grace: '10%'
                },
                x: {
                    grid: {
                    display: false,
                    },
                    ticks: {
                        color:'#333',
                    }
                }
            }
        }
    };

    return config;
}

function changeData(option, lines, szn, h2h, max_props, min_props, last_10){

    // Remove 'selected' class from all buttons
    var buttons = document.querySelectorAll('.stat-selector');
    buttons.forEach(function(btn) {
        btn.classList.remove('selected');
    });

    // Add 'selected' class to the clicked button
    option.classList.add('selected');


    var stat_name = option.value;

    barChart.data.datasets[0].parsing.yAxisKey = `value.${option.value}`;
    barChart.options.plugins.annotation.annotations.line1.yMin = lines[stat_name];
    barChart.options.plugins.annotation.annotations.line1.yMax = lines[stat_name];
    barChart.data.datasets[0].backgroundColor = calcColorOfBars(last_10[stat_name], lines[stat_name]);
    barChart.update(); 

    szn_donut.data.datasets[0].data = calcHitRate(szn[stat_name], lines[stat_name]);
    szn_donut.update();

    h2h_donut.data.datasets[0].data = calcHitRate(h2h[stat_name], lines[stat_name]);
    h2h_donut.update();

    var split_max_prop = max_props[stat_name].split('|');
    var split_min_prop = min_props[stat_name].split('|');

    renderArray(split_max_prop, "highest-line", [], "Highest Line", false);
    renderArray(split_min_prop, "lowest-line", [], "Lowest Line", false);

}

function calcGames(matchup_abbv, home, dates){

    var games = [];
    var location;
    var date;

    for(let i=0; i<dates.length; i++){
        if(home[i])
            location = "vs.";
        else
            location = "@";
        
        // remove leading 0's in month and day places in date
        date = dates[i].replace(/-0/g, '-');
        date = date.substring(5);

        games.push([date, location+" "+matchup_abbv[i]]);
    }

    return games;

}

function getLastTen(arr){
    if(arr.length > 10)
        return arr.slice(-10);
    else 
        return arr;
}

function calcHitRate(stat, line){
    
    var over = 0;
    var under = 0;
    var push = 0;

    for(let i=0; i<stat.length; i++){

        if(stat[i] > line)
            ++over;
        
        else if(stat[i] == line)
            ++push;
        else if(stat[i] < line)
            ++under;
        
    }

    return [over, under, push];
}

function renderArray(content, div_name, links, title, align_left) {

    var dataContainer = document.getElementById(div_name);
    
    // Clear the existing content of the lines container
    dataContainer.innerHTML = '';

    var titleDiv = document.createElement('div');
    titleDiv.classList.add('sidebar-title');
    titleDiv.style.textAlign = "center"
    titleDiv.textContent = title;
    dataContainer.appendChild(titleDiv);

    // Loop through the lines data and create HTML elements for each line
    content.forEach(function(line, index) {

        // add horizontal line to top of each div
        var horizontalLine = document.createElement('hr');
        horizontalLine.classList.add('line-item-separator');
        dataContainer.appendChild(horizontalLine);

        // Create a div element for each line
        var lineDiv = document.createElement('div');
        
        // add to list item class
        lineDiv.classList.add('line-item');

        // Check if a link is available for this line
        if (links[index]) {
            // Create an anchor element for the link
            var link = document.createElement('a');
            link.textContent = line; // Set the text content of the link to the line
            link.href = links[index]; // Set the href attribute of the link to the corresponding URL from the links array
            link.target = '_blank'; // Optionally, set the target attribute to open the link in a new tab

            // Append the link to the line div
            lineDiv.appendChild(link);
        } else {
            // If no link is available, just add the text directly
            lineDiv.textContent = line;
        }

        if(align_left)
            lineDiv.style.textAlign = "left";
        else
            lineDiv.style.textAlign = "center";


        // Append the line div to the lines container
        dataContainer.appendChild(lineDiv);
    
    });
}

// Function to render buttons dynamically
function renderButtons(lines, szn, h2h, max_props, min_props, last_10) {

    const stats = [
      { label: 'Points', value: 'points'},
      { label: 'Rebounds', value: 'rebounds' },
      { label: 'Assists', value: 'assists' },
      { label: 'Steals', value: 'steals' },
      { label: 'Blocks', value: 'blocks' },
      { label: 'Threes', value: 'threes' },
      { label: 'Turnovers', value: 'turnovers' }
    ];
  
    const buttonContainer = document.getElementById('button-container');

    var first = true;

    stats.forEach(stat => {

      // Check if the corresponding line is null
      if (!isNaN(lines[stat.value])) {
        const button = document.createElement('button');
        button.className = 'stat-selector';
        if(first){ 
            button.classList.add('selected');
            first = false;
        }
        button.value = stat.value;
        button.textContent = stat.label;
        button.addEventListener('click', () => {
          changeData(button, lines, szn, h2h, max_props, min_props, last_10);
        });
        buttonContainer.appendChild(button);
      }
    });
}

function isMalicious(input) {
    // Check for HTML tags
    if (/<(?:.|\/)(?:script|iframe|style|link|embed|object|applet|meta|base|on\w+)[^>]*>/i.test(input)) {
        return true;
    }

    // Check for JavaScript code
    if (/javascript:/i.test(input)) {
        return true;
    }

    // Check for SQL injection attempts
    if (/(\b(?:select|insert|update|delete|drop|alter|truncate|union)\b|\-\-|\/\*|\*\/)/i.test(input)) {
        return true;
    }

    // Add more checks for other types of malicious input as needed

    // If none of the checks matched, return false (input is not malicious)
    return false;
}

function calcColorOfBars(arr, line){

    var color_array = [0];
    var green = 'rgb(0, 181, 113)';
    var red = 'rgb(255, 39, 42)';
    var dark_gray = 'rgb(99,102,106)';

    for(let i=0; i<arr.length; i++){
        if(arr[i] < line){
            color_array.push(red);
        }
        else if(arr[i] > line){
            color_array.push(green);
        }
        else {
            color_array.push(dark_gray);
        }
    }

    console.log(color_array);

    return color_array;
}

function getFirstNonNullLine(lines) {
    for (var key in lines) {
        if (lines.hasOwnProperty(key) && lines[key] !== null && !isNaN(lines[key])) {
            return key; // Return the name of the first non-null value
        }
    }
    return null; // Return null if all values are null or NaN
}

function renderAverages(player_name, season_details){

    var pts_total = 0;
    var reb_total = 0;
    var ast_total = 0;
    var num_games = season_details.games.length;

    for(let i=0; i<num_games; i++){
        pts_total += season_details.points[i];
        reb_total += season_details.assists[i];
        ast_total += season_details.rebounds[i];
    }

    var pts_avg = Math.round((pts_total / num_games) * 10) / 10;
    var reb_avg = Math.round((reb_total / num_games) * 10) / 10;
    var ast_avg = Math.round((ast_total / num_games) * 10) / 10;

    let split_name = player_name.split(/\s+/);

    var first_name = document.createElement('p');
    first_name.textContent = split_name[0];
    first_name.classList.add('player-name');

    var last_name = document.createElement('p');
    last_name.textContent = split_name[1];
    last_name.classList.add('player-name');

    var position_and_team = document.createElement('p');
    position_and_team.textContent = season_details.position + " - " + season_details.team;
    position_and_team.classList.add('position-label');

    var playerDetailsDiv = document.getElementById('player-details');
    playerDetailsDiv.appendChild(first_name);
    playerDetailsDiv.appendChild(last_name);
    playerDetailsDiv.appendChild(position_and_team);

    //add points
    var pts_avg = document.createElement('p');
    pts_avg.textContent = Math.round((pts_total / num_games) * 10) / 10;
    pts_avg.classList.add('season-avg-stat');

    var pts_label = document.createElement('p');
    pts_label.textContent = 'PPG';
    pts_label.classList.add('season-avg-label');

    //add reb
    var reb_avg = document.createElement('p');
    reb_avg.textContent = Math.round((reb_total / num_games) * 10) / 10;
    reb_avg.classList.add('season-avg-stat');

    var reb_label = document.createElement('p');
    reb_label.textContent = 'RPG';
    reb_label.classList.add('season-avg-label');

    //add assists
    var ast_avg = document.createElement('p');
    ast_avg.textContent = Math.round((ast_total / num_games) * 10) / 10;
    ast_avg.classList.add('season-avg-stat');

    var ast_label = document.createElement('p');
    ast_label.textContent = 'APG';
    ast_label.classList.add('season-avg-label');

    const points_container = document.getElementById('pts-container');
    points_container.appendChild(pts_avg);
    points_container.appendChild(pts_label);

    const reb_container = document.getElementById('reb-container');
    reb_container.appendChild(reb_avg);
    reb_container.appendChild(reb_label);

    const ast_container = document.getElementById('ast-container');
    ast_container.appendChild(ast_avg);
    ast_container.appendChild(ast_label);


}