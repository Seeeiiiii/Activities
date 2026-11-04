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
var perPage = 8;
var finalPage = 1;

const getAgents = async () => {
    const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
    const result = await response.json();
    allAgents = result.data;

    allAgents.forEach(agent => {
        if (agent.role) {
            roleIcons[agent.role.displayName.toLowerCase()] = agent.role.displayIcon;
        }
    });

    roleButtons.forEach(btn => {
        var icon = roleIcons[btn.dataset.role];
        if (icon) {
            btn.insertAdjacentHTML("afterbegin", `<img src="${icon}" alt="">`);
        }
    });

    applyFilters();
}

function applyFilters() {
    filtered = allAgents.filter(agent => {
        var role = agent.role ? agent.role.displayName.toLowerCase() : "";
        var matchRole = currentRole == "all" || role == currentRole;
        var matchName = agent.displayName.toLowerCase().includes(searchText);
        return matchRole && matchName;
    });

    finalPage = Math.max(1, Math.ceil(filtered.length / perPage));
    page = 1;
    showAgents();
}

function showAgents() {
    elCurrentPage.innerHTML = page + " / " + finalPage;

    if (filtered.length == 0) {
        elParent.innerHTML = '<div class="text-center text-white fs-4">No agents found.</div>';
        return;
    }

    var start = (page - 1) * perPage;
    var pageAgents = filtered.slice(start, start + perPage);

    var html = '';

    pageAgents.forEach(agent => {
        var role = agent.role ? agent.role.displayName : "Agent";
        var icon = agent.role ? agent.role.displayIcon : "";

        var hex = (agent.backgroundGradientColors[0] || "b4414f").slice(0, 6);
        var accent = "#" + hex;
        var accentSoft = "#" + hex + "55";

        var roleColor = roleColors[role.toLowerCase()] || accent;

        html += `
          <div class="col-3">
            <div class="agent-card" onclick="openAgent('${agent.uuid}')" style="--role: ${roleColor}; --accent: ${accent}; --accent-soft: ${accentSoft};">
              <div class="bg-name">${agent.displayName}</div>
              <img class="agent-img" src="${agent.fullPortrait}" alt="${agent.displayName}">
              <div class="role">
                <img class="role-icon" src="${icon}" alt="">
                <span>${role}</span>
              </div>
              <div class="name">${agent.displayName}</div>
            </div>
          </div>
        `;
    });

    elParent.innerHTML = html;
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

    currentAbilities = agent.abilities.filter(a => a.displayIcon);

    var abilityHtml = '';
    currentAbilities.forEach((ability, i) => {
        abilityHtml += `<img class="ability-icon" src="${ability.displayIcon}" alt="${ability.displayName}" onclick="showAbility(${i})">`;
    });
    document.getElementById("mAbilityRow").innerHTML = abilityHtml;

    showAbility(0);
    agentModal.show();
}

function showAbility(i) {
    var ability = currentAbilities[i];
    var icons = document.querySelectorAll(".ability-icon");
    icons.forEach((el, n) => el.classList.toggle("active", n == i));

    var tag = document.getElementById("mAbilityTag");
    document.getElementById("mAbilityName").innerHTML = ability.displayName;
    document.getElementById("mAbilityDesc").innerHTML = ability.description;
    tag.innerHTML = slotNames[ability.slot] || ability.slot;
    tag.classList.toggle("ultimate", ability.slot == "Ultimate");
}

roleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        roleButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentRole = btn.dataset.role;
        applyFilters();
    });
});

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
