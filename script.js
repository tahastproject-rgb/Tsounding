let tanks = {};
let activeTank = 'Tangki 1';

document.addEventListener('DOMContentLoaded', () => {
    loadTanks();
    
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    const isDataPage = window.location.pathname.endsWith('data.html');
    const isManualPage = window.location.pathname.endsWith('manual_calculator.html');

    if (isIndexPage) {
        renderTanks();
        renderMainTable();
    } else if (isDataPage) {
        renderTanks();
        renderPreviewTable();
    }
});

function loadTanks() {
    const storedTanks = localStorage.getItem('soundingAppTanks');
    if (storedTanks) {
        tanks = JSON.parse(storedTanks);
        activeTank = localStorage.getItem('activeTank') || Object.keys(tanks)[0] || 'Tangki 1';
    } else {
        const initialTanks = {
            'Tangki 1': {
                headers: ['Sounding (m)', 'Volume (m³)'],
                data: [['0', '0'], ['1', '50'], ['2', '120']]
            }
        };
        tanks = initialTanks;
        saveTanks();
    }
}

function saveTanks() {
    localStorage.setItem('soundingAppTanks', JSON.stringify(tanks));
    localStorage.setItem('activeTank', activeTank);
}

function renderTanks() {
    const tankList = document.getElementById('tank-list');
    if (!tankList) return;
    tankList.innerHTML = '';
    
    for (const tankName in tanks) {
        const li = document.createElement('li');
        li.textContent = tankName;
        li.dataset.tankName = tankName;
        li.onclick = () => selectTank(tankName);
        if (tankName === activeTank) {
            li.classList.add('active');
        }
        tankList.appendChild(li);
    }
}

function selectTank(tankName) {
    activeTank = tankName;
    saveTanks();
    renderTanks();
    if (window.location.pathname.endsWith('data.html')) {
        renderPreviewTable();
    } else if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        renderMainTable();
    }
}

function addTank() {
    const newTankName = prompt("Masukkan nama tangki baru:");
    if (newTankName && !tanks[newTankName]) {
        tanks[newTankName] = { headers: ['Sounding (m)', 'Volume (m³)'], data: [] };
        activeTank = newTankName;
        saveTanks();
        renderTanks();
        renderPreviewTable();
    } else if (newTankName) {
        alert("Nama tangki sudah ada.");
    }
}

function renameTank() {
    const oldName = activeTank;
    const newName = prompt(`Ubah nama tangki '${oldName}' menjadi:`);
    if (newName && newName !== oldName) {
        tanks[newName] = tanks[oldName];
        delete tanks[oldName];
        activeTank = newName;
        saveTanks();
        renderTanks();
        renderPreviewTable();
    }
}

function createTable() {
    const tableEl = document.getElementById('sounding-table-preview');
    const colCount = parseInt(document.getElementById('col-count').value);
    
    if (isNaN(colCount) || colCount < 2) {
        alert("Jumlah kolom harus angka dan minimal 2.");
        return;
    }
    
    let newHeaders = [];
    for (let i = 0; i < colCount; i++) {
        const headerName = prompt(`Masukkan nama untuk kolom ${i + 1}:`);
        if (headerName) {
            newHeaders.push(headerName);
        } else {
            alert("Nama header tidak boleh kosong.");
            return;
        }
    }
    
    tanks[activeTank].headers = newHeaders;
    tanks[activeTank].data = [];
    saveTanks();
    renderPreviewTable();
}

function createTableManual() {
    const headerInput = prompt("Masukkan nama header, dipisahkan dengan koma (contoh: Sounding (m),Volume (m³)):");
    if (!headerInput) return;
    const newHeaders = headerInput.split(',').map(h => h.trim());
    
    if (newHeaders.length < 2) {
        alert("Tabel harus memiliki minimal 2 header.");
        return;
    }

    const dataInput = prompt("Masukkan data, pisahkan setiap baris dengan baris baru dan setiap sel dengan koma:");
    let newData = [];
    if (dataInput) {
        newData = dataInput.trim().split('\n').map(row => row.split(',').map(cell => cell.trim()));
        
        // Cek konsistensi jumlah kolom
        for (const row of newData) {
            if (row.length !== newHeaders.length) {
                alert("Jumlah kolom data tidak konsisten dengan jumlah header. Operasi dibatalkan.");
                return;
            }
        }
    }

    tanks[activeTank].headers = newHeaders;
    tanks[activeTank].data = newData;
    saveTanks();
    renderPreviewTable();
}

