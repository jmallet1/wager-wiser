document.addEventListener("DOMContentLoaded", function() {
    const players = [
        { name: "Jake", url: "https://google.com" },
        { name: "James", url: "https://example.com/james" },
        { name: "Jane", url: "https://example.com/jane" }
        // Add more players and their respective URLs here
    ];

    const searchInput = document.getElementById("search");

    searchInput.addEventListener("input", function() {
        const value = this.value.toLowerCase();
        const dropdown = document.createElement("datalist");
        dropdown.id = "players-list";

        players.forEach(player => {
            if (player.name.toLowerCase().startsWith(value) && value.length > 0) {
                const option = document.createElement("option");
                option.value = player.name;
                dropdown.appendChild(option);
            }
        });

        searchInput.setAttribute("list", "players-list");
        if (document.getElementById("players-list")) {
            document.getElementById("players-list").remove();
        }
        document.body.appendChild(dropdown);
    });

    searchInput.addEventListener("change", function() {
        const selectedPlayer = players.find(player => player.name.toLowerCase() === this.value.toLowerCase());
        if (selectedPlayer) {
            window.location.href = selectedPlayer.url;
        }
    });
});