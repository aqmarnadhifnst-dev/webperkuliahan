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
      this.data = JSON.parse(stored);
    } else {
      // Initialize with default data
      this.data = {
        summaries: [],
        courses: [],
        lecturers: []
      };
      this.initializeDefaultData();
    }
  }

  // Initialize default data if storage is empty
  initializeDefaultData() {
    // Check if we have existing data in the old format to migrate
    const existingData = this.migrateOldData();
    
    if (existingData) {
      // Use migrated data
      this.data = existingData;
    } else {
      // Use default sample data
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
      
      // Add some default summaries
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
    // Check if there's old format data in localStorage
    const oldDataKey = 'lectureNotesData'; // Default key - you might have used a different one
    const oldDataString = localStorage.getItem(oldDataKey);
    
    // If there's old data in localStorage, try to migrate it
    if (oldDataString) {
      try {
        const parsedOldData = JSON.parse(oldDataString);
        
        // Check if it's in the old format (if it has summaries, courses, lecturers as arrays of strings/values)
        if (parsedOldData.summaries && parsedOldData.courses && parsedOldData.lecturers) {
          console.log('Found old format data in localStorage, migrating...');
          return this.convertOldFormatToNew(parsedOldData);
        }
      } catch (e) {
        console.log('Could not parse old data format from localStorage');
      }
    }
    
    // If no data found in localStorage, we'll return null to use default data
    // The actual data migration from the file should happen via the import feature
    return null;
  }
  
  // Convert old data format to new format
  convertOldFormatToNew(oldData) {
    // Create mapping for courses and lecturers to convert string values to IDs
    const courseMap = new Map();
    const lecturerMap = new Map();
    
    // Convert courses array of strings to objects with IDs
    const courses = oldData.courses.map((course, index) => {
      const courseObj = { id: index + 1, name: course };
      courseMap.set(course, courseObj.id);
      return courseObj;
    });
    
    // Convert lecturers array of strings to objects with IDs
    const lecturers = oldData.lecturers.map((lecturer, index) => {
      const lecturerObj = { id: index + 1, name: lecturer };
      lecturerMap.set(lecturer, lecturerObj.id);
      return lecturerObj;
    });
    
    // Convert summaries to new format
    const summaries = oldData.summaries.map(summary => {
      // Convert priority from old format ('high', 'medium') to new format ('tinggi', 'sedang', 'rendah')
      let priority = 'sedang'; // default
      if (summary.priority === 'high') priority = 'tinggi';
      if (summary.priority === 'medium') priority = 'sedang';
      if (summary.priority === 'low') priority = 'rendah';
      
      // Convert tags from string to array
      const tags = summary.tags ? summary.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      
      // Handle the ID conversion - if it's a string that represents a number, convert it
      let newId;
      if (summary.id && !isNaN(summary.id)) {
        newId = parseInt(summary.id);
      } else {
        // If it's not a number, create a numeric ID based on the string
        newId = Math.abs(summary.id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
      }
      
      // Find the course and lecturer IDs based on the names in the summary
      let courseId = 0;
      let lecturerId = 0;
      
      // Find the course ID by matching the courseName in the summary
      if (summary.courseName) {
        for (let [courseName, id] of courseMap) {
          if (courseName === summary.courseName) {
            courseId = id;
            break;
          }
        }
      }
      
      // Find the lecturer ID by matching the lecturer name in the summary
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
        date: summary.meetingDate || summary.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0], // Try meetingDate first, then createdAt date, then today
        lecturerId: lecturerId,
        topic: summary.topic,
        content: summary.summary || summary.content || '', // Use summary field from old format
        tags: tags.length > 0 ? tags : [], // Use converted tags array
        priority: priority
      };
    });
    
    return {
      summaries: summaries,
      courses: courses,
      lecturers: lecturers
    };
  }

  // Save data to localStorage
  saveData() {
    localStorage.setItem(this.dataKey, JSON.stringify(this.data));
  }

  // Summaries CRUD operations
  getAllSummaries() {
    return this.data.summaries;
  }

  getSummaryById(id) {
    return this.data.summaries.find(summary => summary.id === id);
  }

  addSummary(summary) {
    // Generate new ID
    const newId = this.data.summaries.length > 0 
      ? Math.max(...this.data.summaries.map(s => s.id)) + 1 
      : 1;
    
    summary.id = newId;
    this.data.summaries.push(summary);
    this.saveData();
    return summary;
  }

  updateSummary(id, updatedSummary) {
    const index = this.data.summaries.findIndex(summary => summary.id === id);
    if (index !== -1) {
      this.data.summaries[index] = { ...updatedSummary, id };
      this.saveData();
      return this.data.summaries[index];
    }
    return null;
  }

  deleteSummary(id) {
    this.data.summaries = this.data.summaries.filter(summary => summary.id !== id);
    this.saveData();
  }

  // Courses CRUD operations
  getAllCourses() {
    return this.data.courses;
  }

  getCourseById(id) {
    return this.data.courses.find(course => course.id === id);
  }

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
    const index = this.data.courses.findIndex(course => course.id === id);
    if (index !== -1) {
      this.data.courses[index] = { ...updatedCourse, id };
      this.saveData();
      return this.data.courses[index];
    }
    return null;
  }

  deleteCourse(id) {
    this.data.courses = this.data.courses.filter(course => course.id !== id);
    // Also remove summaries related to this course
    this.data.summaries = this.data.summaries.filter(summary => summary.courseId !== id);
    this.saveData();
  }

  // Lecturers CRUD operations
  getAllLecturers() {
    return this.data.lecturers;
  }

  getLecturerById(id) {
    return this.data.lecturers.find(lecturer => lecturer.id === id);
  }

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
    const index = this.data.lecturers.findIndex(lecturer => lecturer.id === id);
    if (index !== -1) {
      this.data.lecturers[index] = { ...updatedLecturer, id };
      this.saveData();
      return this.data.lecturers[index];
    }
    return null;
  }

  deleteLecturer(id) {
    this.data.lecturers = this.data.lecturers.filter(lecturer => lecturer.id !== id);
    // Also remove summaries related to this lecturer
    this.data.summaries = this.data.summaries.filter(summary => summary.lecturerId !== id);
    this.saveData();
  }

  // Utility methods
  resetData() {
    this.data = {
      summaries: [],
      courses: [],
      lecturers: []
    };
    this.initializeDefaultData();
  }

  // Export data as JSON
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  // Import data from JSON
  importData(jsonString) {
    try {
      const importedData = JSON.parse(jsonString);
      if (importedData && importedData.summaries && importedData.courses && importedData.lecturers) {
        // Convert the imported data to the new format
        const convertedData = this.convertOldFormatToNew(importedData);
        this.data = convertedData;
        this.saveData();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  }

  // Get unique tags from all summaries
  getAllTags() {
    const allTags = [];
    this.data.summaries.forEach(summary => {
      if (summary.tags && Array.isArray(summary.tags)) {
        summary.tags.forEach(tag => {
          if (!allTags.includes(tag.toLowerCase())) {
            allTags.push(tag.toLowerCase());
          }
        });
      }
    });
    return allTags.sort();
  }
}

// Main App class
class App {
  constructor() {
    this.db = new Database();
    this.currentViewSummary = null;
    this.currentEditSummary = null;

    // Initialize the app when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }

  init() {
    // Initialize Summernote editor
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

    // Load initial data
    this.loadCourses();
    this.loadLecturers();
    this.loadSummaries();
    this.updateFilterOptions();

    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Summary form events
    $('#saveSummaryBtn').click(() => this.saveSummary());
    $('#addSummaryBtn').click(() => this.showAddSummaryModal());
    $('#editSummaryBtn').click(() => this.showEditSummaryModal());

    // Course events
    $('#addCourseBtn').click(() => this.showAddCourseModal());
    $('#saveCourseBtn').click(() => this.saveCourse());
    $(document).on('click', '.delete-course-btn', (e) => {
      const courseId = $(e.target).data('id');
      this.deleteCourse(courseId);
    });

    // Lecturer events
    $('#addLecturerBtn').click(() => this.showAddLecturerModal());
    $('#saveLecturerBtn').click(() => this.saveLecturer());
    $(document).on('click', '.delete-lecturer-btn', (e) => {
      const lecturerId = $(e.target).data('id');
      this.deleteLecturer(lecturerId);
    });

    // View summary events
    $('#deleteSummaryBtn').click(() => this.deleteCurrentSummary());
    $('#exportSummaryBtn').click(() => this.exportCurrentSummary());

    // Filter events
    $('#searchInput').on('input', () => this.filterSummaries());
    $('#courseFilter').change(() => this.filterSummaries());
    $('#priorityFilter').change(() => this.filterSummaries());
    $('#dateFilter').change(() => this.filterSummaries());
    $('#tagFilter').change(() => this.filterSummaries());

    // Import/export events
    $('#exportAllBtn').click(() => this.exportAllData());
    $('#importBtn').click(() => this.showImportModal());
    $('#confirmImportBtn').click(() => this.importData());
    $('#resetBtn').click(() => this.resetData());
  }

  loadCourses() {
    const courses = this.db.getAllCourses();
    const coursesList = $('#coursesList');
    coursesList.empty();

    courses.forEach(course => {
      const courseItem = $(`
        <div class="course-item">
          <span>${course.name}</span>
          <div class="course-actions">
            <button class="btn btn-sm btn-outline-danger delete-course-btn" data-id="${course.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `);
      coursesList.append(courseItem);
    });
  }

  loadLecturers() {
    const lecturers = this.db.getAllLecturers();
    const lecturersList = $('#lecturersList');
    lecturersList.empty();

    lecturers.forEach(lecturer => {
      const lecturerItem = $(`
        <div class="lecturer-item">
          <span>${lecturer.name}</span>
          <div class="lecturer-actions">
            <button class="btn btn-sm btn-outline-danger delete-lecturer-btn" data-id="${lecturer.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `);
      lecturersList.append(lecturerItem);
    });
  }

  loadSummaries(filters = {}) {
    const summaries = this.db.getAllSummaries();
    const summariesGrid = $('#summariesGrid');
    summariesGrid.empty();

    // Apply filters if provided
    const filteredSummaries = this.applyFilters(summaries, filters);

    if (filteredSummaries.length === 0) {
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

    filteredSummaries.forEach(summary => {
      const course = this.db.getCourseById(summary.courseId);
      const lecturer = this.db.getLecturerById(summary.lecturerId);
      
      // Create a preview of the content (first 100 characters)
      const parser = new DOMParser();
      const doc = parser.parseFromString(summary.content, 'text/html');
      const previewText = doc.body.textContent || doc.body.innerText || '';
      const preview = previewText.length > 100 
        ? previewText.substring(0, 100) + '...' 
        : previewText;
      
      // Format date
      const formattedDate = new Date(summary.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      // Create tags HTML
      let tagsHtml = '';
      if (summary.tags && summary.tags.length > 0) {
        tagsHtml = summary.tags.map(tag => `
          <span class="badge bg-light text-dark tag-badge">${tag}</span>
        `).join('');
      } else {
        tagsHtml = '<span class="text-muted">Tidak ada tag</span>';
      }

      const summaryCard = $(`
        <div class="col-md-6 col-lg-4 mb-4" data-id="${summary.id}">
          <div class="card summary-card h-100 position-relative">
            <div class="summary-priority priority-${summary.priority}">
              ${this.getPriorityLabel(summary.priority)}
            </div>
            <div class="card-body">
              <h5 class="summary-topic">${summary.topic}</h5>
              <div class="summary-meta">
                <i class="fas fa-book me-1"></i> ${course ? course.name : 'N/A'} | 
                <i class="fas fa-chalkboard-teacher me-1"></i> ${lecturer ? lecturer.name : 'N/A'} | 
                <i class="fas fa-calendar me-1"></i> ${formattedDate}
              </div>
              <div class="summary-preview">${preview}</div>
              <div class="tags-container">
                ${tagsHtml}
              </div>
            </div>
            <div class="card-footer bg-transparent border-0">
              <button class="btn btn-sm btn-outline-primary view-summary-btn" data-id="${summary.id}">
                <i class="fas fa-eye me-1"></i>Lihat
              </button>
            </div>
          </div>
        </div>
      `);

      // Add click event to view summary
      summaryCard.find('.view-summary-btn').click(() => {
        this.viewSummary(summary.id);
      });

      summariesGrid.append(summaryCard);
    });
  }

  // Helper to get priority label
  getPriorityLabel(priority) {
    switch(priority) {
      case 'rendah': return 'Rendah';
      case 'sedang': return 'Sedang';
      case 'tinggi': return 'Tinggi';
      default: return priority;
    }
  }

  updateFilterOptions() {
    // Update course filter
    const courses = this.db.getAllCourses();
    const courseFilter = $('#courseFilter');
    courseFilter.empty();
    courseFilter.append('<option value="">Semua Mata Kuliah</option>');
    courses.forEach(course => {
      courseFilter.append(`<option value="${course.id}">${course.name}</option>`);
    });

    // Update tag filter
    const tags = this.db.getAllTags();
    const tagFilter = $('#tagFilter');
    tagFilter.empty();
    tagFilter.append('<option value="">Semua Tag</option>');
    tags.forEach(tag => {
      tagFilter.append(`<option value="${tag}">${tag}</option>`);
    });
  }

  applyFilters(summaries, filters) {
    // Get filter values from UI if not provided
    if (Object.keys(filters).length === 0) {
      filters = {
        search: $('#searchInput').val().toLowerCase(),
        course: $('#courseFilter').val(),
        priority: $('#priorityFilter').val(),
        date: $('#dateFilter').val(),
        tag: $('#tagFilter').val()
      };
    }

    return summaries.filter(summary => {
      // Search filter
      if (filters.search) {
        const course = this.db.getCourseById(summary.courseId);
        const lecturer = this.db.getLecturerById(summary.lecturerId);
        const searchText = `${summary.topic} ${summary.content} ${course?.name || ''} ${lecturer?.name || ''} ${summary.tags?.join(' ') || ''}`.toLowerCase();
        
        if (!searchText.includes(filters.search)) {
          return false;
        }
      }

      // Course filter
      if (filters.course && summary.courseId != filters.course) {
        return false;
      }

      // Priority filter
      if (filters.priority && summary.priority !== filters.priority) {
        return false;
      }

      // Date filter
      if (filters.date && summary.date !== filters.date) {
        return false;
      }

      // Tag filter
      if (filters.tag && summary.tags && !summary.tags.map(t => t.toLowerCase()).includes(filters.tag)) {
        return false;
      }

      return true;
    });
  }

  filterSummaries() {
    // Apply filters using the current UI values
    const summaries = this.db.getAllSummaries();
    this.loadSummaries();
  }

  showAddSummaryModal() {
    // Reset form
    $('#summaryForm')[0].reset();
    $('#summaryId').val('');
    $('#summaryModalTitle').text('Tambah Ringkasan Baru');
    
    // Reset Summernote content
    $('#summaryContent').summernote('code', '');
    
    // Update dropdowns
    this.updateSummaryFormDropdowns();
    
    // Show modal
    $('#summaryModal').modal('show');
    this.currentEditSummary = null;
  }

  showEditSummaryModal() {
    if (this.currentViewSummary) {
      this.editSummary(this.currentViewSummary.id);
    }
  }

  editSummary(id) {
    const summary = this.db.getSummaryById(id);
    if (!summary) return;

    this.currentEditSummary = summary;

    // Set form values
    $('#summaryId').val(summary.id);
    $('#courseSelect').val(summary.courseId);
    $('#meetingNumber').val(summary.meetingNumber);
    $('#date').val(summary.date);
    $('#lecturerSelect').val(summary.lecturerId);
    $('#topic').val(summary.topic);
    $('#prioritySelect').val(summary.priority);
    $('#tagsInput').val(summary.tags ? summary.tags.join(', ') : '');
    
    // Set Summernote content
    $('#summaryContent').summernote('code', summary.content);
    
    // Update dropdowns
    this.updateSummaryFormDropdowns();
    
    // Update modal title
    $('#summaryModalTitle').text('Edit Ringkasan');
    
    // Show modal
    $('#summaryModal').modal('show');
  }

  updateSummaryFormDropdowns() {
    // Update course dropdown
    const courses = this.db.getAllCourses();
    const courseSelect = $('#courseSelect');
    courseSelect.empty();
    courseSelect.append('<option value="">Pilih Mata Kuliah</option>');
    courses.forEach(course => {
      const selected = this.currentEditSummary && this.currentEditSummary.courseId === course.id ? 'selected' : '';
      courseSelect.append(`<option value="${course.id}" ${selected}>${course.name}</option>`);
    });

    // Update lecturer dropdown
    const lecturers = this.db.getAllLecturers();
    const lecturerSelect = $('#lecturerSelect');
    lecturerSelect.empty();
    lecturerSelect.append('<option value="">Pilih Dosen</option>');
    lecturers.forEach(lecturer => {
      const selected = this.currentEditSummary && this.currentEditSummary.lecturerId === lecturer.id ? 'selected' : '';
      lecturerSelect.append(`<option value="${lecturer.id}" ${selected}>${lecturer.name}</option>`);
    });
  }

  saveSummary() {
    const id = parseInt($('#summaryId').val());
    const courseId = parseInt($('#courseSelect').val());
    const meetingNumber = parseInt($('#meetingNumber').val());
    const date = $('#date').val();
    const lecturerId = parseInt($('#lecturerSelect').val());
    const topic = $('#topic').val();
    const content = $('#summaryContent').summernote('code');
    const priority = $('#prioritySelect').val();
    const tagsInput = $('#tagsInput').val();
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    if (!courseId || !date || !lecturerId || !topic || !content) {
      alert('Silakan lengkapi semua field yang wajib diisi!');
      return;
    }

    const summary = {
      courseId,
      meetingNumber,
      date,
      lecturerId,
      topic,
      content,
      priority,
      tags
    };

    if (id) {
      // Update existing summary
      this.db.updateSummary(id, summary);
    } else {
      // Add new summary
      this.db.addSummary(summary);
    }

    // Close modal and refresh the view
    $('#summaryModal').modal('hide');
    this.loadSummaries();
    this.updateFilterOptions();
  }

  viewSummary(id) {
    const summary = this.db.getSummaryById(id);
    if (!summary) return;

    this.currentViewSummary = summary;

    // Populate the view modal
    const course = this.db.getCourseById(summary.courseId);
    const lecturer = this.db.getLecturerById(summary.lecturerId);
    
    $('#viewSummaryModalTitle').text(summary.topic);
    $('#viewCourse').text(course ? course.name : 'N/A');
    $('#viewMeetingNumber').text(summary.meetingNumber || '-');
    $('#viewDate').text(new Date(summary.date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }));
    $('#viewLecturer').text(lecturer ? lecturer.name : 'N/A');
    $('#viewTopic').text(summary.topic);
    $('#viewPriority').html(`
      <span class="badge bg-${summary.priority === 'rendah' ? 'success' : summary.priority === 'sedang' ? 'warning text-dark' : 'danger'}">
        ${this.getPriorityLabel(summary.priority)}
      </span>
    `);
    $('#viewTags').html(
      summary.tags && summary.tags.length > 0 
        ? summary.tags.map(tag => `<span class="badge bg-primary me-1">${tag}</span>`).join('')
        : '<em>Tidak ada tag</em>'
    );
    $('#viewContent').html(summary.content);

    // Show the modal
    $('#viewSummaryModal').modal('show');
  }

  deleteCurrentSummary() {
    if (this.currentViewSummary) {
      if (confirm('Apakah Anda yakin ingin menghapus ringkasan ini?')) {
        this.db.deleteSummary(this.currentViewSummary.id);
        $('#viewSummaryModal').modal('hide');
        this.loadSummaries();
        this.updateFilterOptions();
      }
    }
  }

  exportCurrentSummary() {
    if (this.currentViewSummary) {
      // Create a markdown representation of the summary
      const course = this.db.getCourseById(this.currentViewSummary.courseId) || { name: 'N/A' };
      const lecturer = this.db.getLecturerById(this.currentViewSummary.lecturerId) || { name: 'N/A' };
      
      // Convert HTML content to markdown-like plain text
      const parser = new DOMParser();
      const doc = parser.parseFromString(this.currentViewSummary.content, 'text/html');
      const plainText = doc.body.textContent || doc.body.innerText || '';
      
      const markdownContent = `# ${this.currentViewSummary.topic}

**Mata Kuliah:** ${course.name}
**Pertemuan Ke:** ${this.currentViewSummary.meetingNumber || '-'}
**Tanggal:** ${new Date(this.currentViewSummary.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}
**Dosen:** ${lecturer.name}
**Prioritas:** ${this.getPriorityLabel(this.currentViewSummary.priority)}
**Tags:** ${this.currentViewSummary.tags ? this.currentViewSummary.tags.join(', ') : ''}

---

${plainText}
`;

      // Create and download the file
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.currentViewSummary.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  showAddCourseModal() {
    $('#courseId').val('');
    $('#courseName').val('');
    $('#courseModal').modal('show');
  }

  saveCourse() {
    const id = $('#courseId').val();
    const name = $('#courseName').val();

    if (!name) {
      alert('Silakan masukkan nama mata kuliah!');
      return;
    }

    const course = { name };

    if (id) {
      this.db.updateCourse(parseInt(id), course);
    } else {
      this.db.addCourse(course);
    }

    $('#courseModal').modal('hide');
    this.loadCourses();
    this.updateFilterOptions();
  }

  deleteCourse(id) {
    if (confirm('Apakah Anda yakin ingin menghapus mata kuliah ini? Semua ringkasan terkait juga akan dihapus.')) {
      this.db.deleteCourse(parseInt(id));
      this.loadCourses();
      this.loadSummaries();
      this.updateFilterOptions();
    }
  }

  showAddLecturerModal() {
    $('#lecturerId').val('');
    $('#lecturerName').val('');
    $('#lecturerModal').modal('show');
  }

  saveLecturer() {
    const id = $('#lecturerId').val();
    const name = $('#lecturerName').val();

    if (!name) {
      alert('Silakan masukkan nama dosen!');
      return;
    }

    const lecturer = { name };

    if (id) {
      this.db.updateLecturer(parseInt(id), lecturer);
    } else {
      this.db.addLecturer(lecturer);
    }

    $('#lecturerModal').modal('hide');
    this.loadLecturers();
    this.updateFilterOptions();
  }

  deleteLecturer(id) {
    if (confirm('Apakah Anda yakin ingin menghapus dosen ini? Semua ringkasan terkait juga akan dihapus.')) {
      this.db.deleteLecturer(parseInt(id));
      this.loadLecturers();
      this.loadSummaries();
      this.updateFilterOptions();
    }
  }

  exportAllData() {
    const data = this.db.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lecture_notes_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  showImportModal() {
    $('#importModal').modal('show');
  }

  importData() {
    const fileInput = $('#importFile')[0];
    if (fileInput.files.length === 0) {
      alert('Silakan pilih file untuk diimpor!');
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target.result);
        
        // Check if it's in the old format (if it has summaries, courses, lecturers as arrays of strings/values)
        if (parsedData.summaries && parsedData.courses && parsedData.lecturers) {
          // Convert the imported data to the new format
          const convertedData = this.db.convertOldFormatToNew(parsedData);
          this.db.data = convertedData;
          this.db.saveData();
          alert('Data berhasil diimpor dan dikonversi!');
        } else {
          // If it's already in the new format, just save it
          this.db.data = parsedData;
          this.db.saveData();
          alert('Data berhasil diimpor!');
        }
        
        $('#importModal').modal('hide');
        this.loadCourses();
        this.loadLecturers();
        this.loadSummaries();
        this.updateFilterOptions();
      } catch (error) {
        alert('Gagal mengimpor data. Pastikan file JSON valid. Error: ' + error.message);
      }
    };
    
    reader.readAsText(file);
  }

  resetData() {
    if (confirm('Apakah Anda yakin ingin menghapus semua data dan mengembalikan ke kondisi awal? Tindakan ini tidak dapat dibatalkan.')) {
      this.db.resetData();
      this.loadCourses();
      this.loadLecturers();
      this.loadSummaries();
      this.updateFilterOptions();
    }
  }
}

// Initialize the application
const app = new App();
