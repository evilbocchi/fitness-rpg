import { enforceCharacterId } from '../queries/cache.js';
import api from '../queries/query.js';
import { showToast } from './toast.js';

export default function loadTeleports() {
    const character_id = enforceCharacterId();

    const home = document.querySelector('.home-teleport');
    if (home)
        home.href = `/character.html?character_id=${character_id}`;

    const tavern = document.querySelector('.tavern-teleport');
    if (tavern)
        tavern.href = `/tavern.html?character_id=${character_id}`;

    const portal = document.querySelector('.portal-teleport');
    if (portal)
        portal.href = `/portal.html?character_id=${character_id}`;

    const battlefield = document.querySelector('.battlefield-teleport');
    if (battlefield) {
        battlefield.href = `/battlefield.html?character_id=${character_id}`;
        api("GET", `/character/${character_id}/battle`)((status) => {
            if (status === 200) {
                battlefield.classList.remove("d-none");
                showToast("battle_notice", "Ongoing Battle", "You are currently in a battle.");
            }
        });
    }
}