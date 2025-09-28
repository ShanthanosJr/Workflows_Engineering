import http from './http'
export const listSchedules = (params={}) => http.get('/inspections/schedules', { params }).then(r=>r.data)
export const createSchedule = (payload) => http.post('/inspections/schedules', payload).then(r=>r.data)
export const updateSchedule = (id, payload) => http.patch(`/inspections/schedules/${id}`, payload).then(r=>r.data)
export const postResult = (id, payload, files=[]) => {
  const form = new FormData()
  Object.entries(payload).forEach(([k,v])=>form.append(k,v))
  files.forEach(f=>form.append('attachments', f))
  return http.post(`/inspections/${id}/result`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r=>r.data)
}
export const getAlerts = () => http.get('/inspections/alerts').then(r=>r.data)
