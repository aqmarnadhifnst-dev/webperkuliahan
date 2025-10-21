// File: app_with_jsondb.js
// File ini berisi implementasi aplikasi dengan database JSON

class LectureNotesApp {
    constructor() {
        this.currentEditingId = null;
        this.init();
    }

    async loadSummaries() {
        this.summaries = await jsonDB.getAllSummaries();
        return this.summaries;
    }

    async loadCourses() {
        this.courses = await jsonDB.getAllCourses();
        return this.courses;
    }

    async loadLecturers() {
        this.lecturers = await jsonDB.getAllLecturers();
        return this.lecturers;
    }

    async saveSummaries() {
        // Data disimpan dalam database JSON terpusat
        this.updateDashboard();
    }

    async saveCourses() {
        // Data disimpan dalam database JSON terpusat
        this.populateCourseDropdown();
    }

    async saveLecturers() {
        // Data disimpan dalam database JSON terpusat
        this.populateLecturerDropdown();
    }

    async init() {
        // Load semua data dari database JSON
        await this.loadSummaries();
        await this.loadCourses();
        await this.loadLecturers();
        
        this.setupEventListeners();
        this.populateCourseDropdown();
        this.populateLecturerDropdown();
        this.displaySummaries();
        this.updateDashboard();
        this.loadCoursesFilter();
        document.getElementById('meetingDate').valueAsDate = new Date();
        this.initSummernote();
        
        // Tampilkan tab aktif pertama kali
        this.switchToTab('data-json');
    }

    // Fungsi untuk menangani submit formulir
    async handleFormSubmit(e) {
        e.preventDefault();
        
        // Get Summernote content if available
        let summaryContent = '';
        if ($('#summary').summernote('code')) {
            summaryContent = $('#summary').summernote('code');
        } else {
            summaryContent = document.getElementById('summary').value;
        }
        
        const summaryData = {
            id: this.currentEditingId || Date.now().toString(),
            courseName: document.getElementById('courseName').value,
            meetingNumber: parseInt(document.getElementById('meetingNumber').value),
            meetingDate: document.getElementById('meetingDate').value,
            lecturer: document.getElementById('lecturer').value,
            topic: document.getElementById('topic').value,
            summary: summaryContent,
            tags: document.getElementById('tags').value,
            priority: document.getElementById('priority').value,
            createdAt: this.currentEditingId ? 
                (await jsonDB.getSummaryById(this.currentEditingId)).createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.currentEditingId) {
            await jsonDB.updateSummary(this.currentEditingId, summaryData);
        } else {
            await jsonDB.addSummary(summaryData);
        }

        await this.loadSummaries(); // Reload data dari database
        this.displaySummaries();
        
        // Automatically download as .md file after saving
        this.downloadSummaryAsMD(summaryData);
        
        this.resetForm();
        this.showToast(this.currentEditingId ? 'Ringkasan berhasil diperbarui!' : 'Ringkasan berhasil disimpan!', 'success');
    }

    // Fungsi untuk menambah mata kuliah
    async addCourse() {
        const input = document.getElementById('newCourseInput');
        const name = input.value.trim();
        if (name) {
            const result = await jsonDB.addCourse(name);
            if (result) {
                await this.loadCourses(); // Reload data dari database
                input.value = '';
                this.renderCourseList();
                this.showToast('Mata kuliah berhasil ditambahkan!', 'success');
            } else {
                this.showToast('Mata kuliah sudah ada!', 'warning');
            }
        }
    }

    // Fungsi untuk menambah dosen
    async addLecturer() {
        const input = document.getElementById('newLecturerInput');
        const name = input.value.trim();
        if (name) {
            const result = await jsonDB.addLecturer(name);
            if (result) {
                await this.loadLecturers(); // Reload data dari database
                input.value = '';
                this.renderLecturerList();
                this.showToast('Dosen berhasil ditambahkan!', 'success');
            } else {
                this.showToast('Dosen sudah ada!', 'warning');
            }
        }
    }

    // Fungsi untuk menghapus mata kuliah
    async deleteCourse(courseName) {
        if (confirm(`Hapus "${courseName}"?`)) {
            await jsonDB.deleteCourse(courseName);
            await this.loadCourses(); // Reload data dari database
            this.renderCourseList();
        }
    }

