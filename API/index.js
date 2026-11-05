const roleColors = {
    duelist: '#ff4655',
    initiator: '#6b5bd6',
    controller: '#aa55ff',
    sentinel: '#2fd4c4'
};

const slotNames = {
    Grenade: 'BASIC',
    Ability1: 'BASIC',
    Ability2: 'SIGNATURE',
    Ultimate: 'ULTIMATE',
    Passive: 'PASSIVE'
};

var isSmall = window.innerWidth < 992;

var elParent = document.getElementById("parent");
var elCurrentPage = document.getElementById("currentpage");
var elSearch = document.getElementById("search");
var roleButtons = document.querySelectorAll(".role-btn");

var allAgents = [];
var filtered = [];
var roleIcons = {};
var currentRole = "all";
var searchText = "";

var agentModal = new bootstrap.Modal(document.getElementById("agentModal"));
var currentAbilities = [];

var page = 1;
var perPage = isSmall ? 12 : 8;
var finalPage = 1;

const getAgents = async () => {
    const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
    const result = await response.json();
    allAgents = result.data;

    for (let i = 0; i < allAgents.length; i++) {
        const agent = allAgents[i];
        if (agent.role) {
            roleIcons[agent.role.displayName.toLowerCase()] = agent.role.displayIcon;
        }
    }

    for (let i = 0; i < roleButtons.length; i++) {
        var icon = roleIcons[roleButtons[i].dataset.role];
        if (icon) {
            roleButtons[i].insertAdjacentHTML("afterbegin", '<img src="' + icon + '" alt="">');
        }
    }

    applyFilters();
}

function applyFilters() {
    filtered = [];

    for (let i = 0; i < allAgents.length; i++) {
        const agent = allAgents[i];
        var role = agent.role ? agent.role.displayName.toLowerCase() : "";
        var matchRole = currentRole == "all" || role == currentRole;
        var matchName = agent.displayName.toLowerCase().includes(searchText);

        if (matchRole && matchName) {
            filtered.push(agent);
        }
    }

    finalPage = Math.max(1, Math.ceil(filtered.length / perPage));
    page = 1;
    showAgents();
}

function showAgents() {
    elCurrentPage.innerHTML = "<b>" + String(page).padStart(2, "0") + "</b> / " + String(finalPage).padStart(2, "0");
    elParent.innerHTML = '';

    if (filtered.length == 0) {
        elParent.innerHTML = '<div class="text-center text-white fs-4">No agents found.</div>';
        return;
    }

    for (let i = (page - 1) * perPage; i < page * perPage && i < filtered.length; i++) {
        const agent = filtered[i];

        var role = agent.role ? agent.role.displayName : "Agent";
        var icon = agent.role ? agent.role.displayIcon : "";
        var hex = (agent.backgroundGradientColors[0] || "b4414f").slice(0, 6);
        var accent = "#" + hex;
        var accentSoft = "#" + hex + "55";
        var roleColor = roleColors[role.toLowerCase()] || accent;

        elParent.innerHTML += `
          <div class="col-6 col-lg-3">
            <div class="agent-card" onclick="openAgent('` + agent.uuid + `')" style="--role: ` + roleColor + `; --accent: ` + accent + `; --accent-soft: ` + accentSoft + `;">
              <div class="bg-name">` + agent.displayName + `</div>
              <img class="agent-img" src="` + agent.fullPortrait + `" alt="` + agent.displayName + `">
              <div class="role">
                <img class="role-icon" src="` + icon + `" alt="">
                <span>` + role + `</span>
              </div>
              <div class="name">` + agent.displayName + `</div>
            </div>
          </div>
        `;
    }
}

function openAgent(uuid) {
    var index = allAgents.findIndex(a => a.uuid == uuid);
    var agent = allAgents[index];

    var role = agent.role ? agent.role.displayName : "Agent";
    var hex = (agent.backgroundGradientColors[0] || "b4414f").slice(0, 6);
    var accent = "#" + hex;
    var roleColor = roleColors[role.toLowerCase()] || accent;

    var content = document.getElementById("agentModalContent");
    content.style.setProperty("--role", roleColor);
    content.style.setProperty("--accent", accent);
    content.style.setProperty("--accent-soft", accent + "55");

    document.getElementById("mPortrait").src = agent.fullPortrait;
    document.getElementById("mBgName").innerHTML = agent.displayName;
    document.getElementById("mRoleIcon").src = agent.role ? agent.role.displayIcon : "";
    document.getElementById("mRole").innerHTML = role;
    document.getElementById("mNumber").innerHTML = "// Agent #" + String(index + 1).padStart(2, "0");
    document.getElementById("mName").innerHTML = agent.displayName;
    document.getElementById("mDesc").innerHTML = agent.description;

    currentAbilities = [];
    for (let i = 0; i < agent.abilities.length; i++) {
        if (agent.abilities[i].displayIcon) {
            currentAbilities.push(agent.abilities[i]);
        }
    }

    document.getElementById("mAbilityRow").innerHTML = '';
    for (let i = 0; i < currentAbilities.length; i++) {
        document.getElementById("mAbilityRow").innerHTML += `<img class="ability-icon" src="` + currentAbilities[i].displayIcon + `" alt="` + currentAbilities[i].displayName + `" onclick="showAbility(` + i + `)">`;
    }

    showAbility(0);
    agentModal.show();
}

