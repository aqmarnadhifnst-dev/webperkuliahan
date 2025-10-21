// Contoh data dalam format JSON
const jsonData = [
    {
        "id": 1,
        "nama": "Budi Santoso",
        "nim": "12345678",
        "jurusan": "Teknik Informatika",
        "semester": 6,
        "ipk": 3.75
    },
    {
        "id": 2,
        "nama": "Ani Lestari",
        "nim": "12345679",
        "jurusan": "Sistem Informasi",
        "semester": 4,
        "ipk": 3.80
    },
    {
        "id": 3,
        "nama": "Rudi Setiawan",
        "nim": "12345680",
        "jurusan": "Teknik Komputer",
        "semester": 8,
        "ipk": 3.65
    }
];

// Fungsi untuk menampilkan data JSON
function tampilkanData() {
    const container = document.getElementById('data-container');
    
    if(container) {
        // Membuat elemen untuk menampilkan data
        const jsonDataElement = document.createElement('pre');
        jsonDataElement.id = 'json-data';
        jsonDataElement.textContent = JSON.stringify(jsonData, null, 2);
        container.appendChild(jsonDataElement);
        
        // Membuat tabel untuk menampilkan data secara terstruktur
        const table = document.createElement('table');
        table.id = 'data-table';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '20px';
        
        // Membuat header tabel
        const headerRow = document.createElement('tr');
        for(const key in jsonData[0]) {
            const th = document.createElement('th');
            th.textContent = key.toUpperCase();
            th.style.border = '1px solid #ddd';
            th.style.padding = '8px';
            th.style.backgroundColor = '#f2f2f2';
            headerRow.appendChild(th);
        }
        table.appendChild(headerRow);
        
        // Membuat baris data
        jsonData.forEach(item => {
            const row = document.createElement('tr');
            for(const key in item) {
                const td = document.createElement('td');
                td.textContent = item[key];
                td.style.border = '1px solid #ddd';
                td.style.padding = '8px';
                row.appendChild(td);
            }
            table.appendChild(row);
        });
        
        container.appendChild(table);
    }
}

// Menjalankan fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    tampilkanData();
});
