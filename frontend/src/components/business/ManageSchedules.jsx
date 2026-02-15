import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../index';
import { User, ArrowLeft, Save, CheckCircle, Calendar } from 'lucide-react';
import '../business/style/ManageSchedules.css';

const ManageSchedules = () => {
    const { businessId } = useParams();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [schedule, setSchedule] = useState({});
    const [, setLoading] = useState(false);

    const days = ["E diel", "E hënë", "E martë", "E mërkurë", "E enjte", "E premte", "E shtunë"];

    useEffect(() => {
        api.get('/owner/business/my-business').then(res => setEmployees(res.data.employees || []));
    }, [businessId]);

    const fetchSchedule = async (emp) => {
        setLoading(true);
        try {
            const res = await api.get(`/owner/schedules/employee/${businessId}/${emp.id}`);
            const map = {};
            if (Array.isArray(res.data)) res.data.forEach(d => map[d.day_of_week] = d);
            setSchedule(map);
            setSelectedEmployee(emp);
        } finally { setLoading(false); }
    };

    if (!selectedEmployee) {
        return (
            <div className="schedule-container">
                <header className="page-intro">
                    <h1>Oraret e Punës</h1>
                    <p>Zgjidhni një punonjës për të modifikuar orarin javor.</p>
                </header>
                <div className="employee-grid">
                    {employees.map(emp => (
                        <div key={emp.id} className="employee-card" onClick={() => fetchSchedule(emp)}>
                            <div className="emp-avatar"><User size={28} /></div>
                            <h3>{emp.name} {emp.surname}</h3>
                            <span className="badge-blue">Shiko Orarin</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="schedule-container">
            <button className="btn-back" onClick={() => setSelectedEmployee(null)}>
                <ArrowLeft size={18} /> Kthehu te lista
            </button>

            <div className="active-user-bar">
                <div className="icon-box-blue"><Calendar size={24} color="white" /></div>
                <div>
                    <h2>{selectedEmployee.name} {selectedEmployee.surname}</h2>
                    <p>Përcaktoni orët hyrje-dalje</p>
                </div>
            </div>

            <div className="schedule-rows-wrapper">
                {days.map((day, idx) => (
                    <ScheduleRow 
                        key={idx} 
                        dayName={day} 
                        data={schedule[idx] || { is_off: true, open_at: '09:00', close_at: '17:00' }} 
                        onUpdate={(updatedData) => {
                            return api.post('/owner/set-schedule', { 
                                ...updatedData, 
                                business_id: businessId, 
                                employee_id: selectedEmployee.id, 
                                day_of_week: idx 
                            });
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

const ScheduleRow = ({ dayName, data, onUpdate }) => {
    const [val, setVal] = useState(data);
    const [status, setStatus] = useState('idle');

    const handleSave = async () => {
        setStatus('saving');
        try {
            await onUpdate(val);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (e) {
            setStatus('idle');
            alert("Gabim!");
        }
    };

    return (
        <div className={`schedule-item ${val.is_off ? 'off' : 'on'}`}>
            <div className="day-section">
                <span className="name-of-day">{dayName}</span>
                <button 
                    className={`status-toggle ${val.is_off ? 'is-off' : 'is-on'}`}
                    onClick={() => setVal({...val, is_off: !val.is_off})}
                >
                    {val.is_off ? 'Pushim' : 'Punë'}
                </button>
            </div>

            {!val.is_off && (
                <div className="time-section">
                    <div className="input-group">
                        <label>Hyrja</label>
                        <input type="time" value={val.open_at?.substring(0,5)} onChange={e => setVal({...val, open_at: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <label>Dalja</label>
                        <input type="time" value={val.close_at?.substring(0,5)} onChange={e => setVal({...val, close_at: e.target.value})} />
                    </div>
                </div>
            )}

            <button className={`btn-save-blue ${status}`} onClick={handleSave} disabled={status === 'saving'}>
                {status === 'success' ? <CheckCircle size={18} /> : <Save size={18} />}
                <span>{status === 'success' ? 'U ruajt' : 'Ruaj'}</span>
            </button>
        </div>
    );
};

export default ManageSchedules;