function showAbility(i) {
    var ability = currentAbilities[i];
    var icons = document.querySelectorAll(".ability-icon");

    for (let n = 0; n < icons.length; n++) {
        icons[n].classList.toggle("active", n == i);
    }

    var tag = document.getElementById("mAbilityTag");
    document.getElementById("mAbilityName").innerHTML = ability.displayName;
    document.getElementById("mAbilityDesc").innerHTML = ability.description;
    tag.innerHTML = slotNames[ability.slot] || ability.slot;
    tag.classList.toggle("ultimate", ability.slot == "Ultimate");
}

for (let i = 0; i < roleButtons.length; i++) {
    roleButtons[i].addEventListener("click", () => {
        for (let j = 0; j < roleButtons.length; j++) {
            roleButtons[j].classList.remove("active");
        }
        roleButtons[i].classList.add("active");
        currentRole = roleButtons[i].dataset.role;
        applyFilters();
    });
}

elSearch.addEventListener("input", () => {
    searchText = elSearch.value.trim().toLowerCase();
    applyFilters();
});

function prev() {
    page -= 1;
    if (page == 0) {
        page = finalPage;
    }
    showAgents();
}

function next() {
    page += 1;
    if (page > finalPage) {
        page = 1;
    }
    showAgents();
}

getAgents();

var elMapParent = document.getElementById("mapParent");
var elMapPage = document.getElementById("mapPage");
var elMapSearch = document.getElementById("searchMap");

var allMaps = [];
var filteredMaps = [];
var mapSearchText = "";
var mapCurrent = 1;
var mapPerPage = isSmall ? 12 : 3;
var mapFinalPage = 1;

var mapModal = new bootstrap.Modal(document.getElementById("mapModal"));

const getMaps = async () => {
    const response = await fetch('https://valorant-api.com/v1/maps');
    const result = await response.json();

    allMaps = [];
    for (let i = 0; i < result.data.length; i++) {
        const m = result.data[i];
        if (m.tacticalDescription && m.displayIcon) {
            allMaps.push(m);
        }
    }

    applyMapFilters();
}

function applyMapFilters() {
    filteredMaps = [];

    for (let i = 0; i < allMaps.length; i++) {
        if (allMaps[i].displayName.toLowerCase().includes(mapSearchText)) {
            filteredMaps.push(allMaps[i]);
        }
    }

    mapFinalPage = Math.max(1, Math.ceil(filteredMaps.length / mapPerPage));
    mapCurrent = 1;
    showMaps();
}

function showMaps() {
    elMapPage.innerHTML = "<b>" + String(mapCurrent).padStart(2, "0") + "</b> / " + String(mapFinalPage).padStart(2, "0");
    elMapParent.innerHTML = '';

    if (filteredMaps.length == 0) {
        elMapParent.innerHTML = '<div class="text-center text-white fs-4">No maps found.</div>';
        return;
    }

    for (let i = (mapCurrent - 1) * mapPerPage; i < mapCurrent * mapPerPage && i < filteredMaps.length; i++) {
        const map = filteredMaps[i];

        elMapParent.innerHTML += `
          <div class="col-6 col-lg-4">
            <div class="map-card" onclick="openMap('` + map.uuid + `')">
              <img class="map-img" src="` + map.splash + `" alt="` + map.displayName + `">
              <div class="map-coords">` + (map.coordinates || "") + `</div>
              <div class="map-name">` + map.displayName + `</div>
              <svg class="map-icon" viewBox="0 0 24 24">
                <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />
              </svg>
            </div>
          </div>
        `;
    }
}

function openMap(uuid) {
    var map = allMaps.find(m => m.uuid == uuid);

    document.getElementById("mapModalContent").style.backgroundImage =
        "linear-gradient(rgba(10,16,23,0.55), rgba(10,16,23,0.8)), url(" + map.splash + ")";

    document.getElementById("mapMName").innerHTML = map.displayName;
    document.getElementById("mapMCoords").innerHTML = map.coordinates || "";
    document.getElementById("mapMSite").innerHTML = map.tacticalDescription;
    document.getElementById("mapMIcon").src = map.displayIcon;

    var callouts = map.callouts || [];
    document.getElementById("mapMCallouts").innerHTML = '';

    for (let i = 0; i < callouts.length; i++) {
        document.getElementById("mapMCallouts").innerHTML += '<span class="callout-chip">' + callouts[i].regionName + ' (' + callouts[i].superRegionName + ')</span>';
    }

    if (callouts.length == 0) {
        document.getElementById("mapMCallouts").innerHTML = '<span class="callout-chip">No callouts</span>';
    }

    mapModal.show();
}

elMapSearch.addEventListener("input", () => {
    mapSearchText = elMapSearch.value.trim().toLowerCase();
    applyMapFilters();
});

function prevMap() {
    mapCurrent -= 1;
    if (mapCurrent == 0) {
        mapCurrent = mapFinalPage;
    }
    showMaps();
}

function nextMap() {
    mapCurrent += 1;
    if (mapCurrent > mapFinalPage) {
        mapCurrent = 1;
    }
    showMaps();
}

getMaps();

var navLinks = document.querySelectorAll(".left-nav a");
var navSections = ["Play", "Agents", "Maps"];

function setActive(id) {
    for (let i = 0; i < navLinks.length; i++) {
        navLinks[i].classList.toggle("active", navLinks[i].getAttribute("href") == "#" + id);
    }
}

function updateNav() {
    var current = "Play";
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5;

    if (atBottom) {
        current = "Maps";
    } else {
        for (let i = 0; i < navSections.length; i++) {
            var el = document.getElementById(navSections[i]);
            if (el && el.getBoundingClientRect().top <= 120) {
                current = navSections[i];
            }
        }
    }
    setActive(current);
}

window.addEventListener("scroll", updateNav);
updateNav();