    // Fungsi untuk menghapus dosen
    async deleteLecturer(lecturerName) {
        if (confirm(`Hapus "${lecturerName}"?`)) {
            await jsonDB.deleteLecturer(lecturerName);
            await this.loadLecturers(); // Reload data dari database
            this.renderLecturerList();
        }
    }
    
    // Fungsi untuk menghapus ringkasan
    async deleteSummary(id) {
        if (confirm('Hapus ringkasan ini?')) {
            await jsonDB.deleteSummary(id);
            await this.loadSummaries(); // Reload data dari database
            this.displaySummaries();
            this.showToast('Ringkasan dihapus!', 'success');
        }
    }

    // Fungsi untuk mengekspor data ke JSON
    async exportJSON() {
        jsonDB.exportToFile();
        this.showToast('Ekspor JSON berhasil!', 'success');
    }

    // Fungsi untuk mengimpor data dari file JSON
    async importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            await jsonDB.loadFromFile(file);
            await this.loadSummaries();
            await this.loadCourses();
            await this.loadLecturers();
            this.displaySummaries();
            this.loadCoursesFilter();
            this.showToast('Impor berhasil!', 'success');
        } catch (err) {
            alert('Gagal mengimpor: ' + err.message);
        }
        
        e.target.value = '';
    }
    
    // Fungsi untuk menghapus semua data
    async clearAllData() {
        if (confirm('Hapus SEMUA data?')) {
            await jsonDB.resetData();
            await this.loadSummaries();
            await this.loadCourses();
            await this.loadLecturers();
            this.displaySummaries();
            this.updateDashboard();
            this.showToast('Semua data dihapus!', 'success');
        }
    }
    
    // Fungsi untuk mengedit ringkasan
    async editSummary(id) {
        const summary = await jsonDB.getSummaryById(id);
        if (!summary) return;

        document.getElementById('courseName').value = summary.courseName;
        document.getElementById('meetingNumber').value = summary.meetingNumber;
        document.getElementById('meetingDate').value = summary.meetingDate;
        document.getElementById('lecturer').value = summary.lecturer;
        document.getElementById('topic').value = summary.topic;
        document.getElementById('tags').value = summary.tags;
        document.getElementById('priority').value = summary.priority;

        // Set Summernote content
        if ($('#summary').summernote('code')) {
            $('#summary').summernote('code', summary.summary);
        } else {
            document.getElementById('summary').value = summary.summary;
        }

        this.currentEditingId = id;
        document.querySelector('#add-summary .btn-primary').innerHTML = '<i class=\"fas fa-edit\"></i> Update Ringkasan';
        document.querySelector('#add-summary h2').innerHTML = '<i class=\"fas fa-edit\"></i> Edit Ringkasan';

        this.switchToTab('add-summary');
    }
    
    // Fungsi untuk memfilter ringkasan
    async filterSummaries() {
        const term = document.getElementById('searchInput').value.toLowerCase();
        const course = document.getElementById('courseFilter').value;
        const prio = document.getElementById('priorityFilter').value;
        
        const allSummaries = await jsonDB.getAllSummaries();
        
        const filtered = allSummaries.filter(s => {
            const match = s.courseName.toLowerCase().includes(term) ||
                          s.topic.toLowerCase().includes(term) ||
                          s.summary.toLowerCase().includes(term) ||
                          (s.tags && s.tags.toLowerCase().includes(term));
            return match && (!course || s.courseName === course) && (!prio || s.priority === prio);
        });
        this.displaySummaries(filtered);
    }
    
    // Fungsi untuk update dashboard
    async updateDashboard() {
        const summaries = await jsonDB.getAllSummaries();
        document.getElementById('totalSummaries').textContent = summaries.length;
        document.getElementById('totalCourses').textContent = [...new Set(summaries.map(s => s.courseName))].length;
        const weekAgo = new Date(); 
        weekAgo.setDate(weekAgo.getDate() - 7);
        document.getElementById('thisWeekSummaries').textContent = summaries.filter(s => new Date(s.createdAt) >= weekAgo).length;
        const tags = new Set();
        summaries.forEach(s => s.tags && s.tags.split(',').forEach(t => tags.add(t.trim())));
        document.getElementById('totalTags').textContent = tags.size;
        
        // Update recent summaries
        const recentList = document.getElementById('recentSummariesList');
        const recent = summaries.slice(0, 5);
        if (recent.length === 0) {
            recentList.innerHTML = '<div class=\"empty-state\"><i class=\"fas fa-file-alt\"></i><h3>Belum ada ringkasan</h3></div>';
        } else {
            recentList.innerHTML = recent.map(s => `
                <div class="summary-item">
                    <div class="summary-header">
                        <div class="summary-title">${this.escapeHtml(s.courseName)} - Pertemuan ${s.meetingNumber}</div>
                        <span class="priority-badge ${s.priority}">${this.getPriorityLabel(s.priority)}</span>
                    </div>
                    <div class="summary-meta">
                        <div class="meta-item"><i class="fas fa-calendar"></i> ${this.formatDate(s.meetingDate)}</div>
                        <div class="meta-item"><i class="fas fa-chalkboard-teacher"></i> ${this.escapeHtml(s.lecturer)}</div>
                    </div>
                    <div class="summary-content"><strong>Topik:</strong> ${this.escapeHtml(s.topic)}</div>
                    <div class="tags">${s.tags ? s.tags.split(',').map(t => `<span class="tag">${this.escapeHtml(t.trim())}</span>`).join('') : ''}</div>
                    <div class="summary-actions">
                        <button class="btn btn-success" onclick="app.downloadSummaryAsMD(${JSON.stringify(s)})"><i class="fas fa-download"></i> .md</button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Fungsi untuk menampilkan ringkasan
    async displaySummaries(filtered = null) {
        const list = document.getElementById('summaryList');
        const data = filtered || await jsonDB.getAllSummaries();
        if (data.length === 0) {
            list.innerHTML = '<div class="empty-state"><i class="fas fa-file-alt"></i><h3>Belum ada ringkasan</h3></div>';
            return;
        }
        data.sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));
        list.innerHTML = data.map(s => `
            <div class="summary-item">
                <div class="summary-header">
                    <div class="summary-title">${this.escapeHtml(s.courseName)} - Pertemuan ${s.meetingNumber}</div>
                    <span class="priority-badge ${s.priority}">${this.getPriorityLabel(s.priority)}</span>
                </div>
                <div class="summary-meta">
                    <div class="meta-item"><i class="fas fa-calendar"></i> ${this.formatDate(s.meetingDate)}</div>
                    <div class="meta-item"><i class="fas fa-chalkboard-teacher"></i> ${this.escapeHtml(s.lecturer)}</div>
                </div>
                <div class="summary-content"><strong>Topik:</strong> ${this.escapeHtml(s.topic)}<br><br>${s.summary}</div>
                <div class="tags">${s.tags ? s.tags.split(',').map(t => `<span class="tag">${this.escapeHtml(t.trim())}</span>`).join('') : ''}</div>
                <div class="summary-actions">
                    <button class="btn btn-primary" onclick="app.editSummary('${s.id}')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-success" onclick="app.downloadSummaryAsMD(${JSON.stringify(s)})"><i class="fas fa-download"></i> .md</button>
                    <button class="btn btn-danger" onclick="app.deleteSummary('${s.id}')"><i class="fas fa-trash"></i> Hapus</button>
                </div>
            </div>
        `).join('');
    }
    
    // Fungsi untuk memuat filter mata kuliah
    async loadCoursesFilter() {
        const sel = document.getElementById('courseFilter');
        sel.innerHTML = '<option value="">Semua Mata Kuliah</option>';
        
        const summaries = await jsonDB.getAllSummaries();
        [...new Set(summaries.map(s => s.courseName))].forEach(c => {
            sel.innerHTML += `<option value="${this.escapeHtml(c)}">${this.escapeHtml(c)}</option>`;
        });
    }
}

// Catatan: Fungsi-fungsi lain seperti populateCourseDropdown, populateLecturerDropdown, 
// setupEventListeners, initSummernote, resetForm, downloadSummaryAsMD, downloadCurrentAsMD,
// generateMarkdownContent, generateFilename, exportAllAsMD, switchToTab, showToast, 
// formatDate, getPriorityLabel, escapeHtml tetap sama seperti sebelumnya, hanya
// mengakses this.summaries, this.courses, this.lecturers dari data yang telah dimuat
// dari jsonDB di awal inisialisasi.
