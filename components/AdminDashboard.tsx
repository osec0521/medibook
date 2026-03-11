import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  Search, 
  Bell, 
  MoreVertical,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  LogOut,
  Home
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useFirebase } from '../FirebaseContext';
import { useNavigate, Link } from 'react-router-dom';

interface Booking {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  loginEmail?: string;
  hospitalName: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { user, role, loading, logout } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      navigate('/');
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (!user || role !== 'admin') return;

    const path = 'bookings';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      setBookings(bookingData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user, role]);

  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    const path = `bookings/${id}`;
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteBooking = async (id: string) => {
    const path = `bookings/${id}`;
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading || !user || role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">MediAdmin</span>
          </div>

          <nav className="space-y-1">
            <Link 
              to="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-500 hover:bg-gray-50"
            >
              <Home size={20} />
              <span>메인 페이지</span>
            </Link>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutDashboard size={20} />
              <span>대시보드</span>
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Calendar size={20} />
              <span>예약 관리</span>
            </button>
            <button 
              onClick={() => setActiveTab('hospitals')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'hospitals' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Users size={20} />
              <span>병원 관리</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Settings size={20} />
              <span>설정</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} alt="Admin" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="text-sm font-bold truncate w-24">{user.displayName || '관리자'}</p>
                <p className="text-xs text-gray-500 truncate w-24">{user.email}</p>
              </div>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="검색어를 입력하세요..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">예약 관리</h2>
                <p className="text-gray-500">전체 예약 현황을 확인하고 관리하세요.</p>
              </div>
              <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                <span>엑셀 다운로드</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {[
                { label: '전체 예약', value: stats.total, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: '대기 중', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: '확정됨', value: stats.confirmed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: '취소됨', value: stats.cancelled, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-[#E5E7EB]">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">예약자</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">연락처</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">이메일</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">로그인 계정</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">신청 병원</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">등록 날짜</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {booking.fullName[0]}
                          </div>
                          <span className="font-semibold">{booking.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{booking.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{booking.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{booking.loginEmail || '-'}</td>
                      <td className="px-6 py-4 text-sm font-medium">{booking.hospitalName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(booking.createdAt).toLocaleDateString('ko-KR')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                          booking.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {booking.status === 'confirmed' ? '확정' : booking.status === 'pending' ? '대기' : '취소'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateStatus(booking.id, 'confirmed')}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="확정"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <button 
                                onClick={() => updateStatus(booking.id, 'cancelled')}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="취소"
                              >
                                <AlertCircle size={18} />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => deleteBooking(booking.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                            title="삭제"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        예약 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="px-6 py-4 bg-gray-50/50 border-t border-[#E5E7EB] flex items-center justify-between">
                <p className="text-sm text-gray-500">Showing {bookings.length} results</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
