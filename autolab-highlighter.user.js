// ==UserScript==
// @name         Autolab Scoreboard Highlighter
// @namespace    https://github.com/zpatronus/Autolab_Scoreboard_Highlighter
// @version      1.5
// @description  Automatically highlights current user's row in Autolab scoreboard with adaptive dark/light mode support
// @author       zPatronus
// @match        https://autolab.andrew.cmu.edu/courses/*/assessments/*/scoreboard
// @updateURL    https://github.com/zpatronus/Autolab_Scoreboard_Highlighter/raw/main/autolab-highlighter.user.js
// @downloadURL  https://github.com/zpatronus/Autolab_Scoreboard_Highlighter/raw/main/autolab-highlighter.user.js
// @supportURL   https://github.com/zpatronus/Autolab_Scoreboard_Highlighter/issues
// @homepageURL  https://github.com/zpatronus/Autolab_Scoreboard_Highlighter
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let darkModeCache = false;

  const DARK_MODE_STYLE = {
    row: `background-color: black !important; color: orange !important; font-weight: bold !important;`,
    cell: `color: orange !important; font-weight: bold !important;`
  };

  const LIGHT_MODE_STYLE = {
    row: `background-color: #f0f0f0 !important; color: red !important; font-weight: bold !important;`,
    cell: `color: red !important; font-weight: bold !important;`
  };

  function getCurrentUsername () {
    const nicknameInput = document.getElementById('course_user_datum_nickname');
    return nicknameInput ? nicknameInput.value.trim() : null;
  }

  function parseRGB (rgbStr) {
    const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }
    return null;
  }

  function getSolidBackground (element) {
    if (!element) return 'rgb(255,255,255)';
    let current = element;
    while (current) {
      const bgColor = window.getComputedStyle(current).backgroundColor;
      if (bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
        return bgColor;
      }
      current = current.parentElement;
    }
    return 'rgb(255,255,255)';
  }

  function isDarkMode () {

    const table = document.querySelector('table.sortable.prettyBorder');
    if (!table) return darkModeCache;

    const tbody = table.querySelector('tbody');
    if (!tbody) return darkModeCache;

    const rows = tbody.querySelectorAll('tr');
    if (rows.length === 0) return darkModeCache;

    const bgColor = getSolidBackground(rows[0]);
    const rgb = parseRGB(bgColor);
    if (!rgb) return darkModeCache;

    const luminance = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
    darkModeCache = luminance < 128;

    return darkModeCache;
  }

  function highlightUserRow () {
    const currentUser = getCurrentUsername();
    if (!currentUser) return;

    const isDark = isDarkMode();
    const style = isDark ? DARK_MODE_STYLE : LIGHT_MODE_STYLE;

    const rows = document.querySelectorAll('table.sortable.prettyBorder tbody tr');
    rows.forEach(row => {
      const nicknameCell = row.querySelector('td:nth-child(2)');
      if (!nicknameCell) return;

      const nickname = nicknameCell.textContent.trim();
      if (nickname === currentUser) {
        row.setAttribute('style', style.row);
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
          cell.style.cssText = style.cell;
        });
      }
    });
  }

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