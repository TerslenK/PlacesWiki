(function() {
  'use strict';

  // --- LOCAL FILE ISOLATION BYPASS ---
  // When running on file:///, localStorage is often isolated per file.
  // We sync state via URL parameters to keep the puzzle working.
  function syncStateFromUrl() {
    if (window.location.protocol !== 'file:') return;
    var params = new URLSearchParams(window.location.search);
    
    if (params.has('auth')) {
      if (params.get('auth') === 'root') localStorage.setItem('terminalUser', 'root');
      else localStorage.setItem('terminalUser', 'guest');
    }
    
    if (params.has('infected')) {
      if (params.get('infected') === 'true') localStorage.setItem('virusInfection', 'true');
      else localStorage.removeItem('virusInfection');
    }
    
    if (params.has('nightmare')) {
      if (params.get('nightmare') === 'true') localStorage.setItem('nightmareMode', 'true');
      else localStorage.removeItem('nightmareMode');
    }
    
    if (params.has('puzzle')) {
      if (params.get('puzzle') === 'none') localStorage.removeItem('virusPuzzle');
      else localStorage.setItem('virusPuzzle', params.get('puzzle'));
    }
  }
  
  function getQueryStringForLocalState() {
    if (window.location.protocol !== 'file:') return '';
    var params = new URLSearchParams();
    
    params.set('auth', localStorage.getItem('terminalUser') === 'root' ? 'root' : 'guest');
    params.set('infected', localStorage.getItem('virusInfection') === 'true' ? 'true' : 'false');
    params.set('nightmare', localStorage.getItem('nightmareMode') === 'true' ? 'true' : 'false');
    
    var puzzle = localStorage.getItem('virusPuzzle');
    params.set('puzzle', puzzle ? puzzle : 'none');
    
    var str = params.toString();
    return str ? '?' + str : '';
  }


  syncStateFromUrl();

  // --- Zalgo/cursed text generator ---
  var zalgoUp = ['\u030d','\u030e','\u0304','\u0305','\u033f','\u0311','\u0306','\u0310','\u0352','\u0357','\u0351','\u0307','\u0308','\u030a','\u0342','\u0343','\u0344','\u034a','\u034b','\u034c','\u0303','\u0302','\u030c','\u0350','\u0300','\u0301','\u030b','\u030f'];
  var zalgoDown = ['\u0316','\u0317','\u0318','\u0319','\u031c','\u031d','\u031e','\u031f','\u0320','\u0324','\u0325','\u0326','\u0329','\u032a','\u032b','\u032c','\u032d','\u032e','\u032f','\u0330','\u0331','\u0332','\u0333','\u0339','\u033a','\u033b','\u033c','\u0345'];
  var zalgoMid = ['\u0315','\u031b','\u0340','\u0341','\u0358','\u0321','\u0322','\u0327','\u0328','\u0334','\u0335','\u0336','\u034f','\u035c','\u035d','\u035e','\u035f','\u0360','\u0362','\u0338','\u0337'];

  function zalgoify(text, intensity) {
    intensity = intensity || 1;
    var result = '';
    for (var i = 0; i < text.length; i++) {
      result += text[i];
      if (text[i] === ' ') continue;
      var numUp = Math.floor(Math.random() * intensity) + 1;
      var numDown = Math.floor(Math.random() * intensity) + 1;
      var numMid = Math.floor(Math.random() * Math.ceil(intensity / 2));
      for (var j = 0; j < numUp; j++) result += zalgoUp[Math.floor(Math.random() * zalgoUp.length)];
      for (var j = 0; j < numDown; j++) result += zalgoDown[Math.floor(Math.random() * zalgoDown.length)];
      for (var j = 0; j < numMid; j++) result += zalgoMid[Math.floor(Math.random() * zalgoMid.length)];
    }
    return result;
  }

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
      window.location.href = getBaseUrl() + SITE_MAP[target] + getQueryStringForLocalState();
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

  // --- Password prompt state ---
  var awaitingPassword = false;
  var passwordAttempts = 0;
  var passwordLockoutUntil = 0;

  function enterPasswordMode() {
    awaitingPassword = true;
    var input = document.getElementById('terminal-input');
    if (input) {
      input.type = 'password';
      input.value = '';
      input.placeholder = '';
      input.style.color = '#cc6666';
    }
    showMessage('[sudo] password for ' + getUser() + ':');
  }

  function exitPasswordMode() {
    awaitingPassword = false;
    var input = document.getElementById('terminal-input');
    if (input) {
      input.type = 'text';
      input.value = '';
      input.placeholder = 'type help for commands';
      input.style.color = '#c8c8c8';
    }
  }

  function handlePasswordSubmit(password) {
    var now = Date.now();
    if (now < passwordLockoutUntil) {
      var remaining = Math.ceil((passwordLockoutUntil - now) / 1000);
      showError('sudo: account locked. try again in ' + remaining + 's');
      exitPasswordMode();
      return;
    }

    // Try fetching .env, fall back to hardcoded password if fetch fails
    // (fetch fails on file://, Vite dev servers that block dotfiles, etc.)
    var base = getBaseUrl();
    fetch(base + '.env')
      .then(function(res) {
        if (!res.ok) throw new Error('not found');
        return res.text();
      })
      .then(function(text) {
        var match = text.match(/ADMIN_PASS=(.+)/);
        return match ? match[1].trim() : null;
      })
      .catch(function() {
        // Fallback: .env unreachable (file://, blocked by server, etc.)
        return 'changeme123';
      })
      .then(function(adminPass) {
        if (adminPass && password === adminPass) {
          // Success
          passwordAttempts = 0;
          localStorage.setItem('terminalUser', 'root');
          var pUser = document.querySelector('.prompt-user');
          if (pUser) {
            pUser.textContent = 'root';
            pUser.style.color = '#cc3333';
          }
          playSuccessSound();
          exitPasswordMode();
          showMessage('Privileges elevated. Welcome, root.');
          setTimeout(function() {
            var qs = getQueryStringForLocalState();
            var url = base + 'admin.html' + (qs ? qs : '?auth=root');
            window.location.href = url;
          }, 1200);
        } else {
          // Failure
          passwordAttempts++;
          playErrorSound();
          if (passwordAttempts >= 3) {
            passwordLockoutUntil = Date.now() + 30000;
            showError('sudo: 3 incorrect attempts. account locked for 30s.');
            passwordAttempts = 0;
          } else {
            showError('sudo: authentication failure. ' + (3 - passwordAttempts) + ' attempt(s) remaining.');
          }
          exitPasswordMode();
        }
      });
  }

  // --- Antivirus / cure system ---
  function runAntivirus(args) {
    var infected = localStorage.getItem('virusInfection');
    if (infected !== 'true') {
      showMessage('antivirus: no threats detected. system is clean.');
      return;
    }

    var puzzleStr = localStorage.getItem('virusPuzzle');
    if (puzzleStr) {
      try {
        var puzzle = JSON.parse(puzzleStr);
        if (!args || args.trim() === '') {
          showError('cure: manual override requires 3 validation keys. search the corrupted sectors.');
          
          var msgText = 'corrupted sectors detected:\n';
          puzzle.pages.forEach(function(page) {
            msgText += '  -> ' + page + '\n';
          });
          setTimeout(function() { 
            showMessage(msgText); 
            var msgEl = document.querySelector('.terminal-message');
            if (msgEl) {
              msgEl.style.whiteSpace = 'pre';
              msgEl.style.lineHeight = '1.6';
              msgEl.style.bottom = '80px';
            }
          }, 3100);
          return;
        }

        var providedKeys = args.toUpperCase().split(/\s+/).filter(Boolean);
        var requiredKeys = puzzle.words;
        var valid = true;

        if (providedKeys.length !== requiredKeys.length) {
          showError('cure: error: expected 3 keys separated by spaces (e.g. cure KEY1 KEY2 KEY3).');
          
          var msgText = 'corrupted sectors detected:\n';
          puzzle.pages.forEach(function(page) {
            msgText += '  -> ' + page + '\n';
          });
          setTimeout(function() { 
            showMessage(msgText); 
            var msgEl = document.querySelector('.terminal-message');
            if (msgEl) {
              msgEl.style.whiteSpace = 'pre';
              msgEl.style.lineHeight = '1.6';
              msgEl.style.bottom = '80px';
            }
          }, 3100);
          return;
        } else {
          for (var i = 0; i < requiredKeys.length; i++) {
            if (!providedKeys.includes(requiredKeys[i])) {
              valid = false;
              break;
            }
          }
        }

        if (!valid) {
          showError('cure: invalid validation keys. override failed.');
          
          var msgText2 = 'corrupted sectors detected:\n';
          puzzle.pages.forEach(function(page) {
            msgText2 += '  -> ' + page + '\n';
          });
          setTimeout(function() { 
            showMessage(msgText2); 
            var msgEl2 = document.querySelector('.terminal-message');
            if (msgEl2) {
              msgEl2.style.whiteSpace = 'pre';
              msgEl2.style.lineHeight = '1.6';
              msgEl2.style.bottom = '80px';
            }
          }, 3100);
          return;
        }
      } catch(e) {
        // If puzzle parsing fails, allow bypass to not softlock user
      }
    }

    showMessage('antivirus: validation accepted. initiating override...');
    setTimeout(function() {
      showMessage('antivirus: quarantining infected sectors...');
    }, 1500);
    setTimeout(function() {
      showMessage('antivirus: removing malicious payloads...');
    }, 3000);
    setTimeout(function() {
      // Clear all infection state
      localStorage.removeItem('virusInfection');
      localStorage.removeItem('nightmareMode');
      localStorage.removeItem('virusPuzzle');
      localStorage.removeItem('terminalUser');
      localStorage.removeItem('infectionStart');
      document.body.classList.remove('nightmare', 'distortion-1', 'distortion-2', 'distortion-3');
      playSuccessSound();
      showMessage('antivirus: all threats removed. system restored. rebooting...');
      setTimeout(function() {
        window.location.href = getBaseUrl() + 'index.html' + getQueryStringForLocalState();
      }, 2000);
    }, 4500);
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
        if (!arg || arg === 'su') {
          if (getUser() === 'root') {
            showMessage('already running as root.');
          } else {
            enterPasswordMode();
          }
        } else {
          showError('sudo: unknown command: ' + arg);
        }
        break;

      case 'antivirus':
      case 'cure':
        runAntivirus(arg);
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

      case 'logout':
      case 'exit':
        if (getUser() === 'root') {
          localStorage.setItem('terminalUser', 'guest');
          var pUser = document.querySelector('.prompt-user');
          if (pUser) {
            pUser.textContent = 'guest';
            pUser.style.color = '#a08060';
          }
          showMessage('logout: dropped root privileges');
          // If on admin page, they will be kicked out on reload or we can force redirect
          if (window.location.pathname.endsWith('admin.html')) {
            setTimeout(function() {
              window.location.href = getBaseUrl() + 'index.html';
            }, 1000);
          }
        } else {
          showMessage('logout: not logged in as root');
        }
        break;

      case 'reboot':
      case 'restart':
        showMessage('rebooting system...');
        setTimeout(function() {
          window.location.reload();
        }, 1000);
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
      '--- NAVIGATION ---',
      'dir / ls ........... list available pages',
      'dir <name> ......... navigate to page',
      'cd .. .............. go up one level',
      'cd <name> .......... navigate to page',
      'find <term> ........ search pages',
      '',
      '--- SYSTEM ---',
      'ping <host> ........ send ICMP ECHO_REQUEST',
      'clear .............. clear screen',
      'reboot ............. restart the system',
      'help ............... show this message',
      '',
      '--- SECURITY ---',
      'whoami ............. print effective userid',
      'sudo ............... elevate privileges',
      'logout ............. drop elevated privileges',
      'antivirus .......... scan for threats',
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

    // Persist nightmare mode across page navigations
    if (localStorage.getItem('nightmareMode') === 'true') {
      document.body.classList.add('nightmare');
    }

    // --- Persistent Infection System ---
    if (localStorage.getItem('virusInfection') === 'true') {
      // Always apply nightmare mode when infected
      document.body.classList.add('nightmare');
      localStorage.setItem('nightmareMode', 'true');

      // Track infection start time for progressive distortion
      var infectionStart = localStorage.getItem('infectionStart');
      if (!infectionStart) {
        infectionStart = Date.now().toString();
        localStorage.setItem('infectionStart', infectionStart);
      }

      // Calculate distortion level based on time infected
      var elapsed = Date.now() - parseInt(infectionStart);
      var minutesInfected = elapsed / 60000;
      var distortionLevel = 0;
      if (minutesInfected >= 5) distortionLevel = 3;       // 5+ min: heavy
      else if (minutesInfected >= 2) distortionLevel = 2;  // 2+ min: noticeable
      else if (minutesInfected >= 0.5) distortionLevel = 1; // 30s+: subtle

      if (distortionLevel > 0) {
        document.body.classList.add('distortion-' + distortionLevel);

        // Zalgoify text elements based on distortion level
        var intensity = distortionLevel;
        var titles = document.querySelectorAll('.page-title');
        titles.forEach(function(el) {
          el.textContent = zalgoify(el.textContent, intensity);
        });
        if (distortionLevel >= 2) {
          var subtitles = document.querySelectorAll('.subtitle');
          subtitles.forEach(function(el) {
            el.textContent = zalgoify(el.textContent, intensity);
          });
        }
        if (distortionLevel >= 3) {
          var names = document.querySelectorAll('.ls-item .name, .ls-item-static .name');
          names.forEach(function(el) {
            el.textContent = zalgoify(el.textContent, 2);
          });
        }
      }

      // Inject virus puzzle fragments on matching pages
      var puzzleStr = localStorage.getItem('virusPuzzle');
      if (puzzleStr) {
        try {
          var puzzle = JSON.parse(puzzleStr);
          var currentPath = getCurrentPath();
          var pageIndex = puzzle.pages.indexOf(currentPath);
          if (pageIndex !== -1) {
            var word = puzzle.words[pageIndex];
            var fragment = document.createElement('span');
            fragment.className = 'virus-fragment';
            fragment.textContent = word;
            var container = document.querySelector('.container') || document.body;
            container.appendChild(fragment);
          }
        } catch(e) {}
      }

      // Sync infection state to URL for file:// protocol
      if (window.location.protocol === 'file:') {
        var params = new URLSearchParams(window.location.search);
        params.set('infected', 'true');
        params.set('nightmare', 'true');
        params.set('auth', localStorage.getItem('terminalUser') === 'root' ? 'root' : 'guest');
        if (puzzleStr) params.set('puzzle', puzzleStr);
        window.history.replaceState(null, '', window.location.pathname + '?' + params.toString());
      }

      // Intercept ALL <a> link clicks to carry infection state forward
      if (window.location.protocol === 'file:') {
        document.addEventListener('click', function(e) {
          var link = e.target.closest('a[href]');
          if (!link) return;
          var href = link.getAttribute('href');
          if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('javascript')) return;
          e.preventDefault();
          window.location.href = href + getQueryStringForLocalState();
        });
      }
    }

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
        if (awaitingPassword) {
          var pw = input.value;
          input.value = '';
          handlePasswordSubmit(pw);
          return;
        }
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
      var btns = imgWindow.querySelectorAll('.window-bar-right span');
      var minimizeBtn = btns.length > 0 ? btns[0] : null;
      var maximizeBtn = btns.length > 1 ? btns[1] : null;
      var closeBtn = btns.length > 2 ? btns[2] : null;

      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          imgWindow.style.animation = ''; // Clear inline animation override so .closing plays
          imgWindow.classList.add('closing');
          setTimeout(function() {
            imgWindow.style.display = 'none';
          }, 250);
        });
      }

      if (minimizeBtn) {
        minimizeBtn.addEventListener('click', function() {
          if (imgWindow.classList.contains('minimized')) {
            imgWindow.classList.remove('minimized');
          } else {
            imgWindow.classList.remove('maximized');
            imgWindow.classList.add('minimized');
          }
        });
      }

      if (maximizeBtn) {
        maximizeBtn.addEventListener('click', function() {
          if (imgWindow.classList.contains('maximized')) {
            imgWindow.classList.remove('maximized');
          } else {
            imgWindow.classList.remove('minimized');
            imgWindow.classList.add('maximized');
          }
        });
      }

      if (winBar) {
        var isDragging = false;
        var startX, startY;
        var startLeft, startTop;

        winBar.style.cursor = 'grab';

        winBar.addEventListener('mousedown', function(e) {
          if (e.target.tagName === 'SPAN') return; // Ignore button clicks
          if (imgWindow.classList.contains('maximized')) return; // Prevent dragging while maximized
          
          isDragging = true;
          winBar.style.cursor = 'grabbing';

          // Convert positioning to absolute left/top once dragged
          if (!imgWindow.style.left || imgWindow.style.transform.includes('translateY')) {
            var rect = imgWindow.getBoundingClientRect();
            imgWindow.style.opacity = '1';      // Keep it visible when animation dies
            imgWindow.style.animation = 'none'; // Kill the popupWindow animation forwards lock
            imgWindow.style.left = rect.left + 'px';
            imgWindow.style.top = rect.top + 'px';
            imgWindow.style.right = 'auto';
            imgWindow.style.transform = 'none';
            imgWindow.style.marginRight = '0';
            imgWindow.style.marginTop = '0';
          }

          startX = e.clientX;
          startY = e.clientY;

          startLeft = parseFloat(imgWindow.style.left) || 0;
          startTop = parseFloat(imgWindow.style.top) || 0;

          e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
          if (!isDragging) return;
          var dx = e.clientX - startX;
          var dy = e.clientY - startY;
          var newTop = startTop + dy;
          if (newTop < 0) newTop = 0; // Prevent title bar from going off-screen
          imgWindow.style.left = (startLeft + dx) + 'px';
          imgWindow.style.top = newTop + 'px';
        });

        document.addEventListener('mouseup', function() {
          if (isDragging) {
            isDragging = false;
            winBar.style.cursor = 'grab';
          }
        });
      }

      // Zoom feature
      var windowContent = imgWindow.querySelector('.window-content');
      var img = imgWindow.querySelector('.window-content img');
      var zoomSpan = null;
      var bottomSpans = imgWindow.querySelectorAll('.window-bottom span');
      for (var i = 0; i < bottomSpans.length; i++) {
        if (bottomSpans[i].textContent.includes('%27') || bottomSpans[i].innerHTML.includes('128269')) {
          zoomSpan = bottomSpans[i];
          break;
        }
      }

      if (windowContent && img && zoomSpan) {
        var zoomLevel = 1.0;
        var panX = 0;
        var panY = 0;
        var isPanning = false;
        var panStartX, panStartY;
        var panStartLeft, panStartTop;

        zoomSpan.innerHTML = '&#128269; 100% &#711;';
        zoomSpan.style.cursor = 'pointer';

        var updateTransform = function() {
          img.style.transform = 'scale(' + zoomLevel + ') translate(' + panX + 'px, ' + panY + 'px)';
          zoomSpan.innerHTML = '&#128269; ' + Math.round(zoomLevel * 100) + '% &#711;';
          if (zoomLevel > 1.0) {
            windowContent.style.cursor = isPanning ? 'grabbing' : 'grab';
          } else {
            windowContent.style.cursor = 'default';
          }
        };

        windowContent.addEventListener('wheel', function(e) {
          e.preventDefault();
          var zoomStep = zoomLevel * 0.15; // Logarithmic zoom feels better
          if (zoomStep < 0.1) zoomStep = 0.1;
          
          if (e.deltaY < 0) {
            zoomLevel += zoomStep;
          } else {
            zoomLevel -= zoomStep;
          }
          if (zoomLevel < 0.1) zoomLevel = 0.1;
          if (zoomLevel > 20.0) zoomLevel = 20.0;
          
          if (zoomLevel <= 1.0) {
            panX = 0;
            panY = 0;
            zoomLevel = 1.0;
          }
          updateTransform();
        });

        windowContent.addEventListener('mousedown', function(e) {
          if (zoomLevel > 1.0) {
            isPanning = true;
            panStartX = e.clientX;
            panStartY = e.clientY;
            panStartLeft = panX;
            panStartTop = panY;
            windowContent.style.cursor = 'grabbing';
            e.preventDefault();
          }
        });

        document.addEventListener('mousemove', function(e) {
          if (!isPanning) return;
          var dx = (e.clientX - panStartX) / zoomLevel;
          var dy = (e.clientY - panStartY) / zoomLevel;
          panX = panStartLeft + dx;
          panY = panStartTop + dy;
          updateTransform();
        });

        document.addEventListener('mouseup', function() {
          if (isPanning) {
            isPanning = false;
            updateTransform();
          }
        });

        zoomSpan.addEventListener('click', function() {
          zoomLevel = 1.0;
          panX = 0;
          panY = 0;
          updateTransform();
        });
      }

      // Custom Window Resizer
      var resizer = document.createElement('div');
      resizer.className = 'resize-handle';
      imgWindow.appendChild(resizer);

      var isResizing = false;
      var resizeStartX, resizeStartY;
      var startWidth, startHeight;

      resizer.addEventListener('mousedown', function(e) {
        if (imgWindow.classList.contains('maximized') || imgWindow.classList.contains('minimized')) return;
        
        // Convert to absolute positioning to avoid center-growth bug
        if (!imgWindow.style.left || imgWindow.style.transform.includes('translateY')) {
          var rect = imgWindow.getBoundingClientRect();
          imgWindow.style.opacity = '1';
          imgWindow.style.animation = 'none'; 
          imgWindow.style.left = rect.left + 'px';
          imgWindow.style.top = rect.top + 'px';
          imgWindow.style.right = 'auto';
          imgWindow.style.transform = 'none';
          imgWindow.style.marginRight = '0';
          imgWindow.style.marginTop = '0';
        }

        isResizing = true;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        startWidth = imgWindow.offsetWidth;
        startHeight = imgWindow.offsetHeight;
        e.preventDefault();
      });

      document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        var newWidth = startWidth + (e.clientX - resizeStartX);
        var newHeight = startHeight + (e.clientY - resizeStartY);
        
        if (newWidth < 300) newWidth = 300;
        if (newHeight < 200) newHeight = 200;
        
        imgWindow.style.width = newWidth + 'px';
        imgWindow.style.height = newHeight + 'px';
      });

      document.addEventListener('mouseup', function() {
        if (isResizing) {
          isResizing = false;
        }
      });

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
