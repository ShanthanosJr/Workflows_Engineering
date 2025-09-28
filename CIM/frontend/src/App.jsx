import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Login from './auth/Login'
import Register from './auth/Register'
import { listSchedules, createSchedule, postResult, getAlerts } from './api/inspections'
import { listComplaints, createComplaint, updateComplaint, getByTicket } from './api/complaints'
import { getCompliance, getRecurring, getComplaintStats, recompute } from './api/analytics'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

/** A boundary that resets when its key changes */
class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state={ hasError:false, err:null }; }
  static getDerivedStateFromError(err){ return { hasError:true, err }; }
  componentDidCatch(err, info){ console.error('Render error', err, info); }
  render(){
    if(this.state.hasError){
      return (
        <div className='container py-5'>
          <div className='alert alert-danger'>Something went wrong. Please refresh.</div>
        </div>
      )
    }
    return this.props.children
  }
}

/** Local boundary just for charts (Recharts can throw during layout) */
function ChartBoundary({ children }){
  return <ErrorBoundary key={Math.random()}>{children}</ErrorBoundary>
}

function decodeJWT(token){
  try{
    const b64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')
    const json = atob(b64)
    return JSON.parse(json)
  }catch{ return null }
}

const Card = ({ icon, title, value, sub }) => (
  <div className="col-md-3 mb-3">
    <div className="card card-cta">
      <div className="card-body d-flex align-items-center">
        <i className={`fa-solid ${icon} text-primary fs-3 me-2`}></i>
        <div>
          <div className="fw-semibold">{title}</div>
          <div className="fs-4 fw-bold">{value}</div>
          <div className="text-secondary small">{sub}</div>
        </div>
      </div>
    </div>
  </div>
)