function addRow() {
    if (!tanks[activeTank]) return;
    const rowData = new Array(tanks[activeTank].headers.length).fill('');
    tanks[activeTank].data.push(rowData);
    saveTanks();
    renderPreviewTable();
}

function deleteRow(rowIndex) {
    if (!tanks[activeTank]) return;
    tanks[activeTank].data.splice(rowIndex, 1);
    saveTanks();
    renderPreviewTable();
}

function deleteAllRows() {
    if (!tanks[activeTank]) {
        return;
    }
    
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus semua baris data dari tangki ini? Tindakan ini tidak bisa dibatalkan.");
    
    if (confirmDelete) {
        tanks[activeTank].data = [];
        saveTanks();
        
        if (document.getElementById('sounding-table-preview')) {
            renderPreviewTable();
        } else if (document.getElementById('sounding-table')) {
            renderMainTable();
        }
        
        alert("Semua baris telah berhasil dihapus.");
    }
}

// Fungsi baru untuk mengedit header
function editHeader(colIndex) {
    const newName = prompt("Masukkan nama baru untuk header:");
    if (newName) {
        tanks[activeTank].headers[colIndex] = newName;
        saveTanks();
        renderPreviewTable();
    }
}

// Fungsi baru untuk menghapus header (dan kolom)
function deleteHeader(colIndex) {
    if (tanks[activeTank].headers.length <= 2) {
        alert("Tabel harus memiliki minimal 2 header.");
        return;
    }
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus kolom ini?");
    if (confirmDelete) {
        // Hapus header dari array
        tanks[activeTank].headers.splice(colIndex, 1);

        // Hapus kolom dari setiap baris data
        tanks[activeTank].data = tanks[activeTank].data.map(row => {
            const newRow = [...row];
            newRow.splice(colIndex, 1);
            return newRow;
        });

        saveTanks();
        renderPreviewTable();
    }
}

