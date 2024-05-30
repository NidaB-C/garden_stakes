// Initialize the map and set its view to Halesowen
var map = L.map('map').setView([52.4500, -2.0500], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Define colors for each branch
var branchColors = {
    "Halesowen": "rgba(255, 0, 0, 0.5)", // Semi-transparent red
    "Cradley Heath and Old Hill": "rgba(0, 0, 255, 0.5)", // Semi-transparent blue
    "Cradley and Wollescote": "rgba(0, 255, 0, 0.5)" // Semi-transparent green
    // Add more branches and colors as needed
};

// Create a marker cluster group
var markersCluster = L.markerClusterGroup();

// Function to load and display markers
function loadMarkers(data) {
    var markers = {};
    data.forEach(function(member) {
        var marker = L.circleMarker([member.latitude, member.longitude], {
            radius: 8,
            fillColor: branchColors[member.branch] || "rgba(255, 0, 0, 0.5)", // Default to semi-transparent red
            color: branchColors[member.branch] || "rgba(255, 0, 0, 0.5)",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.5
        });

        marker.bindPopup("<b>" + member.first_name + " " + member.last_name + "</b><br>" +
                         member.address + "<br>" +
                         member.postcode + "<br>" +
                         "<a href='mailto:" + member.email + "'>" + member.email + "</a><br>" +
                         member.phone_number + "<br>" +
                         member.branch);

        markersCluster.addLayer(marker);

        if (!markers[member.branch]) {
            markers[member.branch] = [];
        }
        markers[member.branch].push(marker);
    });

    // Add the cluster group to the map
    map.addLayer(markersCluster);

    // Add a legend
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function(map) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += "<strong>Branches</strong><br>";
        for (var branch in branchColors) {
            div.innerHTML += '<i style="background-color:' + branchColors[branch] + '; opacity: 0.5; width: 18px; height: 18px; display: inline-block;"></i> ' + branch + '<br>';
        }
        return div;
    };

    legend.addTo(map);

    // Add filtering functionality
    function filterMarkers(branch) {
        markersCluster.clearLayers(); // Clear all markers from the cluster group
        if (branch === "All") {
            data.forEach(function(member) {
                var marker = L.circleMarker([member.latitude, member.longitude], {
                    radius: 8,
                    fillColor: branchColors[member.branch] || "rgba(255, 0, 0, 0.5)", // Default to semi-transparent red
                    color: branchColors[member.branch] || "rgba(255, 0, 0, 0.5)",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5
                });

                marker.bindPopup("<b>" + member.first_name + " " + member.last_name + "</b><br>" +
                                 member.address + "<br>" +
                                 member.postcode + "<br>" +
                                 "<a href='mailto:" + member.email + "'>" + member.email + "</a><br>" +
                                 member.phone_number + "<br>" +
                                 member.branch);

                markersCluster.addLayer(marker);
            });
        } else {
            markers[branch].forEach(function(marker) {
                markersCluster.addLayer(marker);
            });
        }
    }

    // Create filter dropdown
    var filterDiv = L.control({ position: "topright" });

    filterDiv.onAdd = function(map) {
        var div = L.DomUtil.create("div");
        div.innerHTML = '<select id="branchFilter"><option value="All">All</option>';
        for (var branch in branchColors) {
            div.innerHTML += '<option value="' + branch + '">' + branch + '</option>';
        }
        div.innerHTML += '</select>';
        return div;
    };

    filterDiv.addTo(map);

    $('#branchFilter').on('change', function() {
        filterMarkers(this.value);
    });
}

// Fetch the data and load markers
$.getJSON('static/data/members_data.json', function(data) {
    loadMarkers(data);
});