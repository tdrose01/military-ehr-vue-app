<template>
  <div class="patient-list-container">
    <div class="page-header">
      <h1>Patient List</h1>
      <div class="actions">
        <button class="btn btn-primary" @click="$router.push('/patients/new')">
          <i class="fas fa-plus"></i> Add Patient
        </button>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Search patients..."
          @keyup.enter="searchPatients"
        />
        <button class="btn btn-sm" @click="searchPatients">
          <i class="fas fa-search"></i>
        </button>
      </div>

      <div class="filters">
        <select
          v-model="filters.service"
          aria-label="Filter by service"
          class="form-select"
        >
          <option value="">All Services</option>
          <option value="army">Army</option>
          <option value="navy">Navy</option>
          <option value="air force">Air Force</option>
          <option value="marines">Marines</option>
          <option value="coast guard">Coast Guard</option>
          <option value="space force">Space Force</option>
        </select>

        <select
          v-model="filters.rank"
          aria-label="Filter by rank"
          class="form-select"
        >
          <option value="">All Ranks</option>
          <option value="e-1">E-1</option>
          <option value="e-2">E-2</option>
          <option value="e-3">E-3</option>
          <option value="e-4">E-4</option>
          <option value="e-5">E-5</option>
          <option value="e-6">E-6</option>
          <option value="e-7">E-7</option>
          <option value="e-8">E-8</option>
          <option value="e-9">E-9</option>
          <option value="o-1">O-1</option>
          <option value="o-2">O-2</option>
          <option value="o-3">O-3</option>
          <option value="o-4">O-4</option>
          <option value="o-5">O-5</option>
          <option value="o-6">O-6</option>
          <option value="o-7">O-7</option>
          <option value="o-8">O-8</option>
          <option value="o-9">O-9</option>
          <option value="o-10">O-10</option>
        </select>

        <button class="btn btn-primary" @click="applyFilters">Apply Filters</button>
        <button class="btn btn-outline-secondary" @click="clearFilters">
          Clear Filters
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">
      Error loading patients. Please try again later.
    </div>

    <div v-if="loading" class="loading-patients">
      <div class="spinner"></div>
      <span>Loading patients...</span>
    </div>

    <div v-else-if="patients.length === 0" class="no-patients">
      <p>No patients found. Please add a patient or adjust your search filters.</p>
    </div>

    <div v-else class="patient-table-container">
      <table class="patient-table">
        <thead>
          <tr>
            <th class="checkbox-column">
              <input
                type="checkbox"
                :checked="selectAll"
                @change="toggleSelectAll"
              />
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Service</th>
            <th>Rank</th>
            <th>Last Visit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in patientsToDisplay" :key="patient.id">
            <td>
              <input
                type="checkbox"
                :checked="selectedPatients.includes(patient.id)"
                @change="toggleSelectPatient(patient)"
              />
            </td>
            <td>{{ patient.id }}</td>
            <td>
              <router-link :to="'/patients/' + patient.id">
                {{ patient.firstName }} {{ patient.lastName }}
              </router-link>
            </td>
            <td>
              <span class="badge service-badge" :class="'service-' + patient.service.toLowerCase().replace(' ', '-')">
                {{ capitalizeFirst(patient.service) }}
              </span>
            </td>
            <td>{{ patient.rank.toUpperCase() }}</td>
            <td>{{ formatDate(patient.lastVisit) }}</td>
            <td>
              <span class="badge" :class="getStatusClass(patient.status)">
                {{ patient.status || 'Unknown' }}
              </span>
            </td>
            <td class="actions-column">
              <router-link
                :to="'/patients/' + patient.id"
                class="btn btn-sm btn-primary"
                title="View"
              >
                <i class="fas fa-eye"></i>
              </router-link>
              <router-link
                :to="'/patients/' + patient.id + '/edit'"
                class="btn btn-sm btn-secondary"
                title="Edit"
              >
                <i class="fas fa-edit"></i>
              </router-link>
              <button
                class="btn btn-sm btn-danger"
                title="Delete"
                @click="confirmDelete(patient)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination-controls">
        <button
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          class="btn btn-sm"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          :disabled="currentPage === totalPages || totalPages === 0"
          @click="goToPage(currentPage + 1)"
          class="btn btn-sm"
        >
          Next
        </button>
      </div>
    </div>

    <div v-if="selectedPatients.length > 0" class="bulk-actions">
      <span>{{ selectedPatients.length }} patients selected</span>
      <button class="btn btn-secondary" @click="$router.push('/records/new?bulk=true')">
        Add Record
      </button>
      <button class="btn btn-danger" @click="confirmBulkDelete">
        Delete Selected
      </button>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button class="close-btn" @click="showDeleteModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete
            {{ bulkDeleteMode ? 'the selected patients' : 'this patient' }}?
            This action cannot be undone.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteModal = false">
            Cancel
          </button>
          <button class="btn btn-danger" @click="deleteConfirmed">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { patientService } from '@/services/api'

