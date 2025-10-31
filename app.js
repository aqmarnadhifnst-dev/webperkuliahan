// app.js - Main application logic for the Lecture Notes Summary Application

// Database class to handle all data operations
class Database {
  constructor() {
    this.dataKey = 'lectureNotesData';
    this.loadData();
  }

  // Load data from localStorage or initialize with default data
  loadData() {
    const stored = localStorage.getItem(this.dataKey);
    if (stored) {
      try {
        this.data = JSON.parse(stored);
        // Validate structure
        if (!this.data.summaries || !this.data.courses || !this.data.lecturers) {
          throw new Error('Invalid data structure');
        }
      } catch (e) {
        console.warn('Invalid data in localStorage. Initializing default data.');
        this.data = { summaries: [], courses: [], lecturers: [] };
        this.initializeDefaultData();
      }
    } else {
      this.data = { summaries: [], courses: [], lecturers: [] };
      this.initializeDefaultData();
    }
  }

  // Initialize default data if storage is empty
  initializeDefaultData() {
    const existingData = this.migrateOldData();
    
    if (existingData) {
      this.data = existingData;
    } else {
      this.data.courses = [
        { id: 1, name: 'Matematika Diskrit' },
        { id: 2, name: 'Algoritma dan Struktur Data' },
        { id: 3, name: 'Pemrograman Web' }
      ];
      
      this.data.lecturers = [
        { id: 1, name: 'Dr. Ahmad Fauzi' },
        { id: 2, name: 'Prof. Siti Nurhaliza' },
        { id: 3, name: 'Dr. Budi Santoso' }
      ];
      
      this.data.summaries = [
        {
          id: 1,
          courseId: 1,
          meetingNumber: 1,
          date: '2023-09-01',
          lecturerId: 1,
          topic: 'Pendahuluan Matematika Diskrit',
          content: '<p>Pertemuan pertama membahas konsep dasar matematika diskrit, termasuk logika, teori himpunan, dan relasi.</p>',
          tags: ['logika', 'teori himpunan', 'dasar'],
          priority: 'sedang'
        },
        {
          id: 2,
          courseId: 2,
          meetingNumber: 2,
          date: '2023-09-08',
          lecturerId: 2,
          topic: 'Struktur Data Array dan Linked List',
          content: '<p>Materi tentang implementasi array dan linked list dalam bahasa pemrograman.</p>',
          tags: ['array', 'linked list', 'struktur data'],
          priority: 'tinggi'
        }
      ];
    }
    
    this.saveData();
  }
  
  // Migrate old data format to new format
  migrateOldData() {
    const oldDataString = localStorage.getItem(this.dataKey);
    if (oldDataString) {
      try {
        const parsedOldData = JSON.parse(oldDataString);
        if (parsedOldData.summaries && parsedOldData.courses && parsedOldData.lecturers) {
          console.log('Migrating old data format...');
          return this.convertOldFormatToNew(parsedOldData);
        }
      } catch (e) {
        console.log('Could not parse old data format');
      }
    }
    return null;
  }
  
  // Convert old data format to new format
  convertOldFormatToNew(oldData) {
    const courseMap = new Map();
    const lecturerMap = new Map();
    
    const courses = oldData.courses.map((course, index) => {
      const courseObj = { id: index + 1, name: course };
      courseMap.set(course, courseObj.id);
      return courseObj;
    });
    
    const lecturers = oldData.lecturers.map((lecturer, index) => {
      const lecturerObj = { id: index + 1, name: lecturer };
      lecturerMap.set(lecturer, lecturerObj.id);
      return lecturerObj;
    });
    
    const summaries = oldData.summaries.map(summary => {
      let priority = 'sedang';
      if (summary.priority === 'high') priority = 'tinggi';
      if (summary.priority === 'medium') priority = 'sedang';
      if (summary.priority === 'low') priority = 'rendah';
      
      const tags = summary.tags ? summary.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      
      let newId;
      if (summary.id && !isNaN(summary.id)) {
        newId = parseInt(summary.id);
      } else {
        newId = Math.abs(summary.id?.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || Date.now());
      }
      
      let courseId = 0;
      let lecturerId = 0;
      
      if (summary.courseName) {
        for (let [courseName, id] of courseMap) {
          if (courseName === summary.courseName) {
            courseId = id;
            break;
          }
        }
      }
      
      if (summary.lecturer) {
        for (let [lecturerName, id] of lecturerMap) {
          if (lecturerName === summary.lecturer) {
            lecturerId = id;
            break;
          }
        }
      }
      
      return {
        id: newId,
        courseId: courseId,
        meetingNumber: summary.meetingNumber || 1,
        date: summary.meetingDate || (summary.createdAt?.split('T')[0]) || new Date().toISOString().split('T')[0],
        lecturerId: lecturerId,
        topic: summary.topic,
        content: summary.summary || summary.content || '',
        tags: tags.length > 0 ? tags : [],
        priority: priority
      };
    });
    
    return { summaries, courses, lecturers };
  }

