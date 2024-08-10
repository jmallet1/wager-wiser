<?php

$host = "127.0.0.1:3325";
$username = "root";
$password = "";
$nbadatabase = "nba";

$mysqli = new mysqli($host, $username, $password, $nbadatabase);

// Check connection
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: " . $mysqli->connect_error;
    exit();
}

$name = $_GET['variable'];

// Define your queries
$szn_game_data_query = "SELECT * FROM nba.game_data WHERE player_name = '${name}' ORDER BY date";

$prop_points_query = "(SELECT * FROM nba.props_points WHERE player_name = '${name}' ORDER BY prop DESC LIMIT 1) 
                       UNION ALL (SELECT * FROM nba.props_points WHERE player_name = '${name}' ORDER BY prop ASC LIMIT 1)";

$prop_rebounds_query = "(SELECT * FROM nba.props_rebounds WHERE player_name = '${name}' ORDER BY prop DESC LIMIT 1) 
                         UNION ALL (SELECT * FROM nba.props_rebounds WHERE player_name = '${name}' ORDER BY prop ASC LIMIT 1)";
 
$prop_assists_query = "(SELECT * FROM nba.props_assists WHERE player_name = '${name}' ORDER BY prop DESC LIMIT 1) 
                       UNION ALL (SELECT * FROM nba.props_assists WHERE player_name = '${name}' ORDER BY prop ASC LIMIT 1)";

$prop_steals_query = "(SELECT * FROM nba.props_steals WHERE player_name = '${name}' ORDER BY prop DESC LIMIT 1) 
                       UNION ALL (SELECT * FROM nba.props_steals WHERE player_name = '${name}' ORDER BY prop ASC LIMIT 1)";

$prop_blocks_query = "(SELECT * FROM nba.props_blocks WHERE player_name = '${name}' ORDER BY prop DESC LIMIT 1) 
                       UNION ALL (SELECT * FROM nba.props_blocks WHERE player_name = '${name}' ORDER BY prop ASC LIMIT 1)";

$prop_threes_query = "(SELECT * FROM nba.props_threes WHERE player_name = '${name}' ORDER BY prop DESC LIMIT 1) 
                       UNION ALL (SELECT * FROM nba.props_threes WHERE player_name = '${name}' ORDER BY prop ASC LIMIT 1)";

$prop_turnovers_query = "(SELECT * FROM nba.props_turnovers WHERE player_name = '${name}' ORDER BY prop DESC LIMIT 1) 
                       UNION ALL (SELECT * FROM nba.props_turnovers WHERE player_name = '${name}' ORDER BY prop ASC LIMIT 1)";



// Run the queries
$szn_games = $mysqli->query($szn_game_data_query);
$prop_points = $mysqli->query($prop_points_query);
$prop_rebounds = $mysqli->query($prop_rebounds_query);
$prop_assists = $mysqli->query($prop_assists_query);
$prop_steals = $mysqli->query($prop_steals_query);
$prop_blocks = $mysqli->query($prop_blocks_query);
$prop_threes = $mysqli->query($prop_threes_query);
$prop_turnovers = $mysqli->query($prop_turnovers_query);

// Check if queries were successful
if (!$szn_games || !$prop_points || !$prop_rebounds || !$prop_assists || !$prop_steals || !$prop_blocks || !$prop_threes || !$prop_turnovers) {
    echo "Error: " . $mysqli->error;
    exit();
}

// Process the results
while ($row = $szn_games->fetch_assoc()) {
    $player_name = $row["player_name"];
    $position[] = $row["position"];
    $team[] = $row["team"];
    $matchup[] = $row["matchup"];
    $matchup_abbv[] = $row['matchup_abbv'];
    $home[] = $row["home"];
    $dates[] = $row["date"];
    $points[] = $row["points"];
    $rebounds[] = $row["rebounds"];
    $assists[] = $row["assists"];
    $steals[] = $row["steals"];
    $blocks[] = $row["blocks"];
    $threes[] = $row["threes"];
    $turnovers[] = $row["turnovers"];
}

while ($row = $prop_points->fetch_assoc()) {
    $high_and_low_props_points[] = $row['sportsbook'] . ": " . $row["prop"] . " Points|" . "Over: " . $row["over_odds"] . " Under: " . $row["under_odds"];
    $points_line = $row["prop"];
    $matchup_today = $row["matchup"];
}
if($prop_points->num_rows === 0){
    $high_and_low_props_points = [NULL, NULL];
    $points_line = NULL;
}

while ($row = $prop_rebounds->fetch_assoc()) {
    $high_and_low_props_rebounds[] = $row['sportsbook'] . ": " . $row["prop"] . " Rebounds|" . "Over: " . $row["over_odds"] . " Under: " . $row["under_odds"];
    $rebounds_line = $row["prop"];
}
if($prop_rebounds->num_rows === 0){
    $high_and_low_props_rebounds = [NULL, NULL];
    $rebounds_line = NULL;
}

while ($row = $prop_assists->fetch_assoc()) {
    $high_and_low_props_assists[] = $row['sportsbook'] . ": " . $row["prop"] . " Assists|" . "Over: " . $row["over_odds"] . " Under: " . $row["under_odds"];
    $assists_line = $row["prop"];
}
if($prop_assists->num_rows === 0){
    $high_and_low_props_assists = [NULL, NULL];
    $assists_line = NULL;
}