function Dashboard(){
  const [stats, setStats] = useState({ total:0, upcoming:0, overdue:0, completed:0 })
  const [trend, setTrend] = useState([])
  const [complaintStats, setComplaintStats] = useState({ byType:[], byStatus:[] })
  useEffect(()=>{ getAlerts().then(setStats); getCompliance({}).then(setTrend); getComplaintStats().then(setComplaintStats) },[])
  const go = (p) => { const t = `#/${p}`; if (location.hash !== t) location.hash = t }

  return (
    <div className="container py-4">
      <div className="row">
        <Card icon="fa-calendar-check" title="Total" value={stats.total} sub="All inspections"/>
        <Card icon="fa-bell" title="Upcoming (24h)" value={stats.upcoming} sub="Reminders due"/>
        <Card icon="fa-triangle-exclamation" title="Overdue" value={stats.overdue} sub="Action needed"/>
        <Card icon="fa-clipboard-check" title="Completed" value={stats.completed} sub="Done"/>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Compliance Trend</strong>
              <button className="btn btn-sm btn-outline-primary" onClick={()=>recompute().then(()=>getCompliance({}).then(setTrend))}>
                <i className="fa-solid fa-rotate me-1"></i>Refresh
              </button>
            </div>
            <div className="card-body" style={{height:320}}>
              <ChartBoundary>
                {trend && trend.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={d=>new Date(d.date).toLocaleDateString()} />
                      <YAxis domain={[0,100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#0d6efd" strokeWidth={3}/>
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div className="text-secondary">No data yet.</div>}
              </ChartBoundary>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-header"><strong>Complaint Types</strong></div>
            <div className="card-body" style={{height:160}}>
              <ChartBoundary>
                {complaintStats.byType?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={complaintStats.byType.map(x=>({ type:x._id, count:x.count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0d6efd" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="text-secondary">No data yet.</div>}
              </ChartBoundary>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><strong>Complaint Status</strong></div>
            <div className="card-body" style={{height:160}}>
              <ChartBoundary>
                {complaintStats.byStatus?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={complaintStats.byStatus.map(x=>({ status:x._id, count:x.count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#198754" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="text-secondary">No data yet.</div>}
              </ChartBoundary>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-3">
        <button className="btn btn-primary me-2" onClick={()=>go('Inspections')}>
          <i className="fa-solid fa-list-check me-2"></i>Go to Inspections
        </button>
        <button className="btn btn-outline-secondary" onClick={()=>go('Complaints')}>
          <i className="fa-solid fa-message me-2"></i>Open Chatbot
        </button>
      </div>
    </div>
  )
}

function Inspections({ user }){
  const [list, setList] = useState([])
  const [form, setForm] = useState({ project:'', area:'', inspector:'', dueAt:'', notes:'' })
  const refresh = () => listSchedules().then(setList)
  useEffect(refresh,[])
  const submit = (e) => { e.preventDefault(); if(!form.area || !form.inspector || !form.dueAt) return alert('Fill required fields'); createSchedule(form).then(()=>{ setForm({ project:'', area:'', inspector:'', dueAt:'', notes:'' }); refresh() }) }
  const complete = (id, outcome) => postResult(id, { outcome, score: outcome==='PASS'?100:60 }).then(refresh)

  return (
    <div className="container py-4">
      {user?.role==='ADMIN' ? (
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header"><strong>Create Inspection Schedule</strong></div>
            <div className="card-body">
              <form onSubmit={submit}>
                <div className="mb-2"><label className="form-label">Project</label><input className="form-control" value={form.project} onChange={e=>setForm({...form, project:e.target.value})}/></div>
                <div className="mb-2"><label className="form-label">Area</label><input className="form-control" value={form.area} onChange={e=>setForm({...form, area:e.target.value})}/></div>
                <div className="mb-2"><label className="form-label">Inspector</label><input className="form-control" value={form.inspector} onChange={e=>setForm({...form, inspector:e.target.value})}/></div>
                <div className="mb-2"><label className="form-label">Due At</label><input type="datetime-local" className="form-control" value={form.dueAt} onChange={e=>setForm({...form, dueAt:e.target.value})}/></div>
                <div className="mb-3"><label className="form-label">Notes</label><textarea className="form-control" rows="2" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})}></textarea></div>
                <button className="btn btn-primary w-100"><i className="fa-solid fa-floppy-disk me-2"></i>Save</button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card">
            <div className="card-header"><strong>Schedules</strong></div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light"><tr><th>Project</th><th>Area</th><th>Inspector</th><th>Due</th><th>Status</th><th>Result</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {list.map(row => (
                    <tr key={row._id}>
                      <td>{row.project}</td>
                      <td>{row.area}</td>
                      <td>{row.inspector}</td>
                      <td>{new Date(row.dueAt).toLocaleString()}</td>
                      <td><span className={`status-${row.status}`}>{row.status}</span></td>
                      <td>{row?.result?.outcome || '-'}</td>
                      <td className="text-end">
                        {row.status!=='COMPLETED' && <>
                          <button className="btn btn-sm btn-success me-1" onClick={()=>complete(row._id,'PASS')}><i className="fa-solid fa-check"></i></button>
                          <button className="btn btn-sm btn-danger" onClick={()=>complete(row._id,'FAIL')}><i className="fa-solid fa-xmark"></i></button>
                        </>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>) : (
        <div className="alert alert-info">Worker role: You can view schedules and log complaints via the Complaints page.</div>
      )}
    </div>
  )
}

function Chatbot({ onClose, onSubmitted }){
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ area:'', type:'', complainant:'', description:'', photoUrl:'' })
  const submit = () => { if(!form.area || !form.description) return alert('Area and description required'); createComplaint(form).then(()=>{ onSubmitted(); onClose(); }) }
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100" style={{background:'rgba(0,0,0,.4)'}}>
      <div className="position-absolute bottom-0 end-0 m-3" style={{width:360}}>
        <div className="card shadow-lg">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong><i className="fa-solid fa-robot me-2"></i>Smart Complaint Chatbot</strong>
            <button className="btn btn-sm btn-outline-secondary" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="card-body">
            {step===1 && <>
              <div className="mb-2"><label className="form-label">Project/Area</label><input className="form-control" value={form.area} onChange={e=>setForm({...form, area:e.target.value})}/></div>
              <div className="mb-3">
                <label className="form-label">Type</label>
                <div className="d-flex gap-2">
                  {['SAFETY','QUALITY','DELAY','OTHER'].map(t=> <button key={t} type="button" className={`btn btn-sm ${form.type===t?'btn-primary':'btn-outline-primary'}`} onClick={()=>setForm({...form, type:t})}>{t}</button>)}
                </div>
              </div>
              <button className="btn btn-primary w-100" onClick={()=>setStep(2)}>Next</button>
            </>}
            {step===2 && <>
              <div className="mb-2"><label className="form-label">Your Name/ID</label><input className="form-control" value={form.complainant} onChange={e=>setForm({...form, complainant:e.target.value})}/></div>
              <div className="mb-2"><label className="form-label">Description</label><textarea className="form-control" rows="3" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}></textarea></div>
              <div className="mb-3"><label className="form-label">Image URL (optional)</label><input className="form-control" value={form.photoUrl} onChange={e=>setForm({...form, photoUrl:e.target.value})}/></div>
              <button className="btn btn-success w-100" onClick={submit}><i className="fa-solid fa-paper-plane me-2"></i>Submit</button>
            </>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Complaints(){
  const [list, setList] = useState([])
  const [showBot, setShowBot] = useState(false)
  const [trackId, setTrackId] = useState('')
  const [tracked, setTracked] = useState(null)
  const refresh = () => listComplaints().then(setList)
  useEffect(refresh,[])
  const setStatus = (id, status) => updateComplaint(id, { status }).then(refresh)
  const track = () => getByTicket(trackId).then(setTracked).catch(()=>setTracked(null))

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0"><i className="fa-solid fa-clipboard-list me-2"></i>Complaints</h5>
        <div>
          <div className="input-group input-group-sm me-2" style={{width:260, display:'inline-flex'}}>
            <input className="form-control" placeholder="Track by ticket (e.g., CMP-2025-0001)" value={trackId} onChange={e=>setTrackId(e.target.value)}/>
            <button className="btn btn-outline-secondary" onClick={track}><i className="fa-solid fa-magnifying-glass"></i></button>
          </div>
          <button className="btn btn-primary" onClick={()=>setShowBot(true)}><i className="fa-solid fa-message me-2"></i>Log via Chatbot</button>
        </div>
      </div>
      {tracked && <div className="alert alert-info">Complaint <strong>{tracked.ticket}</strong> is currently <strong>{tracked.status}</strong>.</div>}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light"><tr><th>Ticket</th><th>Area</th><th>Type</th><th>Status</th><th>Assignee</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
            {list.map(c=>(
              <tr key={c._id}>
                <td className="fw-semibold">{c.ticket}</td>
                <td>{c.area}</td>
                <td>{c.type}</td>
                <td><span className={`status-${c.status}`}>{c.status}</span>{c.escalated && <span className="badge text-bg-danger ms-2">Escalated</span>}</td>
                <td>{c.assignee}</td>
                <td className="text-end">
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-secondary" onClick={()=>setStatus(c._id,'IN_PROGRESS')}>In-Progress</button>
                    <button className="btn btn-outline-success" onClick={()=>setStatus(c._id,'RESOLVED')}>Resolve</button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
      {showBot && <Chatbot onClose={()=>setShowBot(false)} onSubmitted={refresh} />}
    </div>
  )
}

export default function App(){
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user')
      if (u) return JSON.parse(u)
      const t = localStorage.getItem('token')
      const dec = t ? decodeJWT(t) : null
      return dec ? { role: dec.role, name: dec.name } : null
    } catch { return null }
  })
  const readPage = () => { const h = (location.hash||'').replace(/^#\//,''); return ['Dashboard','Inspections','Complaints','Analytics','Login'].includes(h) ? h : 'Dashboard' }
  const [page, setPage] = useState(readPage())

  useEffect(()=>{ const onHash=()=>setPage(readPage()); window.addEventListener('hashchange', onHash); return ()=>window.removeEventListener('hashchange', onHash) },[])
  useEffect(()=>{ try{ if(user) localStorage.setItem('user', JSON.stringify(user)); }catch{} },[user])

  const logout = () => { try{ localStorage.removeItem('token'); localStorage.removeItem('user'); }catch{}; setUser(null); location.hash = '#/Login' }

  if(!user || page==='Login')
    return <ErrorBoundary key="login"><Login onLoggedIn={setUser} /><div className="text-center mt-2"><Register /></div></ErrorBoundary>

  // ⬇️ Keyed boundary resets on page change
  return (
    <ErrorBoundary key={page}>
      <Navbar page={page} user={user} onLogout={logout} />
      {page==='Dashboard' && <Dashboard />}
      {page==='Inspections' && <Inspections user={user} />}
      {page==='Complaints' && <Complaints />}
      {page==='Analytics' && <Analytics />}
    </ErrorBoundary>
  )
}

function Analytics(){
  const [trend, setTrend] = useState([])
  const [recurring, setRecurring] = useState([])
  useEffect(()=>{ getCompliance({}).then(setTrend); getRecurring({}).then(setRecurring) },[])

  return (
    <div className="container py-4">
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between">
          <strong>Compliance Trend</strong>
          <button className="btn btn-sm btn-outline-primary" onClick={()=>recompute().then(()=>getCompliance({}).then(setTrend))}>
            <i className="fa-solid fa-rotate me-1"></i>Refresh
          </button>
        </div>
        <div className="card-body" style={{height:320}}>
          <ChartBoundary>
            {trend && trend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={d=>new Date(d.date).toLocaleDateString()} />
                  <YAxis domain={[0,100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#0d6efd" strokeWidth={3}/>
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="text-secondary">No data yet.</div>}
          </ChartBoundary>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><strong>Recurring Issues (fails by area)</strong></div>
        <div className="table-responsive">
          <table className="table mb-0">
            <thead className="table-light"><tr><th>Area</th><th>Fails</th></tr></thead>
            <tbody>{recurring.map(r=>(<tr key={r.area}><td>{r.area}</td><td>{r.fails}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
