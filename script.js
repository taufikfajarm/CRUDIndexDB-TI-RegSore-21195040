

let db;
const request = indexedDB.open("MahasiswaDB", 1);

request.onupgradeneeded = function() {
  db = request.result;
  if (!db.objectStoreNames.contains('mahasiswa')) {
    db.createObjectStore('mahasiswa', { keyPath: 'id', autoIncrement: true });
  }
};

request.onsuccess = function() {
  db = request.result;
  tampilkanData();
};

request.onerror = function() {
  console.log("Database gagal dibuka");
};

document.getElementById('data-form').addEventListener('submit', function(e) {
  e.preventDefault();
  tambahData({
    nama: document.getElementById('nama').value,
    nim: document.getElementById('nim').value
  });
  this.reset();
});

document.getElementById('edit-form').addEventListener('submit', function(e) {
  e.preventDefault();
  editData({
    id: parseInt(document.getElementById('edit-id').value),
    nama: document.getElementById('edit-nama').value,
    nim: document.getElementById('edit-nim').value
  });
});

function tambahData(data) {
  const tx = db.transaction('mahasiswa', 'readwrite');
  const store = tx.objectStore('mahasiswa');
  store.add(data);
  tx.oncomplete = function() {
    tampilkanData();
  };
}

function tampilkanData() {
  const tx = db.transaction('mahasiswa', 'readonly');
  const store = tx.objectStore('mahasiswa');
  const req = store.openCursor();
  const allData = [];

  req.onsuccess = function() {
    const cursor = req.result;
    if(cursor) {
      allData.push(cursor.value);
      cursor.continue();
    } else {
      let tableBody = '';
      allData.forEach(function(data, index) {
        tableBody += `
          <tr>
            <td>${data.nama}</td>
            <td>${data.nim}</td>
            <td>
              <button onclick="openModal(${data.id})" class="btn btn-warning" ><i class="bi bi-pencil-square"></i> Edit</button>
              <button onclick="hapusData(${data.id})" class="btn btn-danger"><i class="bi bi-trash"></i> Hapus</button>
            </td>
          </tr>
        `;
      });
      document.getElementById('data-table').getElementsByTagName('tbody')[0].innerHTML = tableBody;
    }
  };
}

function openModal(id) {
  const tx = db.transaction('mahasiswa', 'readonly');
  const store = tx.objectStore('mahasiswa');
  const req = store.get(id);
  req.onsuccess = function() {
    const data = req.result;
    document.getElementById('edit-id').value = data.id;
    document.getElementById('edit-nama').value = data.nama;
    document.getElementById('edit-nim').value = data.nim;
    $('#edit-modal').modal('show');
  };
}

function editData(data) {
  const tx = db.transaction('mahasiswa', 'readwrite');
  const store = tx.objectStore('mahasiswa');
  store.put(data);
  tx.oncomplete = function() {
    $('#edit-modal').modal('hide');
    tampilkanData();
  };
}

function hapusData(id) {
  const tx = db.transaction('mahasiswa', 'readwrite');
  const store = tx.objectStore('mahasiswa');
  store.delete(id);
  tx.oncomplete = function() {
    tampilkanData();
  };
}