  saveData() {
    localStorage.setItem(this.dataKey, JSON.stringify(this.data));
  }

  // Summaries CRUD
  getAllSummaries() { return this.data.summaries; }
  getSummaryById(id) { return this.data.summaries.find(s => s.id === id); }
  addSummary(summary) {
    const newId = this.data.summaries.length > 0 
      ? Math.max(...this.data.summaries.map(s => s.id)) + 1 
      : 1;
    summary.id = newId;
    this.data.summaries.push(summary);
    this.saveData();
    return summary;
  }
  updateSummary(id, updatedSummary) {
    const index = this.data.summaries.findIndex(s => s.id === id);
    if (index !== -1) {
      this.data.summaries[index] = { ...updatedSummary, id };
      this.saveData();
      return this.data.summaries[index];
    }
    return null;
  }
  deleteSummary(id) {
    this.data.summaries = this.data.summaries.filter(s => s.id !== id);
    this.saveData();
  }

  // Courses CRUD
  getAllCourses() { return this.data.courses; }
  getCourseById(id) { return this.data.courses.find(c => c.id === id); }
  addCourse(course) {
    const newId = this.data.courses.length > 0 
      ? Math.max(...this.data.courses.map(c => c.id)) + 1 
      : 1;
    course.id = newId;
    this.data.courses.push(course);
    this.saveData();
    return course;
  }
  updateCourse(id, updatedCourse) {
    const index = this.data.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.courses[index] = { ...updatedCourse, id };
      this.saveData();
      return this.data.courses[index];
    }
    return null;
  }
  deleteCourse(id) {
    this.data.courses = this.data.courses.filter(c => c.id !== id);
    this.data.summaries = this.data.summaries.filter(s => s.courseId !== id);
    this.saveData();
  }

  // Lecturers CRUD
  getAllLecturers() { return this.data.lecturers; }
  getLecturerById(id) { return this.data.lecturers.find(l => l.id === id); }
  addLecturer(lecturer) {
    const newId = this.data.lecturers.length > 0 
      ? Math.max(...this.data.lecturers.map(l => l.id)) + 1 
      : 1;
    lecturer.id = newId;
    this.data.lecturers.push(lecturer);
    this.saveData();
    return lecturer;
  }
  updateLecturer(id, updatedLecturer) {
    const index = this.data.lecturers.findIndex(l => l.id === id);
    if (index !== -1) {
      this.data.lecturers[index] = { ...updatedLecturer, id };
      this.saveData();
      return this.data.lecturers[index];
    }
    return null;
  }
  deleteLecturer(id) {
    this.data.lecturers = this.data.lecturers.filter(l => l.id !== id);
    this.data.summaries = this.data.summaries.filter(s => s.lecturerId !== id);
    this.saveData();
  }

  resetData() {
    this.data = { summaries: [], courses: [], lecturers: [] };
    this.initializeDefaultData();
  }

  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonString) {
    try {
      const importedData = JSON.parse(jsonString);
      if (importedData && importedData.summaries && importedData.courses && importedData.lecturers) {
        this.data = importedData;
        this.saveData();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  }

  getAllTags() {
    const allTags = new Set();
    this.data.summaries.forEach(s => {
      if (s.tags && Array.isArray(s.tags)) {
        s.tags.forEach(tag => allTags.add(tag.toLowerCase()));
      }
    });
    return Array.from(allTags).sort();
  }
}

// Main App class
class App {
  constructor() {
    this.db = new Database();
    this.currentViewSummary = null;

    document.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }

  init() {
    // Initialize Summernote
    $('#summaryContent').summernote({
      height: 200,
      tabsize: 2,
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video']],
        ['view', ['fullscreen', 'codeview', 'help']]
      ]
    });

    // Load data
    this.loadCourses();
    this.loadLecturers();
    this.loadSummaries();
    this.updateFilterOptions();

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Summary
    $('#saveSummaryBtn').click(() => this.saveSummary());
    $('#addSummaryBtn').click(() => this.showAddSummaryModal());
    $('#editSummaryBtn').click(() => this.showEditSummaryModal());

    // Course
    $('#addCourseBtn').click(() => this.showAddCourseModal());
    $('#saveCourseBtn').click(() => this.saveCourse());
    $(document).on('click', '.delete-course-btn', (e) => {
      const id = $(e.currentTarget).data('id');
      this.deleteCourse(id);
    });

    // Lecturer
    $('#addLecturerBtn').click(() => this.showAddLecturerModal());
    $('#saveLecturerBtn').click(() => this.saveLecturer());
    $(document).on('click', '.delete-lecturer-btn', (e) => {
      const id = $(e.currentTarget).data('id');
      this.deleteLecturer(id);
    });

    // View modal
    $('#deleteSummaryBtn').click(() => this.deleteCurrentSummary());
    $('#exportSummaryBtn').click(() => this.exportCurrentSummary());

    // Filters
    $('#searchInput, #courseFilter, #priorityFilter, #dateFilter, #tagFilter').on('input change', () => {
      this.filterSummaries();
    });

    // Import/Export
    $('#exportAllBtn').click(() => this.exportAllData());
    $('#importBtn').click(() => this.showImportModal());
    $('#confirmImportBtn').click(() => this.importData());
    $('#resetBtn').click(() => this.resetData());
  }

  loadCourses() {
    const courses = this.db.getAllCourses();
    const list = $('#coursesList');
    list.empty();
    courses.forEach(course => {
      list.append(`
        <div class="course-item d-flex justify-content-between align-items-center mb-2">
          <span>${course.name}</span>
          <button class="btn btn-sm btn-outline-danger delete-course-btn" data-id="${course.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `);
    });
  }

  loadLecturers() {
    const lecturers = this.db.getAllLecturers();
    const list = $('#lecturersList');
    list.empty();
    lecturers.forEach(lecturer => {
      list.append(`
        <div class="lecturer-item d-flex justify-content-between align-items-center mb-2">
          <span>${lecturer.name}</span>
          <button class="btn btn-sm btn-outline-danger delete-lecturer-btn" data-id="${lecturer.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `);
    });
  }

  loadSummaries() {
    this.filterSummaries(); // Reuse filter logic with empty filters
  }

  filterSummaries() {
    const summaries = this.db.getAllSummaries();
    const summariesGrid = $('#summariesGrid');
    summariesGrid.empty();

    const filters = {
      search: $('#searchInput').val().toLowerCase(),
      course: $('#courseFilter').val(),
      priority: $('#priorityFilter').val(),
      date: $('#dateFilter').val(),
      tag: $('#tagFilter').val()
    };

    const filtered = summaries.filter(summary => {
      if (filters.search) {
        const course = this.db.getCourseById(summary.courseId);
        const lecturer = this.db.getLecturerById(summary.lecturerId);
        const text = `${summary.topic} ${summary.content} ${course?.name || ''} ${lecturer?.name || ''} ${summary.tags?.join(' ') || ''}`.toLowerCase();
        if (!text.includes(filters.search)) return false;
      }
      if (filters.course && summary.courseId != filters.course) return false;
      if (filters.priority && summary.priority !== filters.priority) return false;
      if (filters.date && summary.date !== filters.date) return false;
      if (filters.tag && summary.tags && !summary.tags.map(t => t.toLowerCase()).includes(filters.tag)) return false;
      return true;
    });

    if (filtered.length === 0) {
      summariesGrid.append(`
        <div class="col-12">
          <div class="text-center py-5">
            <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
            <h4 class="text-muted">Tidak ada ringkasan ditemukan</h4>
            <p class="text-muted">Tambahkan ringkasan pertama Anda dengan klik tombol "Tambah Ringkasan"</p>
          </div>
        </div>
      `);
      return;
    }

    filtered.forEach(summary => {
      const course = this.db.getCourseById(summary.courseId);
      const lecturer = this.db.getLecturerById(summary.lecturerId);
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(summary.content, 'text/html');
      const preview = (doc.body.textContent || '').substring(0, 100) + (doc.body.textContent.length > 100 ? '...' : '');
      
      const formattedDate = new Date(summary.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      const tagsHtml = summary.tags && summary.tags.length > 0
        ? summary.tags.map(tag => `<span class="badge bg-light text-dark me-1">${tag}</span>`).join('')
        : '<span class="text-muted">Tidak ada tag</span>';

      const card = $(`
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="card-title mb-1">${summary.topic}</h6>
                <span class="badge ${this.getPriorityBadgeClass(summary.priority)}">${this.getPriorityLabel(summary.priority)}</span>
              </div>
              <p class="text-muted small mb-2">
                <i class="fas fa-book me-1"></i> ${course?.name || 'N/A'} |
                <i class="fas fa-chalkboard-teacher me-1"></i> ${lecturer?.name || 'N/A'} |
                <i class="fas fa-calendar me-1"></i> ${formattedDate}
              </p>
              <p class="card-text">${preview}</p>
              <div class="tags-container mb-2">${tagsHtml}</div>
              <button class="btn btn-sm btn-outline-primary view-summary-btn" data-id="${summary.id}">
                <i class="fas fa-eye me-1"></i> Lihat
              </button>
            </div>
          </div>
        </div>
      `);

      card.find('.view-summary-btn').click(() => this.viewSummary(summary.id));
      summariesGrid.append(card);
    });
  }

  getPriorityLabel(priority) {
    return { rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi' }[priority] || priority;
  }

  getPriorityBadgeClass(priority) {
    return {
      rendah: 'bg-success',
      sedang: 'bg-warning text-dark',
      tinggi: 'bg-danger'
    }[priority] || 'bg-secondary';
  }

  updateFilterOptions() {
    // Courses
    const courses = this.db.getAllCourses();
    const courseFilter = $('#courseFilter');
    courseFilter.empty().append('<option value="">Semua Mata Kuliah</option>');
    courses.forEach(c => courseFilter.append(`<option value="${c.id}">${c.name}</option>`));

    // Tags
    const tags = this.db.getAllTags();
    const tagFilter = $('#tagFilter');
    tagFilter.empty().append('<option value="">Semua Tag</option>');
    tags.forEach(tag => tagFilter.append(`<option value="${tag}">${tag}</option>`));
  }

  viewSummary(id) {
    const summary = this.db.getSummaryById(id);
    if (!summary) return;

    const course = this.db.getCourseById(summary.courseId);
    const lecturer = this.db.getLecturerById(summary.lecturerId);

    $('#viewCourse').text(course?.name || 'N/A');
    $('#viewMeetingNumber').text(summary.meetingNumber);
    $('#viewDate').text(new Date(summary.date).toLocaleDateString('id-ID'));
    $('#viewLecturer').text(lecturer?.name || 'N/A');
    $('#viewTopic').text(summary.topic);
    $('#viewPriority').text(this.getPriorityLabel(summary.priority));
    $('#viewTags').html(
      summary.tags?.length > 0
        ? summary.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')
        : '<span class="text-muted">Tidak ada tag</span>'
    );
    $('#viewContent').html(summary.content);

    this.currentViewSummary = summary;
    $('#viewSummaryModal').modal('show');
  }

  showAddSummaryModal() {
    $('#summaryId').val('');
    $('#summaryForm')[0].reset();
    $('#summaryContent').summernote('code', '');
    $('#summaryModalTitle').text('Tambah Ringkasan Baru');
    $('#summaryModal').modal('show');

    // Reload dropdowns in case new courses/lecturers were added
    this.populateCourseAndLecturerDropdowns();
  }

  showEditSummaryModal() {
    const summary = this.currentViewSummary;
    if (!summary) return;

    $('#summaryId').val(summary.id);
    $('#courseSelect').val(summary.courseId);
    $('#meetingNumber').val(summary.meetingNumber);
    $('#date').val(summary.date);
    $('#lecturerSelect').val(summary.lecturerId);
    $('#topic').val(summary.topic);
    $('#prioritySelect').val(summary.priority);
    $('#tagsInput').val(summary.tags?.join(', ') || '');
    $('#summaryContent').summernote('code', summary.content);
    $('#summaryModalTitle').text('Edit Ringkasan');
    $('#summaryModal').modal('show');
    $('#viewSummaryModal').modal('hide');

    this.populateCourseAndLecturerDropdowns();
  }

  populateCourseAndLecturerDropdowns() {
    const courses = this.db.getAllCourses();
    const lecturers = this.db.getAllLecturers();

    const courseSelect = $('#courseSelect');
    courseSelect.empty().append('<option value="">Pilih Mata Kuliah</option>');
    courses.forEach(c => courseSelect.append(`<option value="${c.id}">${c.name}</option>`));

    const lecturerSelect = $('#lecturerSelect');
    lecturerSelect.empty().append('<option value="">Pilih Dosen</option>');
    lecturers.forEach(l => lecturerSelect.append(`<option value="${l.id}">${l.name}</option>`));
  }

  saveSummary() {
    const id = $('#summaryId').val();
    const summary = {
      courseId: parseInt($('#courseSelect').val()),
      meetingNumber: parseInt($('#meetingNumber').val()),
      date: $('#date').val(),
      lecturerId: parseInt($('#lecturerSelect').val()),
      topic: $('#topic').val().trim(),
      content: $('#summaryContent').summernote('code'),
      tags: $('#tagsInput').val()
        .split(',')
        .map(t => t.trim())
        .filter(t => t),
      priority: $('#prioritySelect').val()
    };

    if (!summary.courseId || !summary.lecturerId || !summary.topic || !summary.date) {
      alert('Harap lengkapi semua field yang wajib.');
      return;
    }

    if (id) {
      this.db.updateSummary(parseInt(id), summary);
    } else {
      this.db.addSummary(summary);
    }

    this.loadSummaries();
    this.updateFilterOptions();
    $('#summaryModal').modal('hide');
  }

  showAddCourseModal() {
    $('#courseId').val('');
    $('#cour
