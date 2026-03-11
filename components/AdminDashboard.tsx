import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { HOSPITALS } from '../constants';

// Mock data for bookings
const MOCK_BOOKINGS = [
  { id: '1', name: '김철수', phone: '010-1234-5678', hospital: '지브이의원', date: '2024-03-11', status: 'confirmed' },
  { id: '2', name: '이영희', phone: '010-2345-6789', hospital: '쉬즈힐의원', date: '2024-03-11', status: 'pending' },
  { id: '3', name: '박지민', phone: '010-3456-7890', hospital: '셀피아의원', date: '2024-03-12', status: 'confirmed' },
  { id: '4', name: '최수연', phone: '010-4567-8901', hospital: '채움한방병원', date: '2024-03-12', status: 'cancelled' },
  { id: '5', name: '정우성', phone: '010-5678-9012', hospital: '지브이의원', date: '2024-03-13', status: 'pending' },
];

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bookings');

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-right border-[#E5E7EB] flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">MediAdmin</span>
          </div>

          <nav className="space-y-1">
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

        <div className="mt-auto p-6 border-top border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-sm font-bold">관리자</p>
              <p className="text-xs text-gray-500">osec0521@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-bottom border-[#E5E7EB] flex items-center justify-between px-8">
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
                { label: '전체 예약', value: '128', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: '대기 중', value: '12', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: '확정됨', value: '110', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: '취소됨', value: '6', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                      <stat.icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+12%</span>
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
                  <tr className="bg-gray-50/50 border-bottom border-[#E5E7EB]">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">예약자</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">연락처</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">신청 병원</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">예약 날짜</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {MOCK_BOOKINGS.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {booking.name[0]}
                          </div>
                          <span className="font-semibold">{booking.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{booking.phone}</td>
                      <td className="px-6 py-4 text-sm font-medium">{booking.hospital}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{booking.date}</td>
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
                        <button className="text-gray-400 hover:text-primary transition-colors">
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 bg-gray-50/50 border-top border-[#E5E7EB] flex items-center justify-between">
                <p className="text-sm text-gray-500">Showing 5 of 128 results</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-[#E5E7EB] rounded-md text-sm hover:bg-white transition-all">이전</button>
                  <button className="px-3 py-1 border border-[#E5E7EB] rounded-md text-sm hover:bg-white transition-all">다음</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