export default {
  name: 'PatientList',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // State
    const patients = ref([])
    const loading = ref(true)
    const error = ref(false)
    const searchTerm = ref('')
    const filters = reactive({
      service: '',
      rank: ''
    })
    const currentPage = ref(1)
    const perPage = ref(10)
    const selectedPatients = ref([])
    const patientToDelete = ref(null)
    const showDeleteModal = ref(false)
    const bulkDeleteMode = ref(false)
    
    // Computed properties
    const totalPages = computed(() => {
      return Math.ceil(filteredPatients.value.length / perPage.value)
    })
    
    const filteredPatients = computed(() => {
      let result = [...patients.value]
      
      // Apply search filter
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        result = result.filter(patient => 
          patient.firstName.toLowerCase().includes(term) ||
          patient.lastName.toLowerCase().includes(term) ||
          (patient.firstName + ' ' + patient.lastName).toLowerCase().includes(term) ||
          (patient.id.toString().includes(term))
        )
      }
      
      // Apply service filter
      if (filters.service) {
        result = result.filter(patient => 
          patient.service && patient.service.toLowerCase() === filters.service.toLowerCase()
        )
      }
      
      // Apply rank filter
      if (filters.rank) {
        result = result.filter(patient => 
          patient.rank && patient.rank.toLowerCase() === filters.rank.toLowerCase()
        )
      }
      
      return result
    })
    
    const patientsToDisplay = computed(() => {
      const start = (currentPage.value - 1) * perPage.value
      return filteredPatients.value.slice(start, start + perPage.value)
    })
    
    const selectAll = computed(() => {
      return patientsToDisplay.value.length > 0 && 
        patientsToDisplay.value.every(patient => 
          selectedPatients.value.includes(patient.id)
        )
    })
    
    // Methods
    const loadPatients = async () => {
      loading.value = true
      error.value = false
      
      try {
        const data = await patientService.getAll()
        patients.value = data.map(patient => ({
          ...patient,
          lastVisit: patient.lastVisit || new Date().toISOString().split('T')[0],
          status: patient.status || 'Active'
        }))
      } catch (err) {
        console.error('Error loading patients:', err)
        error.value = true
      } finally {
        loading.value = false
      }
    }
    
    const searchPatients = () => {
      currentPage.value = 1
    }
    
    const applyFilters = () => {
      currentPage.value = 1
    }
    
    const clearFilters = () => {
      searchTerm.value = ''
      filters.service = ''
      filters.rank = ''
      currentPage.value = 1
    }
    
    const goToPage = (page) => {
      currentPage.value = page
    }
    
    const toggleSelectPatient = (patient) => {
      const index = selectedPatients.value.indexOf(patient.id)
      if (index >= 0) {
        selectedPatients.value.splice(index, 1)
      } else {
        selectedPatients.value.push(patient.id)
      }
    }
    
    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedPatients.value = selectedPatients.value.filter(id => 
          !patientsToDisplay.value.some(patient => patient.id === id)
        )
      } else {
        patientsToDisplay.value.forEach(patient => {
          if (!selectedPatients.value.includes(patient.id)) {
            selectedPatients.value.push(patient.id)
          }
        })
      }
    }
    
    const confirmDelete = (patient) => {
      patientToDelete.value = patient
      bulkDeleteMode.value = false
      showDeleteModal.value = true
    }
    
    const confirmBulkDelete = () => {
      bulkDeleteMode.value = true
      showDeleteModal.value = true
    }
    
    const deleteConfirmed = async () => {
      try {
        if (bulkDeleteMode.value) {
          // Delete multiple patients
          // This would normally call the API in a loop or with a bulk endpoint
          for (const id of selectedPatients.value) {
            await patientService.delete(id)
          }
          selectedPatients.value = []
        } else {
          // Delete single patient
          await patientService.delete(patientToDelete.value.id)
        }
        
        // Reload the patient list
        await loadPatients()
        
      } catch (err) {
        console.error('Error deleting patient(s):', err)
        error.value = true
      } finally {
        showDeleteModal.value = false
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    const getStatusClass = (status) => {
      if (!status) return 'status-unknown'
      
      switch (status.toLowerCase()) {
        case 'active':
          return 'status-active'
        case 'inactive':
          return 'status-inactive'
        case 'pending':
          return 'status-pending'
        case 'discharged':
          return 'status-discharged'
        default:
          return 'status-unknown'
      }
    }
    
    const capitalizeFirst = (str) => {
      if (!str) return ''
      return str.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }
    
    // Lifecycle hooks
    onMounted(() => {
      loadPatients()
    })
    
    return {
      patients,
      loading,
      error,
      searchTerm,
      filters,
      currentPage,
      perPage,
      selectedPatients,
      patientToDelete,
      showDeleteModal,
      bulkDeleteMode,
      totalPages,
      patientsToDisplay,
      selectAll,
      loadPatients,
      searchPatients,
      applyFilters,
      clearFilters,
      goToPage,
      toggleSelectPatient,
      toggleSelectAll,
      confirmDelete,
      confirmBulkDelete,
      deleteConfirmed,
      formatDate,
      getStatusClass,
      capitalizeFirst
    }
  }
}
</script>