while ($row = $prop_steals->fetch_assoc()) {
    $high_and_low_props_steals[] = $row['sportsbook'] . ": " . $row["prop"] . " Steals|" . "Over: " . $row["over_odds"] . " Under: " . $row["under_odds"];
    $steals_line = $row["prop"];
}
if($prop_steals->num_rows === 0){
    $high_and_low_props_steals = [NULL, NULL];
    $steals_line = NULL;
}

while ($row = $prop_blocks->fetch_assoc()) {
    $high_and_low_props_blocks[] = $row['sportsbook'] . ": " . $row["prop"] . " Blocks|" . "Over: " . $row["over_odds"] . " Under: " . $row["under_odds"];
    $blocks_line = $row["prop"];
}
if($prop_blocks->num_rows === 0){
    $high_and_low_props_blocks = [NULL, NULL];
    $blocks_line = NULL;
}

while ($row = $prop_threes->fetch_assoc()) {
    $high_and_low_props_threes[] = $row['sportsbook'] . ": " . $row["prop"] . " Threes|" . "Over: " . $row["over_odds"] . " Under: " . $row["under_odds"];
    $threes_line = $row["prop"];
}
if($prop_threes->num_rows === 0){
    $high_and_low_props_threes = [NULL, NULL];
    $threes_line = NULL;
}

while ($row = $prop_turnovers->fetch_assoc()) {
    $high_and_low_props_turnovers[] = $row['sportsbook'] . ": " . $row["prop"] . " Turnovers|" . "Over: " . $row["over_odds"] . " Under: " . $row["under_odds"];
    $turnovers_line = $row["prop"];
}
if($prop_turnovers->num_rows === 0){
    $high_and_low_props_turnovers = [NULL, NULL];
    $turnovers_line = NULL;
}



$h2h_query = "SELECT * FROM nba.game_data WHERE player_name = '${name}' AND matchup = '${matchup_today}'";
$recent_news_query = "SELECT * FROM nba.recent_news WHERE player_name = '${name}' OR team_tag = '${matchup_today}' OR team_tag = '${team[0]}' ORDER BY news_date DESC LIMIT 5";

$h2h = $mysqli->query($h2h_query);
$recent_news = $mysqli->query($recent_news_query);

// Check if queries were successful
if (!$h2h || !$recent_news) {
    echo "Error: " . $mysqli->error;
    exit();
}

// Process the results
while ($row = $h2h->fetch_assoc()) {
    $points_h2h[] = $row["points"];
    $rebounds_h2h[] = $row["rebounds"];
    $assists_h2h[] = $row["assists"];
    $steals_h2h[] = $row["steals"];
    $blocks_h2h[] = $row["blocks"];
    $threes_h2h[] = $row["threes"];
    $turnovers_h2h[] = $row["turnovers"];
}

// Process the results
while ($row = $recent_news->fetch_assoc()) {
    $headline[] = $row["headline"];
    $link[] = $row["link"];
    $news_date[] = $row["news_date"];
}

// Close connection
$mysqli->close();

$data = array(

    // szn long data
    'name' => $player_name,
    'position' => $position,
    'team' => $team,
    'matchup' => $matchup,
    'matchup_abbv' => $matchup_abbv,
    'home' => $home,
    'dates' => $dates,
    'points' => $points,
    'rebounds' => $rebounds,
    'assists' => $assists,
    'steals' => $steals,
    'blocks' => $blocks,
    'threes' => $threes,
    'turnovers' => $turnovers,

    // // player's lines for the day
    'points_line' => $points_line,
    'rebounds_line' => $rebounds_line,
    'assists_line' => $assists_line,
    'steals_line' => $steals_line,
    'blocks_line' => $blocks_line,
    'threes_line' => $threes_line,
    'turnovers_line' => $turnovers_line,

    // head to head stats against their matchup today
    'points_h2h' => $points_h2h,
    'rebounds_h2h' => $rebounds_h2h,
    'assists_h2h' => $assists_h2h,
    'steals_h2h' => $steals_h2h,
    'blocks_h2h' => $blocks_h2h,
    'threes_h2h' => $threes_h2h,
    'turnovers_h2h' => $turnovers_h2h,

    // send recent news variables
    'headline' => $headline,
    'link' => $link,
    'news_date' => $news_date,

    'max_points_prop' => $high_and_low_props_points[0],
    'min_points_prop' => $high_and_low_props_points[1],

    'max_rebounds_prop' => $high_and_low_props_rebounds[0],
    'min_rebounds_prop' => $high_and_low_props_rebounds[1],

    'max_assists_prop' => $high_and_low_props_assists[0],
    'min_assists_prop' => $high_and_low_props_assists[1],

    'max_steals_prop' => $high_and_low_props_steals[0],
    'min_steals_prop' => $high_and_low_props_steals[1],

    'max_blocks_prop' => $high_and_low_props_blocks[0],
    'min_blocks_prop' => $high_and_low_props_blocks[1],

    'max_threes_prop' => $high_and_low_props_threes[0],
    'min_threes_prop' => $high_and_low_props_threes[1],

    'max_turnovers_prop' => $high_and_low_props_turnovers[0],
    'min_turnovers_prop' => $high_and_low_props_turnovers[1]

);

$json_data = json_encode($data);

// Set the appropriate content type header
header('Content-Type: application/json');

// Output the JSON data
echo $json_data;

?>