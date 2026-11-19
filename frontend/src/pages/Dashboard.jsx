import { useAuth } from '../context/AuthContext.jsx';
import UserDashboard from './dashboards/UserDashboard.jsx';
import CollectorDashboard from './dashboards/CollectorDashboard.jsx';
import AdminDashboard from './dashboards/AdminDashboard.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  if (user.role === 'collector') return <CollectorDashboard />;
  if (user.role === 'admin') return <AdminDashboard />;
  return <UserDashboard />;
}