<style scoped>
.patient-list-container {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-size: 1.8rem;
  margin: 0;
  color: #333;
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: rgba(0, 200, 190, 0.1);
  border-radius: 0.5rem;
  border-left: 4px solid #00c8be;
}

.search-box {
  display: flex;
  flex: 1;
  min-width: 300px;
}

.search-box input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
}

.search-box button {
  border-radius: 0 4px 4px 0;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.form-select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 150px;
}

.patient-table-container {
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.patient-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.patient-table th,
.patient-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.patient-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.patient-table tr:hover {
  background-color: rgba(0, 200, 190, 0.05);
}

.checkbox-column {
  width: 40px;
}

.actions-column {
  width: 120px;
  white-space: nowrap;
}

.actions-column .btn {
  margin-right: 0.25rem;
}

.badge {
  padding: 0.375rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.service-badge {
  background-color: #f8f9fa;
  color: #495057;
}

.service-army {
  background-color: #4b5320;
  color: white;
}

.service-navy {
  background-color: #1a3c6e;
  color: white;
}

.service-air-force {
  background-color: #0078ae;
  color: white;
}

.service-marines {
  background-color: #9c1a1c;
  color: white;
}

.service-coast-guard {
  background-color: #e35205;
  color: white;
}

.service-space-force {
  background-color: #333366;
  color: white;
}

.status-active {
  background-color: #28a745;
  color: white;
}

.status-inactive {
  background-color: #6c757d;
  color: white;
}

.status-pending {
  background-color: #ffc107;
  color: #212529;
}

.status-discharged {
  background-color: #17a2b8;
  color: white;
}

.status-unknown {
  background-color: #f8f9fa;
  color: #495057;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  gap: 0.5rem;
}

.page-info {
  padding: 0 1rem;
}

.bulk-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-top: 1px solid #ddd;
  padding: 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.bulk-actions span {
  font-weight: 500;
}

.bulk-actions button {
  margin-left: 0.5rem;
}

.loading-patients,
.no-patients {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 123, 255, 0.2);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s infinite linear;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #eee;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .patient-table th:nth-child(2),
  .patient-table td:nth-child(2),
  .patient-table th:nth-child(5),
  .patient-table td:nth-child(5),
  .patient-table th:nth-child(6),
  .patient-table td:nth-child(6) {
    display: none;
  }
  
  .filters-bar {
    flex-direction: column;
  }
}
</style>