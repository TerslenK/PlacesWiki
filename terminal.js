(function() {
  'use strict';

  const SITE_MAP = {

    'dimensions':   'dimensions/index.html',
    'items':        'items/index.html',
    'entities':     'entities/index.html',
    'advancements': 'advancements/index.html',

    'rooms_0':            'dimensions/rooms_0.html',
    'alpha_plain':        'dimensions/alpha_plain.html',
    'manila_dim':         'dimensions/manila_dim.html',
    'manila':             'dimensions/manila_dim.html',
    'red_road_dim':       'dimensions/red_road_dim.html',
    'red_road':           'dimensions/red_road_dim.html',
    'the_end_dim':        'dimensions/the_end_dim.html',
    'the_end':            'dimensions/the_end_dim.html',
    'structure_bridge_dim': 'dimensions/structure_bridge_dim.html',
    'structure_bridge':   'dimensions/structure_bridge_dim.html',
    'pocket_dimension':   'dimensions/pocket_dimension.html',
    'aquarium_tunnels_dim': 'dimensions/aquarium_tunnels_dim.html',
    'aquarium_tunnels':   'dimensions/aquarium_tunnels_dim.html',
    'pools_dim':          'dimensions/pools_dim.html',
    'pools':              'dimensions/pools_dim.html',
    'the_wall':           'dimensions/the_wall.html',
    'warp_tunnel':        'dimensions/warp_tunnel.html',

    'wallpeeper':  'entities/wallpeeper.html',
    'endlessman':  'entities/endlessman.html',
    'generated':   'entities/generated.html',

    'home': 'index.html',
    '~':    'index.html',
    'admin': 'admin.html',
  };

  function getBaseUrl() {
    var path = window.location.pathname;

    var parts = path.split('/').filter(Boolean);
    var htmlFile = parts[parts.length - 1];

    var depth = 0;
    if (parts.length >= 2 && htmlFile.endsWith('.html')) {
      depth = parts.length - 2; 
    }

    var base = '';

    if (path.includes('/dimensions/') || path.includes('/entities/') || 
        path.includes('/items/') || path.includes('/advancements/')) {
      base = '../';
    }
    return base;
  }

  function navigateTo(target) {
    target = target.toLowerCase().trim().replace(/\/$/, '').replace(/\.html$/, '');

    if (SITE_MAP[target]) {
      window.location.href = getBaseUrl() + SITE_MAP[target];
      return true;
    }
    return false;
  }

  function getCurrentPath() {
    return document.body.getAttribute('data-path') || '~';
  }

  function getAvailableTargets() {
    var path = getCurrentPath();
    if (path === '~') {
      return ['dimensions/', 'items/', 'entities/', 'advancements/'];
    }

    var links = document.querySelectorAll('.ls-item[href], a.nav-item[href]');
    var targets = [];
    links.forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        var name = href.replace('../', '').replace('index.html', '').replace('.html', '').replace(/\/$/, '');
        var parts = name.split('/');
        targets.push(parts[parts.length - 1] || parts[parts.length - 2]);
      }
    });
    return targets;
  }

  var audioCtx = null;
  var crtOsc = null;

  function initAudio() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {}
  }

  function playTypingSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400 + Math.random()*200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }

  function playErrorSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  }

  function playSuccessSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  }

  function startCRTHum() {
    if (!audioCtx || crtOsc) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    crtOsc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    crtOsc.type = 'sine';
    crtOsc.frequency.value = 60; 

    gain.gain.value = 0.015; 

    crtOsc.connect(gain);
    gain.connect(audioCtx.destination);
    crtOsc.start();
  }

  function getUser() {
    return localStorage.getItem('terminalUser') || 'guest';
  }

  function processCommand(cmd) {
    cmd = cmd.trim();
    if (!cmd) return;

    var parts = cmd.split(/\s+/);
    var command = parts[0].toLowerCase();
    var arg = parts.slice(1).join(' ').toLowerCase();

    switch(command) {
      case 'dir':
      case 'ls':
        if (!arg) {

          showLsOutput();
        } else {
          if (!navigateTo(arg)) {
            showError('no such file or directory: ' + arg);
          }
        }
        break;

      case 'cd':
        if (arg === '..' || arg === '../') {

          var path = getCurrentPath();
          if (path === '~') {
            showError('already at root');
          } else if (path.split('/').length <= 2) {

            navigateTo('home');
          } else {

            var parentParts = path.split('/');
            parentParts.pop();
            var parent = parentParts[parentParts.length - 1];
            if (!navigateTo(parent)) {
              navigateTo('home');
            }
          }
        } else if (arg) {
          if (!navigateTo(arg)) {
            showError('no such directory: ' + arg);
          }
        } else {
          navigateTo('home');
        }
        break;

      case 'help':
        showHelp();
        break;

      case 'sudo':
        if (arg === 'su' || !arg) {
          localStorage.setItem('terminalUser', 'root');
          var pUser = document.querySelector('.prompt-user');
          if (pUser) pUser.textContent = 'root';
          if (pUser) pUser.style.color = '#cc3333';
          playSuccessSound();
          showMessage('Privileges elevated. Welcome, root.');
          setTimeout(function() {
            navigateTo('admin');
          }, 1000);
        } else {
          showError('sudo: unknown user');
        }
        break;

      case 'whoami':
        showMessage(getUser());
        break;

      case 'ping':
        if (!arg) {
          showError('ping: missing host operand');
        } else {
          showMessage('PING ' + arg + ' (192.168.0.x) 56(84) bytes of data.');
          setTimeout(function() { showError('Destination Host Unreachable'); }, 1500);
          setTimeout(function() { showError('Destination Host Unreachable'); }, 2500);
          setTimeout(function() { showError('Destination Host Unreachable'); }, 3500);
        }
        break;

      case 'find':
        if (!arg) {
          showError('find: missing operand');
        } else {
          var allTargets = Object.keys(SITE_MAP);
          var matches = allTargets.filter(function(t) { return t.includes(arg); });
          if (matches.length > 0) {
            showMessage(matches.join('  '));
          } else {
            showError('find: no matches found for ' + arg);
          }
        }
        break;

      case 'clear':
        document.querySelector('.container').style.opacity = '0';
        setTimeout(function() {
          document.querySelector('.container').style.opacity = '1';
        }, 300);
        break;

      default:
        showError('command not found: ' + command + '. type "help" for commands');
        break;
    }
  }

  function showLsOutput() {
    var targets = getAvailableTargets();
    if (targets.length === 0) {
      showMessage('(empty directory)');
      return;
    }
    showMessage(targets.join('  '));
  }

  function showMessage(text) {
    removeExistingMessages();
    var msg = document.createElement('div');
    msg.className = 'terminal-message';
    msg.style.cssText = 'position:fixed;bottom:42px;left:0;right:0;background:#111;border-top:1px solid #222;padding:0.5rem 1.5rem;font-family:"Share Tech Mono",monospace;font-size:0.78rem;color:#888;z-index:9997;animation:fadeInMsg 0.15s ease;';
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(function() { msg.remove(); }, 4000);
  }

  function showError(text) {
    playErrorSound();
    removeExistingMessages();
    var msg = document.createElement('div');
    msg.className = 'terminal-message';
    msg.style.cssText = 'position:fixed;bottom:42px;left:0;right:0;background:#1a0e0e;border-top:1px solid #3a2020;padding:0.5rem 1.5rem;font-family:"Share Tech Mono",monospace;font-size:0.78rem;color:#cc6666;z-index:9997;animation:fadeInMsg 0.15s ease;';
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(function() { msg.remove(); }, 3000);
  }

  function showHelp() {
    var lines = [
      'dir / ls ........... list available pages',
      'dir <name> ......... navigate to page',
      'cd .. .............. go up one level',
      'cd <name> .......... navigate to page',
      'find <term> ........ search pages',
      'ping <host> ........ send ICMP ECHO_REQUEST',
      'whoami ............. print effective userid',
      'clear .............. clear screen',
      'help ............... show this message',
    ];
    showMessage(lines.join('\n'));

    var msg = document.querySelector('.terminal-message');
    if (msg) {
      msg.style.whiteSpace = 'pre';
      msg.style.lineHeight = '1.6';
      msg.style.padding = '0.75rem 1.5rem';
    }
  }

  function removeExistingMessages() {
    document.querySelectorAll('.terminal-message').forEach(function(m) { m.remove(); });
  }

  function init() {
    var path = getCurrentPath();

    var pathHtml = '';
    var pathParts = path.split('/');
    for (var i = 0; i < pathParts.length; i++) {
      var p = pathParts[i];
      var target = (p === '~') ? 'home' : p;
      if (i > 0) pathHtml += '/';
      pathHtml += '<span class="prompt-path-segment" data-target="' + target + '" style="cursor:pointer;" onmouseover="this.style.textDecoration=\'underline\'" onmouseout="this.style.textDecoration=\'none\'">' + p + '</span>';
    }

    var user = getUser();
    var userColor = user === 'root' ? '#cc3333' : '#a08060';

    var bar = document.createElement('div');
    bar.className = 'terminal-bar';
    bar.innerHTML = 
      '<span class="prompt-user" style="color:' + userColor + '">' + user + '</span>' +
      '<span class="prompt-host" style="color:#c8c8c8">@</span>' +
      '<span class="prompt-host">places</span>' +
      '<span style="color:#c8c8c8">:</span>' +
      '<span class="prompt-path">' + pathHtml + '</span>' +
      '<span class="prompt-dollar">$ </span>' +
      '<input type="text" id="terminal-input" placeholder="type help for commands" autocomplete="off" spellcheck="false" />' +
      '<span class="help-hint">tab to autocomplete</span>';

    document.body.appendChild(bar);

    var input = document.getElementById('terminal-input');
    var history = [];
    var historyIndex = -1;

    input.addEventListener('keydown', function(e) {
      initAudio();
      startCRTHum();

      if (e.key !== 'Enter' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'Tab') {
        playTypingSound();
      }

      if (e.key === 'Enter') {
        var cmd = input.value;
        if (cmd.trim()) {
          history.unshift(cmd);
          historyIndex = -1;
          processCommand(cmd);
          input.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          input.value = history[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          input.value = history[historyIndex];
        } else {
          historyIndex = -1;
          input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        var val = input.value.trim().toLowerCase();
        var parts = val.split(/\s+/);
        var partial = parts[parts.length - 1];
        if (partial) {
          var allTargets = Object.keys(SITE_MAP);
          var matches = allTargets.filter(function(t) { return t.startsWith(partial); });
          if (matches.length === 1) {
            parts[parts.length - 1] = matches[0];
            input.value = parts.join(' ');
          } else if (matches.length > 1) {
            showMessage(matches.join('  '));
          }
        }
      }
    });

    var imgWindow = document.querySelector('.image-window');
    if (imgWindow) {
      var winBar = imgWindow.querySelector('.window-bar');
      var closeBtn = imgWindow.querySelector('.window-bar-right span:last-child');

      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          if (!imgWindow.style.transform || imgWindow.style.transform.includes('translateY')) {
            var rect = imgWindow.getBoundingClientRect();
            imgWindow.style.left = rect.left + 'px';
            imgWindow.style.top = rect.top + 'px';
            imgWindow.style.right = 'auto';
            imgWindow.style.transform = 'none';
          }

          imgWindow.classList.add('closing');
          setTimeout(function() {
            imgWindow.style.display = 'none';
          }, 250);
        });
      }

      if (winBar) {
        var isDragging = false;
        var startX, startY;
        var startMarginRight = 0, startMarginTop = 0;

        winBar.style.cursor = 'grab';

        winBar.addEventListener('mousedown', function(e) {
          isDragging = true;
          winBar.style.cursor = 'grabbing';

          startX = e.clientX;
          startY = e.clientY;

          var compStyle = window.getComputedStyle(imgWindow);
          startMarginRight = parseInt(compStyle.marginRight) || 0;
          startMarginTop = parseInt(compStyle.marginTop) || 0;

          e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
          if (!isDragging) return;
          var dx = e.clientX - startX;
          var dy = e.clientY - startY;
          imgWindow.style.marginRight = (startMarginRight - dx) + 'px';
          imgWindow.style.marginTop = (startMarginTop + dy) + 'px';
        });

        document.addEventListener('mouseup', function() {
          isDragging = false;
          winBar.style.cursor = 'grab';
        });
      }
    }

    bar.addEventListener('click', function(e) { 
      if (e.target.classList.contains('prompt-path-segment')) {
        navigateTo(e.target.getAttribute('data-target'));
      } else {
        input.focus(); 
      }
    });

    input.focus();

    document.addEventListener('keydown', function(e) {

      if (e.ctrlKey || e.metaKey) return;

      if (document.activeElement !== input) {
        initAudio();
        startCRTHum();
        if (e.key.length === 1 || e.key === 'Backspace') {
          playTypingSound();
          input.focus();
        }
      }
    });

    var style = document.createElement('style');
    style.textContent = '@keyframes fadeInMsg{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
