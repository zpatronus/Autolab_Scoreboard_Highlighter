// UserScript
// @name         Autolab Scoreboard Highlighter
// @namespace    https://github.com/zpatronus/Autolab_Scoreboard_Highlighter
// @version      1.3
// @description  Automatically highlights current user's row in Autolab scoreboard
// @author       zPatronus
// @match        https://autolab.andrew.cmu.edu/courses/*/assessments/*/scoreboard
// @updateURL    https://github.com/zpatronus/Autolab_Scoreboard_Highlighter/raw/main/autolab-highlighter.user.js
// @downloadURL  https://github.com/zpatronus/Autolab_Scoreboard_Highlighter/raw/main/autolab-highlighter.user.js
// @supportURL   https://github.com/zpatronus/Autolab_Scoreboard_Highlighter/issues
// @homepageURL  https://github.com/zpatronus/Autolab_Scoreboard_Highlighter
// @grant        none
// /UserScript
(function () {
  'use strict';
  const HIGHLIGHT_STYLE = `
        background-color: black !important;
        color: orange !important;
        font-weight: bold !important;
    `;
  function getCurrentUsername () {
    const nicknameInput = document.getElementById('course_user_datum_nickname');
    return nicknameInput ? nicknameInput.value.trim() : null;
  }
  function highlightUserRow () {
    const currentUser = getCurrentUsername();
    if (!currentUser) return;
    const rows = document.querySelectorAll('table.sortable.prettyBorder tbody tr');
    rows.forEach(row => {
      const nicknameCell = row.querySelector('td:nth-child(2)');
      if (!nicknameCell) return;
      const nickname = nicknameCell.textContent.trim();
      if (nickname === currentUser) {
        row.setAttribute('style', HIGHLIGHT_STYLE);
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
          cell.style.cssText = `
                        color: orange !important;
                        font-weight: bold !important;
                    `;
        });
      }
    });
  }

  highlightUserRow();

  window.addEventListener('load', highlightUserRow);
  const observer = new MutationObserver(highlightUserRow);
  observer.observe(document.body, { childList: true, subtree: true });

  const nicknameInput = document.getElementById('course_user_datum_nickname');
  if (nicknameInput) {
    nicknameInput.addEventListener('input', highlightUserRow);
    nicknameInput.addEventListener('change', highlightUserRow);
  }

  setInterval(highlightUserRow, 1000);
})();