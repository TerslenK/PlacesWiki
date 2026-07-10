(function() {
  window.startVirus = function() {
    let activeWindows = [];
    let isCrashed = false;

    // Activate Nightmare Mode globally instantly
    document.body.classList.add('nightmare');
    localStorage.setItem('nightmareMode', 'true');

    if (window.location.protocol === 'file:') {
      let params = new URLSearchParams(window.location.search);
      params.set('nightmare', 'true');
      window.history.replaceState(null, '', window.location.pathname + '?' + params.toString());
    }
    let audioCtx = null;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { console.warn("AudioContext failed", e); }

    // Scary Alarm
    function playAlarm() {
      if (!audioCtx) return;
      try {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch(e) {}
    }

    let alarmInterval = setInterval(() => {
      if (!isCrashed) playAlarm();
    }, 300);

    function createEyeWindow() {
      if (isCrashed) return;

      let win = document.createElement('div');
      win.className = 'virus-eye-window';
      win.style.position = 'fixed';
      win.style.width = '300px';
      win.style.height = '300px';
      win.style.zIndex = 10000 + activeWindows.length;
      win.style.border = '2px solid #cc0000';
      win.style.background = '#000';
      win.style.boxShadow = '0 0 20px #cc0000';
      win.style.userSelect = 'none';

      win.innerHTML = `
        <div class="window-bar" style="background: #300000; color: #cc3333; cursor: default; border-bottom: 2px solid #cc0000; pointer-events: none;">
          <div class="window-bar-left">
            <span>&#9888; SECTOR 0</span>
          </div>
          <div class="window-bar-right">
            <span class="close-btn" style="background:#cc0000; color:#fff; padding: 0 5px; font-weight:bold; cursor:pointer; pointer-events: auto;">X</span>
          </div>
        </div>
        <div class="window-content" style="padding:0; overflow:hidden; display:flex; align-items:center; justify-content:center; height:calc(100% - 24px); pointer-events: none;">
          <img src="https://media1.tenor.com/m/qRqHd7j3kkYAAAAC/look-at-us-eye.gif" style="width:100%; height:100%; object-fit:cover; pointer-events: none;" onerror="this.style.display='none'" />
        </div>
      `;
      
      document.body.appendChild(win);
      activeWindows.push(win);

      // Bouncing logic
      let x = Math.random() * (window.innerWidth - 300);
      let y = Math.random() * (window.innerHeight - 300);
      let vx = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 4);
      let vy = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 4);

      function updateBounce() {
        if (isCrashed) return;
        x += vx;
        y += vy;
        
        if (x <= 0 || x >= window.innerWidth - 300) vx = -vx;
        if (y <= 0 || y >= window.innerHeight - 300) vy = -vy;
        
        win.style.left = x + 'px';
        win.style.top = y + 'px';
        requestAnimationFrame(updateBounce);
      }
      requestAnimationFrame(updateBounce);

      // Multiply on close — only the close button is clickable
      win.querySelector('.close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isCrashed) return;
        for(let i=0; i<3; i++) {
          createEyeWindow();
        }
      });
    }

    // Start with 3 windows
    createEyeWindow();
    createEyeWindow();
    createEyeWindow();

    // Multiply automatically — very fast for the short 2s window
    let spawnInterval = setInterval(() => {
      if (activeWindows.length < 200) {
        createEyeWindow();
        createEyeWindow();
        createEyeWindow();
      }
    }, 80); // 3 eyes every 80ms = tons of eyes in 2 seconds

    // Stage 2: The Crash (After 2 seconds)
    setTimeout(() => {
      isCrashed = true;
      clearInterval(spawnInterval);
      clearInterval(alarmInterval);
      activeWindows.forEach(w => w.remove());
      
      // Generate Procedural Puzzle
      const possiblePages = [
        '~/entities/wallpeeper', '~/entities/endlessman', '~/entities/generated',
        '~/items/cardboard_box', '~/dimensions/rooms_0', '~/dimensions/manila_dim', 
        '~/dimensions/pools_dim', '~/dimensions/the_end_dim', '~/dimensions/red_road_dim'
      ];
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let generateWord = () => { let w=''; for(let i=0;i<4;i++) w+=chars[Math.floor(Math.random()*chars.length)]; return w; };
      
      let shuffledPages = possiblePages.sort(() => 0.5 - Math.random()).slice(0, 3);
      let puzzleData = {
        pages: shuffledPages,
        words: [generateWord(), generateWord(), generateWord()]
      };
      localStorage.setItem('virusPuzzle', JSON.stringify(puzzleData));
      localStorage.setItem('virusInfection', 'true');

      if (window.location.protocol === 'file:') {
        let params = new URLSearchParams(window.location.search);
        params.set('infected', 'true');
        params.set('puzzle', JSON.stringify(puzzleData));
        window.history.replaceState(null, '', window.location.pathname + '?' + params.toString());
      }
      
      document.body.innerHTML = `
        <div id="kernel-panic-screen" style="background:#000; color:#fff; width:100vw; height:100vh; position:fixed; top:0; left:0; z-index:999999; display:flex; flex-direction:column; justify-content:center; align-items:center; font-family:'Share Tech Mono', monospace;">
          <h1 id="kp-title" style="color:#cc0000; font-size:4rem; margin-bottom:1rem; text-shadow: 0 0 10px #cc0000;">KERNEL PANIC</h1>
          <p id="kp-text" style="font-size:1.5rem; max-width: 800px; text-align:center; color:#ccc;">
            STOP CODE: 0x0000DEAD<br><br>
            THE_VOID_HAS_AWOKEN<br><br>
            A fatal error has occurred in containment sector 0. All safety protocols have been overridden.
            The void is leaking into the main partition. 
            <br><br>
            <span class="blink">SYSTEM HALTED. PLEASE REBOOT.</span>
          </p>
        </div>
      `;
      
      // Dramatic crash beep
      if (audioCtx) {
        let crashOsc = audioCtx.createOscillator();
        let crashGain = audioCtx.createGain();
        crashOsc.type = 'square';
        crashOsc.frequency.value = 150;
        crashGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        crashGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 4.5);
        crashOsc.connect(crashGain);
        crashGain.connect(audioCtx.destination);
        crashOsc.start();
        crashOsc.stop(audioCtx.currentTime + 5.0);
      }

      // T+8s: The Shatter (kernel panic stays 8 seconds)
      setTimeout(() => {
        let kpScreen = document.getElementById('kernel-panic-screen');
        if (kpScreen) kpScreen.innerHTML = '';
      }, 8000);

      // T+11s: The Watcher
      setTimeout(() => {
        let kpScreen = document.getElementById('kernel-panic-screen');
        if (kpScreen) {
          kpScreen.innerHTML = `
            <img src="https://media1.tenor.com/m/qRqHd7j3kkYAAAAC/look-at-us-eye.gif" style="width:400px; height:400px; object-fit:cover; opacity:0; animation: fadeIn 3s forwards; filter: grayscale(100%) contrast(200%) sepia(100%) hue-rotate(-50deg) saturate(500%);" onerror="this.style.display='none'" />
            <div id="aftermath-text" style="margin-top: 2rem; font-size: 2rem; color: #cc0000; letter-spacing: 0.5rem; text-shadow: 0 0 10px #cc0000; height: 3rem;"></div>
          `;
          
          if (audioCtx) {
            let droneOsc = audioCtx.createOscillator();
            let droneGain = audioCtx.createGain();
            droneOsc.type = 'sawtooth';
            droneOsc.frequency.value = 40;
            droneGain.gain.setValueAtTime(0, audioCtx.currentTime);
            droneGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 5);
            droneOsc.connect(droneGain);
            droneGain.connect(audioCtx.destination);
            droneOsc.start();
          }
        }
      }, 11000);

      // T+14s: The Message — cursed zalgo text
      setTimeout(() => {
        let textEl = document.getElementById('aftermath-text');
        if (textEl) {
          let msg = "T̷̡H̸̢E̶̛ ̵̧A̷̛R̸̢C̶̡H̵̛I̸̧T̷̢E̶̡C̵̛Ţ̸ ̷̢I̶̡S̵̛ ̸̧H̷̢E̶̡R̵̛Ȩ̸";
          let i = 0;
          let chars = Array.from(msg);
          let typeInterval = setInterval(() => {
            if (i < chars.length) {
              textEl.innerHTML += chars[i];
              i++;
            } else {
              clearInterval(typeInterval);
            }
          }, 80);
        }
      }, 14000);

      // T+18s: The Final Stand — functional terminal with reboot support
      setTimeout(() => {
        let kpScreen = document.getElementById('kernel-panic-screen');
        if (kpScreen) {
          let bar = document.createElement('div');
          bar.className = 'terminal-bar';
          bar.style.position = 'absolute';
          bar.style.bottom = '0';
          bar.style.width = '100%';
          bar.style.zIndex = '9999999';
          bar.style.animation = 'glitch-anim 0.2s infinite linear alternate-reverse';
          bar.style.background = '#0a0000';
          bar.style.borderTop = '2px solid #cc0000';
          bar.innerHTML = 
            '<span class="prompt-user" style="color:#cc3333; font-weight:bold;">root</span>' +
            '<span class="prompt-host" style="color:#c8c8c8">@</span>' +
            '<span class="prompt-host">places</span>' +
            '<span style="color:#c8c8c8">:</span>' +
            '<span class="prompt-path">~/void</span>' +
            '<span class="prompt-dollar">$ </span>' +
            '<input type="text" id="terminal-input" placeholder="type help for commands" autocomplete="off" spellcheck="false" style="color:#ff5555; background:transparent; border:none; outline:none; font-family:Share Tech Mono, monospace; font-size:1rem; flex:1; caret-color: #ff5555;" />' +
            '<span class="help-hint" style="color:#cc0000; font-weight:bold;">SYSTEM HALTED — EXECUTE \'cure\' UTILITY TO REPAIR OR \'reboot\' TO OVERRIDE</span>';
          
          kpScreen.appendChild(bar);
          
          let input = document.getElementById('terminal-input');
          input.focus();
          
          input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
              let cmd = input.value.trim().toLowerCase();
              
              if (cmd === 'reboot' || cmd === 'restart') {
                // Reboot works! Reload the page — infection persists
                input.value = '';
                input.placeholder = 'r̷e̵b̶o̷o̵t̶i̷n̵g̶.̷.̵.̶';
                input.disabled = true;
                setTimeout(function() {
                  window.location.href = window.location.pathname + 
                    (window.location.protocol === 'file:' ? 
                      '?auth=root&infected=true&nightmare=true&puzzle=' + 
                      encodeURIComponent(localStorage.getItem('virusPuzzle') || 'none') : '');
                }, 1000);
              } else {
                input.value = '';
                input.placeholder = '[Ä̵C̸̈C̷̑E̶̔S̵̛S̸̈ ̷̎D̶̑E̵̔N̷̛Ï̸E̵̎D̶̑]';
                try {
                  let errorOsc = audioCtx.createOscillator();
                  errorOsc.type = 'sawtooth';
                  errorOsc.frequency.setValueAtTime(100 + Math.random()*200, audioCtx.currentTime);
                  errorOsc.connect(audioCtx.destination);
                  errorOsc.start();
                  errorOsc.stop(audioCtx.currentTime + 0.2);
                } catch(err){}
                document.body.style.transform = 'translate(' + (Math.random()*20 - 10) + 'px, ' + (Math.random()*20 - 10) + 'px)';
                setTimeout(() => document.body.style.transform = 'none', 100);
              }
            }
          });
        }
      }, 18000);

    }, 2000); // Eye phase lasts only 2 seconds
  };

  // --- Zalgo text generator for infected pages ---
  window.zalgoify = function(text, intensity) {
    intensity = intensity || 1;
    var zalgoUp = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030a', '\u0342', '\u0343', '\u0344', '\u034a', '\u034b', '\u034c', '\u0303', '\u0302', '\u030c', '\u0350', '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313', '\u0314', '\u033d', '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b', '\u036c', '\u036d', '\u036e', '\u036f'];
    var zalgoDown = ['\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e', '\u031f', '\u0320', '\u0324', '\u0325', '\u0326', '\u0329', '\u032a', '\u032b', '\u032c', '\u032d', '\u032e', '\u032f', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0347', '\u0348', '\u0349'];
    var zalgoMid = ['\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322', '\u0327', '\u0328', '\u0334', '\u0335', '\u0336', '\u034f', '\u035c', '\u035d', '\u035e', '\u035f', '\u0360', '\u0362', '\u0338', '\u0337'];
    
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
  };

  // --- Infected admin page: spawn eye popups that obscure content ---
  window.spawnInfectedEyes = function() {
    let eyeCount = 0;
    let spawnDelay = 5000 + Math.random() * 5000; // First eye after 5-10s
    
    function spawnEye() {
      let win = document.createElement('div');
      win.className = 'virus-eye-popup';
      win.style.cssText = 'position:fixed; width:250px; height:250px; z-index:' + (20000 + eyeCount) + 
        '; border:2px solid #cc0000; background:#000; box-shadow:0 0 30px #cc0000; pointer-events:none;' +
        ' left:' + (Math.random() * (window.innerWidth - 250)) + 'px;' +
        ' top:' + (Math.random() * (window.innerHeight - 250)) + 'px;' +
        ' animation: fadeIn 1s forwards; user-select: none;';
      
      win.innerHTML = '<img src="https://media1.tenor.com/m/qRqHd7j3kkYAAAAC/look-at-us-eye.gif" style="width:100%; height:100%; object-fit:cover; pointer-events:none;" onerror="this.style.display=\'none\'" />';
      document.body.appendChild(win);
      eyeCount++;
      
      // Keep spawning faster and faster until the page is unreadable
      if (eyeCount < 30) {
        let nextDelay = Math.max(500, 3000 - eyeCount * 200);
        setTimeout(spawnEye, nextDelay);
      }
    }
    
    setTimeout(spawnEye, spawnDelay);
  };
})();
