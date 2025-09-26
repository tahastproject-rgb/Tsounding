// ===== ADD-ON HELPERS (add-only) =====
(function(){
  function log(m){ try{ console.log('[addons]', m); }catch(e){} }
  function ensureDeleteButton(){
    try{
      var btn = document.querySelector('button[onclick="deleteTank()"]');
      var container = document.querySelector('.tank-buttons');
      if (!btn && container){
        btn = document.createElement('button');
        btn.textContent = 'Hapus Tangki Aktif';
        btn.type = 'button';
        btn.setAttribute('data-from-addons','1');
        container.appendChild(btn);
      }
      if (btn && !btn.__addonsBound){
        btn.type = 'button';
        btn.addEventListener('click', function(ev){
          ev.preventDefault(); ev.stopPropagation();
          if (typeof window.deleteTank === 'function'){ window.deleteTank(); }
          else alert('Fungsi deleteTank() tidak tersedia.');
        });
        btn.__addonsBound = true;
      }
    }catch(e){ log(e); }
  }
  function ensureResetInsideImportGroup(){
    try{
      var resetBtn = document.querySelector('button[onclick="resetToSeed()"]');
      var importGroup = document.getElementById('dd-import-all');
      if (!resetBtn || !importGroup) return;
      var fileControls = importGroup.closest('.file-controls') || importGroup.parentElement;
      if (!fileControls) return;
      var holder = document.getElementById('addons-reset-holder');
      if (!holder){
        holder = document.createElement('div');
        holder.id = 'addons-reset-holder';
        holder.style.marginTop = '10px';
        fileControls.appendChild(holder);
      }
      if (resetBtn.parentElement !== holder){
        holder.innerHTML = '<h3 style="margin:8px 0">Pemulihan Data</h3>';
        resetBtn.textContent = '🔄 Reset ke Data Awal';
        holder.appendChild(resetBtn);
      }
    }catch(e){ log(e); }
  }
  function movePreviewBelowTableControls(){
    try{
      var tableControls = document.querySelector('.table-controls');
      var preview = document.getElementById('sounding-table-preview');
      if (!tableControls || !preview) return;
      var section = preview.closest('.table-container') || preview.parentElement || preview;
      var title = null;
      var nodes = (section.querySelectorAll? section.querySelectorAll('h1,h2,h3,h4,label,span,p,div') : []);
      for (var i=0;i<nodes.length;i++){
        var t = (nodes[i].innerText||'').trim().toLowerCase();
        if (t.indexOf('pratinjau tabel') !== -1){ title = nodes[i]; break; }
      }
      if (tableControls.parentElement){
        if (title && title !== section){
          tableControls.parentElement.insertBefore(title, tableControls.nextSibling);
          tableControls.parentElement.insertBefore(section, title.nextSibling);
        } else {
          var newTitle = document.createElement('h3');
          newTitle.textContent = 'Pratinjau Tabel';
          tableControls.parentElement.insertBefore(newTitle, tableControls.nextSibling);
          tableControls.parentElement.insertBefore(section, newTitle.nextSibling);
        }
      }
    }catch(e){ log(e); }
  }
  function hideSeedWarning(){
    try{
      var ps = Array.from(document.querySelectorAll('.file-controls p, p, .file-controls .note'));
      ps.forEach(function(p){
        var txt = (p.textContent||'').trim();
        if (!txt) return;
        if (txt.indexOf('Balikkan semua tangki ke data bawaan (seed).') !== -1 ||
            txt.indexOf('Tindakan ini akan menimpa data saat ini.') !== -1){
          p.remove();
        }
      });
    }catch(e){ log(e); }
  }
  function tick(){
    ensureDeleteButton();
    ensureResetInsideImportGroup();
    movePreviewBelowTableControls();
    hideSeedWarning();
  }
  window.addEventListener('load', function(){
    tick();
    try{
      var mo = new MutationObserver(function(){ tick(); });
      mo.observe(document.body, {childList:true, subtree:true});
    }catch(e){}
  });
})();
// ===== END ADD-ON HELPERS =====
