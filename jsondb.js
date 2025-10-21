// Sistem database berbasis file JSON untuk aplikasi Smart Lecture Notes
class JSONDatabase {
    constructor() {
        this.dbName = 'lecture_notes_db.json';
        // Data default
        this.data = {
            summaries: [],
            courses: ["Algoritma dan Pemrograman", "Basis Data", "Jaringan Komputer"],
            lecturers: ["Dr. Ahmad Wijaya, M.Kom", "Prof. Sari Indah, M.T.I", "Dr. Budi Santoso"]
        };
    }

    // Load data dari file JSON (simulasi)
    async loadData() {
        return new Promise((resolve) => {
            // Cek apakah ada data yang disimpan di localStorage sebagai fallback
            const savedData = localStorage.getItem('lectureNotesDB');
            if (savedData) {
                this.data = JSON.parse(savedData);
            }
            resolve(this.data);
        });
    }

    // Simpan data ke localStorage (fallback)
    async saveData() {
        return new Promise((resolve) => {
            localStorage.setItem('lectureNotesDB', JSON.stringify(this.data));
            resolve(true);
        });
    }

    // Simulasi load dari file JSON
    async loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    this.data = importedData;
                    this.saveData(); // Simpan juga ke localStorage sebagai backup
                    resolve(importedData);
                } catch (error) {
                    reject(new Error('Gagal membaca file JSON: ' + error.message));
                }
            };
            reader.onerror = () => {
                reject(new Error('Gagal membaca file'));
            };
            reader.readAsText(file);
        });
    }

    // Simulasi ekspor ke file JSON
    exportToFile() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = this.dbName;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Method-method CRUD untuk summaries
    async getAllSummaries() {
        await this.loadData();
        return this.data.summaries;
    }

    async getSummaryById(id) {
        await this.loadData();
        return this.data.summaries.find(summary => summary.id === id);
    }

    async addSummary(summary) {
        await this.loadData();
        this.data.summaries.push(summary);
        await this.saveData();
        return summary;
    }

    async updateSummary(id, updatedSummary) {
        await this.loadData();
        const index = this.data.summaries.findIndex(summary => summary.id === id);
        if (index !== -1) {
            this.data.summaries[index] = updatedSummary;
            await this.saveData();
            return this.data.summaries[index];
        }
        return null;
    }

    async deleteSummary(id) {
        await this.loadData();
        this.data.summaries = this.data.summaries.filter(summary => summary.id !== id);
        await this.saveData();
    }

    // Method-method CRUD untuk courses
    async getAllCourses() {
        await this.loadData();
        return this.data.courses;
    }

    async addCourse(courseName) {
        await this.loadData();
        if (!this.data.courses.includes(courseName)) {
            this.data.courses.push(courseName);
            await this.saveData();
            return courseName;
        }
        return null;
    }

    async deleteCourse(courseName) {
        await this.loadData();
        this.data.courses = this.data.courses.filter(course => course !== courseName);
        await this.saveData();
    }

    // Method-method CRUD untuk lecturers
    async getAllLecturers() {
        await this.loadData();
        return this.data.lecturers;
    }

    async addLecturer(lecturerName) {
        await this.loadData();
        if (!this.data.lecturers.includes(lecturerName)) {
            this.data.lecturers.push(lecturerName);
            await this.saveData();
            return lecturerName;
        }
        return null;
    }

    async deleteLecturer(lecturerName) {
        await this.loadData();
        this.data.lecturers = this.data.lecturers.filter(lecturer => lecturer !== lecturerName);
        await this.saveData();
    }

    // Reset data ke kondisi awal
    async resetData() {
        this.data = {
            summaries: [],
            courses: ["Algoritma dan Pemrograman", "Basis Data", "Jaringan Komputer"],
            lecturers: ["Dr. Ahmad Wijaya, M.Kom", "Prof. Sari Indah, M.T.I", "Dr. Budi Santoso"]
        };
        await this.saveData();
    }
}

// Inisialisasi database
const jsonDB = new JSONDatabase();