function renderPreviewTable() {
    const tableEl = document.getElementById('sounding-table-preview');
    if (!tableEl || !tanks[activeTank]) return;
    
    const headers = tanks[activeTank].headers;
    const data = tanks[activeTank].data;
    
    let tableHTML = '<thead><tr>';
    headers.forEach((header, index) => {
        tableHTML += `<th>
                        <span>${header}</span>
                        <button class="header-btn" onclick="editHeader(${index})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.146 9.146a.5.5 0 0 0-.146.353v3.293a.5.5 0 0 0 .5.5h3.293a.5.5 0 0 0 .353-.146l6.647-6.647z"/>
                            </svg>
                        </button>
                        <button class="header-btn delete-header-btn" onclick="deleteHeader(${index})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                            </svg>
                        </button>
                      </th>`;
    });
    tableHTML += '<th></th></tr></thead><tbody>';

    data.forEach((row, rowIndex) => {
        tableHTML += '<tr>';
        row.forEach((cellData, colIndex) => {
            tableHTML += `<td contenteditable="true" onblur="updateCell(this, ${rowIndex}, ${colIndex})">${cellData}</td>`;
        });
        tableHTML += `<td><button class="delete-row-btn" onclick="deleteRow(${rowIndex})">x</button></td>`;
        tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody>';
    tableEl.innerHTML = tableHTML;
}

function renderMainTable() {
    const tableEl = document.getElementById('sounding-table');
    if (!tableEl || !tanks[activeTank]) return;

    const headers = tanks[activeTank].headers;
    const data = tanks[activeTank].data;

    let tableHTML = '<thead><tr>';
    headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    data.forEach(row => {
        tableHTML += '<tr>';
        row.forEach(cellData => {
            tableHTML += `<td>${cellData}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody>';
    tableEl.innerHTML = tableHTML;
}

function updateCell(el, rowIndex, colIndex) {
    const newValue = el.textContent;
    tanks[activeTank].data[rowIndex][colIndex] = newValue;
    saveTanks();
}

function interpolate(x, data) {
    data.sort((a, b) => a[0] - b[0]);
    
    if (x < data[0][0]) {
        // Ekstrapolasi bawah
        const [x1, y1] = data[0];
        const [x2, y2] = data[1];
        const slope = (y2 - y1) / (x2 - x1);
        return y1 + slope * (x - x1);
    }
    
    if (x > data[data.length - 1][0]) {
        // Ekstrapolasi atas
        const [x1, y1] = data[data.length - 2];
        const [x2, y2] = data[data.length - 1];
        const slope = (y2 - y1) / (x2 - x1);
        return y2 + slope * (x - x2);
    }
    
    for (let i = 0; i < data.length - 1; i++) {
        const [x1, y1] = data[i];
        const [x2, y2] = data[i + 1];
        if (x >= x1 && x <= x2) {
            const calculatedVolume = y1 + (x - x1) * ((y2 - y1) / (x2 - x1));
            return calculatedVolume;
        }
    }
    return null;
}

function calculateAutomatic() {
    const calcSounding = parseFloat(document.getElementById('calc-sounding').value);
    const resultEl = document.getElementById('result-auto');
    if (isNaN(calcSounding) || !tanks[activeTank] || tanks[activeTank].data.length < 2) {
        resultEl.textContent = "Pastikan input diisi dengan angka dan tabel memiliki minimal 2 baris data.";
        resultEl.style.color = 'red';
        return;
    }
    const currentData = tanks[activeTank].data;
    const data = currentData.map(row => [parseFloat(row[0]), parseFloat(row[1])]);
    if (data.length < 2) {
        resultEl.textContent = "Harus ada minimal 2 baris data untuk perhitungan.";
        resultEl.style.color = 'red';
        return;
    }
    const calculatedVolume = interpolate(calcSounding, data);
    resultEl.textContent = `Volume yang dihitung: ${calculatedVolume.toFixed(2)}`;
    resultEl.style.color = '#4a90e2';
}

function calculateManual() {
    const tinggi1 = parseFloat(document.getElementById('manual-tinggi1').value);
    const volume1 = parseFloat(document.getElementById('manual-volume1').value);
    const tinggi2 = parseFloat(document.getElementById('manual-tinggi2').value);
    const volume2 = parseFloat(document.getElementById('manual-volume2').value);
    const tinggiNew = parseFloat(document.getElementById('manual-tinggi-new').value);
    const resultEl = document.getElementById('result-manual');
    
    if (isNaN(tinggi1) || isNaN(volume1) || isNaN(tinggi2) || isNaN(volume2) || isNaN(tinggiNew)) {
        resultEl.textContent = "Pastikan semua input terisi dengan angka.";
        resultEl.style.color = 'red';
        return;
    }

    const calculatedVolume = volume1 + (tinggiNew - tinggi1) * ((volume2 - volume1) / (tinggi2 - tinggi1));
    
    resultEl.textContent = `Volume yang dihitung: ${calculatedVolume.toFixed(2)}`;
    resultEl.style.color = '#4a90e2';
}

function exportData() {
    const exportFormat = document.getElementById('export-format').value;
    const currentData = tanks[activeTank].data;
    const headers = tanks[activeTank].headers;
    
    let fileContent;
    let fileName;
    
    if (exportFormat === 'csv-comma' || exportFormat === 'csv-semicolon') {
        const separator = exportFormat === 'csv-comma' ? ',' : ';';
        const headerRow = headers.join(separator);
        const dataRows = currentData.map(row => row.join(separator)).join('\n');
        fileContent = headerRow + '\n' + dataRows;
        fileName = `${activeTank}.csv`;
    } else if (exportFormat === 'json') {
        const dataObject = {
            headers: headers,
            data: currentData
        };
        fileContent = JSON.stringify(dataObject, null, 2);
        fileName = `${activeTank}.json`;
    } else {
        return;
    }
    
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    if (!file) {
        alert("Silakan pilih file untuk diimpor.");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        let importedData;
        let importedHeaders;
        
        if (fileExtension === 'csv') {
            const separator = content.includes(';') ? ';' : ',';
            const lines = content.trim().split('\n');
            importedHeaders = lines[0].split(separator);
            importedData = lines.slice(1).map(line => line.split(separator));
        } else if (fileExtension === 'json') {
            try {
                const dataObject = JSON.parse(content);
                importedHeaders = dataObject.headers;
                importedData = dataObject.data;
            } catch (err) {
                alert("File JSON tidak valid.");
                return;
            }
        } else if (fileExtension === 'xlsx') {
            try {
                const workbook = XLSX.read(content, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (jsonData.length > 0) {
                    importedHeaders = jsonData[0].map(h => h ? String(h).trim() : '');
                    importedData = jsonData.slice(1).map(row => row.map(cell => cell ? String(cell).trim() : ''));
                } else {
                    alert("File XLSX kosong atau tidak dapat dibaca.");
                    return;
                }
            } catch (err) {
                console.error(err);
                alert("Terjadi kesalahan saat membaca file XLSX. Pastikan formatnya benar.");
                return;
            }
        } else {
            alert("Format file tidak didukung. Silakan gunakan .csv, .json, atau .xlsx.");
            return;
        }
        
        tanks[activeTank].headers = importedHeaders;
        tanks[activeTank].data = importedData;
        saveTanks();
        
        if (document.getElementById('sounding-table-preview')) {
            renderPreviewTable();
        } else {
            renderMainTable();
        }
        
        alert("Data berhasil diimpor!");
    };
    
    if (file.name.endsWith('.xlsx')) {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file);
    }
}

// ====== Export all tanks ======
function exportAllJSON(){
    const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        tanks: tanks
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 't-sounding_all_tanks.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

function exportAllXLSX(){
    if (typeof XLSX === 'undefined'){
        alert('Library XLSX tidak tersedia.');
        return;
    }
    const wb = XLSX.utils.book_new();
    Object.keys(tanks).forEach(name => {
        const t = tanks[name];
        const rows = [t.headers, ...t.data];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        // Autosize columns (basic)
        const colWidths = t.headers.map((h,i)=>{
            let maxLen = String(h||'').length;
            t.data.forEach(r=>{ const v = r[i]!=null ? String(r[i]) : ''; if (v.length>maxLen) maxLen=v.length; });
            return {wch: Math.min(Math.max(8, maxLen+2), 40)};
        });
        ws['!cols'] = colWidths;
        // Sanitize sheet name
        const sheetName = name.replace(/[\[\]\*\/\\\?\:]/g,'').slice(0,31) || 'Sheet';
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    XLSX.writeFile(wb, 't-sounding_all_tanks.xlsx');
}


function exportAllData(){
    const fmtSel = document.getElementById('export-all-format');
    const fmt = fmtSel ? fmtSel.value : 'xlsx';
    const dateStr = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    if (fmt === 'json'){
        const obj = { tanks };
        const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tsounding-all-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
    }
    // default XLSX multi-sheet
    if (typeof XLSX === 'undefined'){
        alert('SheetJS (XLSX) tidak tersedia.');
        return;
    }
    const wb = XLSX.utils.book_new();
    Object.keys(tanks).forEach(tankName => {
        const t = tanks[tankName];
        const aoa = [];
        if (Array.isArray(t.headers) && t.headers.length){
            aoa.push(t.headers.slice());
        }
        if (Array.isArray(t.data)){
            t.data.forEach(row => aoa.push(row.slice()));
        }
        if (aoa.length === 0){
            aoa.push(['(kosong)']);
        }
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        // Simpan mapping dan pengaturan di metadata sheet (sel A1 note-like)
        const meta = [
            `Mapping: X=${t.colX ?? 0}, Y=${t.colY ?? 1}`,
            `Units: ${t.unitX ?? ''} ; ${t.unitY ?? ''}`,
            `Decimals: ${t.decimals ?? 2}`
        ].join(' | ');
        ws['!cols'] = (t.headers||[]).map(()=>({wch:18}));
        // Put meta in a hidden row at the end
        const lastRow = aoa.length + 2;
        ws[`A${lastRow}`] = {t:'s', v: meta};
        XLSX.utils.book_append_sheet(wb, ws, tankName.substring(0,31));
    });
    const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
    const blob = new Blob([wbout], {type:'application/octet-stream'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tsounding-all-${dateStr}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


function importAllFromXLSX(){
    const input = document.getElementById('import-all-xlsx');
    const file = input.files && input.files[0];
    if (!file){
        alert('Pilih file XLSX multi-sheet terlebih dahulu.');
        return;
    }
    if (typeof XLSX === 'undefined'){
        alert('SheetJS tidak tersedia.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e){
        try{
            const wb = XLSX.read(e.target.result, {type:'array'});
            // Read meta sheet if present
            const meta = {};
            if (wb.SheetNames.includes('meta')){
                const json = XLSX.utils.sheet_to_json(wb.Sheets['meta'], {header:1});
                // Expect header: Tank, colX, colY, unitX, unitY, decimals
                for (let i=1;i<json.length;i++){
                    const r = json[i] || [];
                    const name = String(r[0] ?? '').trim();
                    if (!name) continue;
                    meta[name] = {
                        colX: Number.isFinite(parseInt(r[1])) ? parseInt(r[1]) : 0,
                        colY: Number.isFinite(parseInt(r[2])) ? parseInt(r[2]) : 1,
                        unitX: r[3] ?? 'm',
                        unitY: r[4] ?? 'm³',
                        decimals: Number.isFinite(parseInt(r[5])) ? parseInt(r[5]) : 2
                    };
                }
            }
            // For each sheet except 'meta', treat as a tank
            let importedCount = 0;
            for (const sheetName of wb.SheetNames){
                if (sheetName === 'meta') continue;
                const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {header:1});
                if (!aoa || aoa.length === 0) continue;
                const headers = (aoa[0] || []).map(v => (v!=null? String(v).trim() : ''));
                const rows = aoa.slice(1).map(r => {
                    const arr = [];
                    for (let i=0;i<headers.length;i++){
                        const v = r[i];
                        arr.push(v!=null? String(v).trim() : '');
                    }
                    return arr;
                });
                const name = sheetName;
                const metaRow = meta[name] || {};
                const payload = {
                    headers,
                    data: rows,
                    colX: Math.min(metaRow.colX ?? 0, Math.max(headers.length-1,0)),
                    colY: Math.min(metaRow.colY ?? 1, Math.max(headers.length-1,0)),
                    unitX: metaRow.unitX ?? 'm',
                    unitY: metaRow.unitY ?? 'm³',
                    decimals: metaRow.decimals ?? 2
                };
                if (tanks[name]){
                    const overwrite = confirm(`Tangki "${name}" sudah ada. Timpa datanya? (OK = Timpa, Cancel = Lewati)`);
                    if (!overwrite) continue;
                }
                tanks[name] = payload;
                importedCount++;
            }
            if (importedCount === 0){
                alert('Tidak ada sheet data yang diimpor.');
                return;
            }
            // Set activeTank ke salah satu (sheet pertama non-meta) bila perlu
            const firstNonMeta = wb.SheetNames.find(n => n !== 'meta');
            if (firstNonMeta) activeTank = firstNonMeta;
            saveTanks();
            if (document.getElementById('sounding-table-preview')){
                renderTanks();
                renderPreviewTable();
                renderColumnMappings();
                renderUnitsAndFormat();
            }else{
                renderTanks();
                renderMainTable();
                renderMappingHint();
            }
            alert(`Berhasil impor ${importedCount} tangki dari XLSX.`);
        }catch(err){
            console.error(err);
            alert('Gagal membaca file XLSX. Pastikan format benar.');
        }
    };
    reader.readAsArrayBuffer(file);
}


// ===== Dropdown helpers =====
function closeAllDropdowns(){
  document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
}
function toggleDropdown(id){
  const el = document.getElementById(id);
  const isOpen = el && el.classList.contains('open');
  closeAllDropdowns();
  if (el && !isOpen) el.classList.add('open');
}
document.addEventListener('click', (e)=>{
  const dd = e.target.closest && e.target.closest('.dropdown');
  if (!dd) closeAllDropdowns();
});

// ===== Ekspor Tabel Aktif via dropdown =====
function exportDataAs(fmt){
  try{
    let sel = document.getElementById('export-format');
    if (!sel){
      sel = document.createElement('select');
      sel.id = 'export-format';
      sel.style.display = 'none';
      document.body.appendChild(sel);
    }
    sel.innerHTML = '<option value="csv-comma">csv-comma</option><option value="csv-semicolon">csv-semicolon</option><option value="json">json</option>';
    sel.value = fmt;
    exportData();
  } finally {
    closeAllDropdowns();
  }
}

// ===== Ekspor Semua Tangki via dropdown =====
function exportAllAs(fmt){
  try{
    let sel = document.getElementById('export-all-format');
    if (!sel){
      sel = document.createElement('select');
      sel.id = 'export-all-format';
      sel.style.display = 'none';
      document.body.appendChild(sel);
    }
    sel.innerHTML = '<option value="xlsx">xlsx</option><option value="json">json</option>';
    sel.value = fmt;
    exportAllData();
  } finally {
    closeAllDropdowns();
  }
}

// ===== Impor Tabel Aktif langsung dari file terpilih =====
function importDataDirect(file){
  if (!file) return;
  const dummy = document.createElement('input');
  dummy.type = 'file';
  const dt = new DataTransfer();
  dt.items.add(file);
  dummy.files = dt.files;
  dummy.id = 'import-file';
  document.body.appendChild(dummy);
  importData();
  document.body.removeChild(dummy);
}

// ===== ADD-ON: Hapus Tangki Aktif (robust, add-only) =====
function deleteTank(){
  try{
    if (typeof tanks !== 'object' || !tanks){ alert('Data tangki tidak ditemukan.'); return; }
    var names = Object.keys(tanks);
    if (names.length <= 1){ alert('Minimal harus ada 1 tangki. Tidak bisa menghapus jika hanya satu.'); return; }
    var target = (typeof activeTank === 'string' && tanks[activeTank]) ? activeTank : names[0];
    if (!confirm('Hapus tangki "' + target + '" beserta seluruh datanya?')) return;
    delete tanks[target];
    var remaining = Object.keys(tanks);
    if (!remaining.length){
      tanks['Tangki 1'] = { headers: ['Sounding (m)', 'Volume (m³)'], data: [] };
      activeTank = 'Tangki 1';
    } else {
      activeTank = remaining[0];
    }
    if (typeof saveTanks === 'function') saveTanks(); else localStorage.setItem('soundingAppTanks', JSON.stringify(tanks));
    if (typeof renderTanks === 'function') renderTanks();
    if (document.getElementById('sounding-table-preview')){
      if (typeof renderPreviewTable === 'function') renderPreviewTable();
    } else if (document.getElementById('sounding-table')){
      if (typeof renderMainTable === 'function') renderMainTable();
    }
    alert('Tangki berhasil dihapus.');
  }catch(e){ console.error(e); alert('Gagal menghapus tangki: ' + e.message); }
}

// ===== ADD-ON: Impor Semua dari JSON (add-only) =====
function importAllFromJSON(){
  var input = document.getElementById('import-all-json');
  var file = input && input.files && input.files[0];
  if (!file){ alert('Pilih file JSON terlebih dahulu.'); return; }
  var reader = new FileReader();
  reader.onload = function(e){
    try{
      var obj = JSON.parse(e.target.result);
      var importedTanks = obj.tanks ? obj.tanks : obj;
      if (!importedTanks || typeof importedTanks !== 'object'){
        alert('Format JSON tidak valid. Diharapkan { "tanks": { ... } } atau objek tangki langsung.');
        return;
      }
      var importedCount = 0;
      for (var name in importedTanks){
        if (!importedTanks.hasOwnProperty(name)) continue;
        if (tanks[name]){
          var overwrite = confirm('Tangki "'+name+'" sudah ada. Timpa datanya?');
          if (!overwrite) continue;
        }
        tanks[name] = importedTanks[name];
        importedCount++;
      }
      if (importedCount === 0){ alert('Tidak ada tangki yang diimpor.'); return; }
      activeTank = Object.keys(tanks)[0];
      if (typeof saveTanks === 'function') saveTanks(); else localStorage.setItem('soundingAppTanks', JSON.stringify(tanks));
      if (typeof renderTanks === 'function') renderTanks();
      if (document.getElementById('sounding-table-preview')){
        if (typeof renderPreviewTable === 'function') renderPreviewTable();
      } else if (document.getElementById('sounding-table')){
        if (typeof renderMainTable === 'function') renderMainTable();
      }
      alert('Berhasil impor '+importedCount+' tangki dari JSON.');
    }catch(err){ console.error(err); alert('Gagal membaca file JSON: ' + err.message); }
  };
  reader.readAsText(file);
}

// ===== ADD-ON: Stubs preview safety =====
if (typeof renderColumnMappings !== 'function') { function renderColumnMappings(){} }
if (typeof renderUnitsAndFormat !== 'function') { function renderUnitsAndFormat(){} }
if (typeof renderMappingHint !== 'function') { function renderMappingHint(){} }

// ===== ADD-ON: Bind delete button click (avoid form submit) =====
try{
  window.addEventListener('load', function(){
    var del = document.querySelector('button[onclick="deleteTank()"]');
    if (del){ del.type = 'button'; del.addEventListener('click', function(ev){ ev.preventDefault(); }); }
  });
}catch(e){}
