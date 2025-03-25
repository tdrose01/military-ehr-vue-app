import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import PatientList from '@/views/PatientList.vue'
import { patientService } from '@/services/api'

// Mock the patient service
jest.mock('@/services/api', () => ({
  patientService: {
    getAll: jest.fn()
  }
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/patients', name: 'PatientList', component: { template: '<div></div>' } },
    { path: '/patients/:id', name: 'PatientView', component: { template: '<div></div>' } }
  ]
})

describe('PatientList.vue', () => {
  let wrapper

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mountComponent = (options = {}) => {
    wrapper = mount(PatientList, {
      global: {
        plugins: [router],
        stubs: ['router-link', 'router-view']
      },
      ...options
    })
  }

  const mockPatients = [
    { id: 1, firstName: 'John', lastName: 'Doe', service: 'army', rank: 'e-5' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', service: 'navy', rank: 'o-3' }
  ]

  test('displays loading state when loading patients', async () => {
    patientService.getAll.mockResolvedValue([])
    mountComponent()
    
    expect(wrapper.find('.loading-patients').exists()).toBe(true)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick() // Double tick to ensure all promises resolve
  })

  test('displays patients when loaded', async () => {
    patientService.getAll.mockResolvedValue(mockPatients)
    mountComponent()
    
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    expect(patientService.getAll).toHaveBeenCalled()
    expect(wrapper.find('.loading-patients').exists()).toBe(false)
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(2)
    
    const firstRow = rows[0]
    expect(firstRow.text()).toContain('John')
    expect(firstRow.text()).toContain('Doe')
  })

  test('handles filtering by service', async () => {
    patientService.getAll.mockResolvedValue(mockPatients)
    mountComponent()
    
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    // Set service filter
    await wrapper.setData({ 
      filters: { service: 'army', rank: '' }
    })
    
    // Apply filters
    await wrapper.vm.applyFilters()
    
    // Check filtered display
    const displayedPatients = wrapper.vm.patientsToDisplay
    expect(displayedPatients.length).toBe(1)
    expect(displayedPatients[0].firstName).toBe('John')
  })

  test('handles filtering by rank', async () => {
    patientService.getAll.mockResolvedValue(mockPatients)
    mountComponent()
    
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    // Set rank filter
    await wrapper.setData({ 
      filters: { service: '', rank: 'o-3' }
    })
    
    // Apply filters
    await wrapper.vm.applyFilters()
    
    // Check filtered display
    const displayedPatients = wrapper.vm.patientsToDisplay
    expect(displayedPatients.length).toBe(1)
    expect(displayedPatients[0].firstName).toBe('Jane')
  })

  test('handles search functionality', async () => {
    patientService.getAll.mockResolvedValue(mockPatients)
    mountComponent()
    
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    // Set search term
    await wrapper.setData({ searchTerm: 'Jane' })
    
    // Apply search
    await wrapper.vm.searchPatients()
    
    // Check filtered display
    const displayedPatients = wrapper.vm.patientsToDisplay
    expect(displayedPatients.length).toBe(1)
    expect(displayedPatients[0].firstName).toBe('Jane')
  })

  test('handles error when loading patients', async () => {
    console.error = jest.fn()
    patientService.getAll.mockRejectedValue(new Error('Failed to load patients'))
    
    mountComponent()
    
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    expect(console.error).toHaveBeenCalled()
    expect(wrapper.vm.error).toBe(true)
    expect(wrapper.find('.alert-danger').exists()).toBe(true)
  })

  test('handles patient selection', async () => {
    patientService.getAll.mockResolvedValue(mockPatients)
    mountComponent()
    
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    // Select a patient
    await wrapper.vm.toggleSelectPatient(mockPatients[0])
    
    expect(wrapper.vm.selectedPatients).toContain(mockPatients[0].id)
    
    // Deselect the patient
    await wrapper.vm.toggleSelectPatient(mockPatients[0])
    
    expect(wrapper.vm.selectedPatients).not.toContain(mockPatients[0].id)
  })

  test('handles pagination', async () => {
    // Create more mock data for pagination testing
    const manyPatients = Array(25).fill().map((_, i) => ({
      id: i + 1,
      firstName: `First${i}`,
      lastName: `Last${i}`,
      service: i % 2 === 0 ? 'army' : 'navy',
      rank: i % 3 === 0 ? 'e-5' : 'o-3'
    }))
    
    patientService.getAll.mockResolvedValue(manyPatients)
    mountComponent()
    
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.patients.length).toBe(25)
    expect(wrapper.vm.totalPages).toBeGreaterThan(1)
    
    // First page
    expect(wrapper.vm.currentPage).toBe(1)
    let displayed = wrapper.vm.patientsToDisplay
    expect(displayed.length).toBeLessThanOrEqual(wrapper.vm.perPage)
    
    // Go to next page
    await wrapper.vm.goToPage(2)
    expect(wrapper.vm.currentPage).toBe(2)
    displayed = wrapper.vm.patientsToDisplay
    expect(displayed.length).toBeLessThanOrEqual(wrapper.vm.perPage)
    expect(displayed[0].id).toBeGreaterThan(wrapper.vm.perPage)
  })
})