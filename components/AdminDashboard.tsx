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
  Home,
  FlaskConical,
  ChevronLeft,
  Eye,
  Trash2,
  Filter,
  Download,
  X
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useFirebase } from '../FirebaseContext';
import { useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

interface Booking {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  loginEmail?: string;
  hospitalName: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  tenantId: string;
  createdAt: string;
}

interface Partner {
  id: string;
  name: string;
  tenantId: string;
  adminEmail: string;
  seoTitle: string;
  displayTitle: string;
  kakaoLink?: string;
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'booking' | 'partner'} | null>(null);
  const [isTestMenuOpen, setIsTestMenuOpen] = useState(false);
  const [isPartnerMenuOpen, setIsPartnerMenuOpen] = useState(false);
  const [showDummyModal, setShowDummyModal] = useState(false);
  const [showDummyPartnerModal, setShowDummyPartnerModal] = useState(false);
  const [showPartnerExcelModal, setShowPartnerExcelModal] = useState(false);
  const [partnerExcelConfig, setPartnerExcelConfig] = useState({ type: 'all', year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [dummyCount, setDummyCount] = useState(10);
  const [saveToFirestore, setSaveToFirestore] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // New States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchType, setSearchType] = useState('fullName');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearch, setAppliedSearch] = useState({ type: 'fullName', keyword: '' });
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('all');
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelConfig, setExcelConfig] = useState({ type: 'all', year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPartnerDetailModal, setShowPartnerDetailModal] = useState(false);
  const [showPartnerEditModal, setShowPartnerEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);

  const [newPartner, setNewPartner] = useState<Partial<Partner>>({
    name: '',
    tenantId: '',
    adminEmail: '',
    seoTitle: '',
    displayTitle: '신라웰케어 120세 건강 지킴이 메디컬 및 웰니스 센터를 찾아 예약하세요',
    kakaoLink: ''
  });

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
      const bookingData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Migration: If tenantId is missing or 'default', treat as empty string and update DB
        if (data.tenantId === undefined || data.tenantId === 'default') {
          updateDoc(doc.ref, { tenantId: '' }).catch(err => console.error("Migration error:", err));
        }
        return {
          id: doc.id,
          ...data,
          tenantId: data.tenantId || ''
        } as Booking;
      });
      setBookings(bookingData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user, role]);

  useEffect(() => {
    if (!user || role !== 'admin') return;

    const path = 'partners';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const partnerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Partner[];
      setPartners(partnerData);
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

  const deleteBooking = (id: string) => {
    setItemToDelete({ id, type: 'booking' });
    setShowConfirm(true);
  };

  const deletePartner = (id: string) => {
    setItemToDelete({ id, type: 'partner' });
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    const path = `${itemToDelete.type === 'booking' ? 'bookings' : 'partners'}/${itemToDelete.id}`;
    try {
      await deleteDoc(doc(db, itemToDelete.type === 'booking' ? 'bookings' : 'partners', itemToDelete.id));
      setShowConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const generateDummyBookings = async () => {
    if (dummyCount <= 0) return;
    setIsGenerating(true);
    
    const hospitals = ['서울대학교병원', '세브란스병원', '삼성서울병원', '아산병원', '서울성모병원'];
    const names = ['김철수', '이영희', '박지민', '최동욱', '정수연', '강하늘', '윤서준', '임지우', '한예슬', '오지호'];
    const statuses: ('pending' | 'confirmed' | 'cancelled')[] = ['pending', 'confirmed', 'cancelled'];

    const newDummies: Booking[] = [];
    const tenantIds = partners.length > 0 ? partners.map(p => p.tenantId) : ['default'];

    try {
      for (let i = 0; i < dummyCount; i++) {
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomHospital = hospitals[Math.floor(Math.random() * hospitals.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomTenantId = tenantIds[Math.floor(Math.random() * tenantIds.length)];
        
        const dummyData = {
          fullName: `${randomName}${Math.floor(Math.random() * 100)}`,
          phone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          email: `test${Math.floor(Math.random() * 1000)}@example.com`,
          loginEmail: `user${Math.floor(Math.random() * 1000)}@gmail.com`,
          hospitalName: randomHospital,
          date: new Date(Date.now() + Math.random() * 1000000000).toISOString().split('T')[0],
          status: randomStatus,
          tenantId: randomTenantId,
          createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
        };

        if (saveToFirestore) {
          await addDoc(collection(db, 'bookings'), dummyData);
        } else {
          newDummies.push({
            id: `temp-${Math.random().toString(36).substr(2, 9)}`,
            ...dummyData
          } as Booking);
        }
      }

      if (!saveToFirestore) {
        setBookings(prev => [...newDummies, ...prev]);
      }
      
      setShowDummyModal(false);
    } catch (error) {
      console.error("Error generating dummy data:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDummyPartners = async () => {
    if (dummyCount <= 0) return;
    setIsGenerating(true);
    
    try {
      const newDummies: Partner[] = [];
      for (let i = 0; i < dummyCount; i++) {
        const tenantId = `tenant-${Math.random().toString(36).substr(2, 5)}`;
        const dummyData = {
          name: `파트너 ${Math.floor(Math.random() * 1000)}`,
          tenantId: tenantId,
          adminEmail: `admin-${tenantId}@gmail.com`,
          seoTitle: `SEO Title for ${tenantId}`,
          displayTitle: '신라웰케어 120세 건강 지킴이 메디컬 및 웰니스 센터를 찾아 예약하세요',
          kakaoLink: 'https://pf.kakao.com/_example',
          createdAt: new Date().toISOString()
        };
        
        if (saveToFirestore) {
          await addDoc(collection(db, 'partners'), dummyData);
        } else {
          newDummies.push({
            id: `temp-${Math.random().toString(36).substr(2, 9)}`,
            ...dummyData
          } as Partner);
        }
      }

      if (!saveToFirestore) {
        setPartners(prev => [...newDummies, ...prev]);
      }
      
      setShowDummyPartnerModal(false);
    } catch (error) {
      console.error("Error generating dummy partners:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegisterPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name || !newPartner.tenantId || !newPartner.adminEmail) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    try {
      await addDoc(collection(db, 'partners'), {
        ...newPartner,
        createdAt: new Date().toISOString()
      });
      alert('파트너가 등록되었습니다.');
      setActiveTab('partnerList');
      setNewPartner({
        name: '',
        tenantId: '',
        adminEmail: '',
        seoTitle: '',
        displayTitle: '신라웰케어 120세 건강 지킴이 메디컬 및 웰니스 센터를 찾아 예약하세요',
        kakaoLink: ''
      });
    } catch (error) {
      console.error("Error registering partner:", error);
      alert('파트너 등록 중 오류가 발생했습니다.');
    }
  };

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;

    try {
      const { id, ...updateData } = selectedPartner;
      if (id === 'hq-virtual') {
        await addDoc(collection(db, 'partners'), {
          ...updateData,
          tenantId: '',
          createdAt: new Date().toISOString()
        });
      } else {
        await updateDoc(doc(db, 'partners', id), updateData);
      }
      alert('파트너 정보가 수정되었습니다.');
      setShowPartnerEditModal(false);
      setSelectedPartner(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'partners');
      alert('파트너 수정 중 오류가 발생했습니다.');
    }
  };

  // Filtering Logic
  const filteredBookings = bookings.filter(booking => {
    // Partner Filter
    const bTenantId = booking.tenantId || '';
    const sPartnerId = selectedPartnerId === 'default' ? '' : selectedPartnerId;
    
    if (selectedPartnerId !== 'all' && bTenantId !== sPartnerId) return false;

    // Status Filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;

    // Search Filter
    if (appliedSearch.keyword) {
      const value = booking[appliedSearch.type as keyof Booking]?.toString().toLowerCase() || '';
      if (!value.includes(appliedSearch.keyword.toLowerCase())) return false;
    }

    return true;
  });

  // Paging Logic
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearch = () => {
    setAppliedSearch({ type: searchType, keyword: searchKeyword });
    setCurrentPage(1);
  };

  const handleExcelDownload = () => {
    let dataToExport = filteredBookings;

    if (excelConfig.type === 'period') {
      dataToExport = bookings.filter(b => {
        const date = new Date(b.createdAt);
        return date.getFullYear() === excelConfig.year && (date.getMonth() + 1) === excelConfig.month;
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport.map((b, i) => ({
      '번호': dataToExport.length - i,
      '파트너': b.tenantId === 'default' || !b.tenantId ? '본사' : (partners.find(p => p.tenantId === b.tenantId)?.name || b.tenantId),
      '예약자': b.fullName,
      '연락처': b.phone,
      '이메일': b.email,
      '로그인계정': b.loginEmail || '-',
      '병원명': b.hospitalName,
      '예약일': b.date,
      '상태': b.status === 'confirmed' ? '확정' : b.status === 'pending' ? '대기' : '취소',
      '등록일': new Date(b.createdAt).toLocaleString()
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, `MediBook_Export_${new Date().getTime()}.xlsx`);
    setShowExcelModal(false);
  };

  const handlePartnerExcelDownload = () => {
    let dataToExport = partners;

    if (partnerExcelConfig.type === 'period') {
      dataToExport = partners.filter(p => {
        const date = new Date(p.createdAt);
        return date.getFullYear() === partnerExcelConfig.year && (date.getMonth() + 1) === partnerExcelConfig.month;
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport.map((p, i) => ({
      '번호': dataToExport.length - i,
      '파트너명': p.name,
      '테넌트 ID': p.tenantId,
      '관리자 이메일': p.adminEmail,
      'SEO 제목': p.seoTitle,
      '표시 타이틀': p.displayTitle,
      '카카오톡 링크': p.kakaoLink || '-',
      '등록일': new Date(p.createdAt).toLocaleString()
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Partners");
    XLSX.writeFile(workbook, `MediBook_Partners_${new Date().getTime()}.xlsx`);
    setShowPartnerExcelModal(false);
  };

  const openDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
    setActiveMenuId(null);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 8, left: rect.right - 128 });
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  if (loading || !user || role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    total: filteredBookings.length,
    pending: filteredBookings.filter(b => b.status === 'pending').length,
    confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
    cancelled: filteredBookings.filter(b => b.status === 'cancelled').length,
  };

  const renderContent = () => {
    if (activeTab === 'bookings' || activeTab === 'dashboard') {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">예약 관리</h2>
              <p className="text-gray-500">전체 예약 현황을 확인하고 관리하세요.</p>
            </div>
            <button 
              onClick={() => setShowExcelModal(true)}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
            >
              <Download size={18} />
              <span>엑셀 다운로드</span>
            </button>
          </div>

          {/* Partner Selector */}
          <div className="mb-8 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Users size={20} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">파트너 선택</label>
                <select 
                  value={selectedPartnerId}
                  onChange={(e) => {
                    setSelectedPartnerId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent border-none text-lg font-bold focus:ring-0 p-0 cursor-pointer"
                >
                  <option value="all">전체 파트너 보기</option>
                  {partners.filter(p => p.tenantId && p.tenantId !== 'default').map(partner => (
                    <option key={partner.id} value={partner.tenantId}>{partner.name} ({partner.tenantId})</option>
                  ))}
                  <option value="default">본사 (default)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              { id: 'all', label: '전체 예약', value: stats.total, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
              { id: 'pending', label: '대기 중', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              { id: 'confirmed', label: '확정됨', value: stats.confirmed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { id: 'cancelled', label: '취소됨', value: stats.cancelled, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
            ].map((stat, i) => (
              <button 
                key={i} 
                onClick={() => {
                  setStatusFilter(stat.id as any);
                  setCurrentPage(1);
                }}
                className={`text-left bg-white p-6 rounded-2xl border transition-all hover:shadow-md ${statusFilter === stat.id ? 'border-primary ring-2 ring-primary/10' : 'border-[#E5E7EB] shadow-sm'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                    <stat.icon size={20} />
                  </div>
                  {statusFilter === stat.id && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                </div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 px-3 cursor-pointer"
              >
                <option value="fullName">예약자</option>
                <option value="phone">연락처</option>
                <option value="email">이메일</option>
                <option value="loginEmail">로그인계정</option>
              </select>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="검색어를 입력하세요..." 
                  className="w-full pl-9 pr-4 py-1.5 bg-transparent border-none text-sm focus:ring-0"
                />
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/10"
            >
              확인
            </button>
            
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
              <Filter size={14} />
              <span>필터링된 결과: <span className="font-bold text-primary">{totalItems}</span>건</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-[#E5E7EB]">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">번호</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">파트너</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">예약자</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">연락처</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">이메일</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">로그인 계정</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">신청 병원</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">등록 일</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {paginatedBookings.map((booking, index) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                      {totalItems - ((currentPage - 1) * pageSize) - index}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary">
                          {booking.tenantId === 'default' || !booking.tenantId ? '본사' : (partners.find(p => p.tenantId === booking.tenantId)?.name || booking.tenantId)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{booking.tenantId || 'default'}</span>
                      </div>
                    </td>
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
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>{new Date(booking.createdAt).toLocaleDateString('ko-KR')}</span>
                        <span className="text-[10px] text-gray-400">{new Date(booking.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                        booking.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {booking.status === 'confirmed' ? '확정' : booking.status === 'pending' ? '대기' : '취소'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
                          <button 
                            onClick={() => updateStatus(booking.id, 'confirmed')}
                            className={`p-1.5 rounded-lg transition-colors ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                            title="확정으로 변경"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => updateStatus(booking.id, 'cancelled')}
                            className={`p-1.5 rounded-lg transition-colors ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                            title="취소로 변경"
                          >
                            <AlertCircle size={18} />
                          </button>
                        </div>
                        
                        <div className="relative">
                          <button 
                            onClick={(e) => toggleMenu(e, booking.id)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {activeMenuId === booking.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-[100]" 
                                onClick={() => setActiveMenuId(null)}
                              ></div>
                              <div 
                                className="fixed w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[110] animate-in fade-in zoom-in-95 duration-100"
                                style={{ top: menuPosition?.top, left: menuPosition?.left }}
                              >
                                <button 
                                  onClick={() => openDetail(booking)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                                >
                                  <Eye size={16} />
                                  <span>상세보기</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    deleteBooking(booking.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={16} />
                                  <span>삭제</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedBookings.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-[#E5E7EB] flex items-center justify-between">
              <p className="text-sm text-gray-500">
                전체 <span className="font-bold text-gray-900">{totalItems}</span>개 중 
                <span className="font-bold text-gray-900"> {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)}</span> 표시
              </p>
              
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${currentPage === page ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'partnerRegister') {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">파트너 등록</h2>
            <p className="text-gray-500">새로운 파트너를 시스템에 등록합니다.</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8 max-w-2xl">
            <form onSubmit={handleRegisterPartner} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">파트너 이름 *</label>
                  <input 
                    type="text" 
                    required
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                    placeholder="예: 메디컬 센터"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">파트너 아이디 (tenant_id) *</label>
                  <input 
                    type="text" 
                    required
                    value={newPartner.tenantId}
                    onChange={(e) => setNewPartner({ ...newPartner, tenantId: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="예: medical-center"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">URL 경로로 사용됩니다: domain.com/tenant_id</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">관리자 이메일 (지메일) *</label>
                <input 
                  type="email" 
                  required
                  value={newPartner.adminEmail}
                  onChange={(e) => setNewPartner({ ...newPartner, adminEmail: e.target.value })}
                  placeholder="admin@gmail.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">페이지 제목 (SEO) *</label>
                <input 
                  type="text" 
                  required
                  value={newPartner.seoTitle}
                  onChange={(e) => setNewPartner({ ...newPartner, seoTitle: e.target.value })}
                  placeholder="예: 메디컬 센터 예약 시스템"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">타이틀명 (프론트 표시) *</label>
                <textarea 
                  required
                  value={newPartner.displayTitle}
                  onChange={(e) => setNewPartner({ ...newPartner, displayTitle: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">카카오톡 링크 주소</label>
                <input 
                  type="url" 
                  value={newPartner.kakaoLink}
                  onChange={(e) => setNewPartner({ ...newPartner, kakaoLink: e.target.value })}
                  placeholder="https://pf.kakao.com/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                  파트너 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (activeTab === 'partnerList') {
      const regularPartners = partners.filter(p => p.tenantId && p.tenantId !== 'default');
      const hqPartner = partners.find(p => !p.tenantId || p.tenantId === 'default') || {
        id: 'hq-virtual',
        name: '본사',
        tenantId: '',
        adminEmail: '',
        seoTitle: 'MediBook - Medical & Wellness Booking',
        displayTitle: '신라웰케어 120세 건강 지킴이 메디컬 및 웰니스 센터를 찾아 예약하세요',
        createdAt: new Date().toISOString()
      } as Partner;

      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">파트너 목록</h2>
              <p className="text-gray-500">등록된 모든 파트너를 관리합니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowPartnerExcelModal(true)}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
              >
                <Download size={18} />
                <span>엑셀 다운로드</span>
              </button>
              <button 
                onClick={() => setActiveTab('partnerRegister')}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                <Users size={18} />
                <span>새 파트너 등록</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-[#E5E7EB]">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">파트너명</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">테넌트 ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">관리자 이메일</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">등록일</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {regularPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{partner.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-primary font-mono">{partner.tenantId}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{partner.adminEmail}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(partner.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                          <button 
                            onClick={(e) => toggleMenu(e, partner.id)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {activeMenuId === partner.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-[100]" 
                                onClick={() => setActiveMenuId(null)}
                              ></div>
                              <div 
                                className="fixed w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[110] animate-in fade-in zoom-in-95 duration-100"
                                style={{ top: menuPosition?.top, left: menuPosition?.left }}
                              >
                                <button 
                                  onClick={() => {
                                    setSelectedPartner(partner);
                                    setShowPartnerDetailModal(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                                >
                                  <Eye size={16} />
                                  <span>상세보기</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedPartner(partner);
                                    setShowPartnerEditModal(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                                >
                                  <Settings size={16} />
                                  <span>수정하기</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    deletePartner(partner.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={16} />
                                  <span>삭제</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Headquarters (Default) Partner Row */}
                <tr className="bg-gray-50/30 border-t-2 border-gray-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{hqPartner.name}</span>
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">Default</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono">{hqPartner.tenantId || '(empty)'}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{hqPartner.adminEmail || '시스템 기본값'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{hqPartner.id === 'hq-virtual' ? '-' : new Date(hqPartner.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                      <div className="relative">
                        <button 
                          onClick={(e) => toggleMenu(e, hqPartner.id)}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {activeMenuId === hqPartner.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-[100]" 
                              onClick={() => setActiveMenuId(null)}
                            ></div>
                            <div 
                              className="fixed w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[110] animate-in fade-in zoom-in-95 duration-100"
                              style={{ top: menuPosition?.top, left: menuPosition?.left }}
                            >
                              <button 
                                onClick={() => {
                                  setSelectedPartner(hqPartner);
                                  setShowPartnerDetailModal(true);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                              >
                                <Eye size={16} />
                                <span>상세보기</span>
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedPartner(hqPartner);
                                  setShowPartnerEditModal(true);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                              >
                                <Settings size={16} />
                                <span>수정하기</span>
                              </button>
                              {hqPartner.id !== 'hq-virtual' && (
                                <button 
                                  onClick={() => {
                                    deletePartner(hqPartner.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={16} />
                                  <span>삭제</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                {partners.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      등록된 파트너가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        준비 중인 메뉴입니다.
      </div>
    );
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

            <div className="space-y-1">
              <button 
                onClick={() => setIsPartnerMenuOpen(!isPartnerMenuOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-gray-500 hover:bg-gray-50`}
              >
                <div className="flex items-center gap-3">
                  <Users size={20} />
                  <span>파트너 관리</span>
                </div>
                <ChevronRight size={16} className={`transition-transform ${isPartnerMenuOpen ? 'rotate-90' : ''}`} />
              </button>
              
              {isPartnerMenuOpen && (
                <div className="pl-12 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={() => setActiveTab('partnerRegister')}
                    className={`w-full text-left py-2 text-sm transition-colors flex items-center gap-2 ${activeTab === 'partnerRegister' ? 'text-primary font-bold' : 'text-gray-500 hover:text-primary'}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'partnerRegister' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    파트너 등록
                  </button>
                  <button 
                    onClick={() => setActiveTab('partnerList')}
                    className={`w-full text-left py-2 text-sm transition-colors flex items-center gap-2 ${activeTab === 'partnerList' ? 'text-primary font-bold' : 'text-gray-500 hover:text-primary'}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'partnerList' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    파트너 목록
                  </button>
                </div>
              )}
            </div>

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

            <div className="space-y-1">
              <button 
                onClick={() => setIsTestMenuOpen(!isTestMenuOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-gray-500 hover:bg-gray-50`}
              >
                <div className="flex items-center gap-3">
                  <FlaskConical size={20} />
                  <span>테스트</span>
                </div>
                <ChevronRight size={16} className={`transition-transform ${isTestMenuOpen ? 'rotate-90' : ''}`} />
              </button>
              
              {isTestMenuOpen && (
                <div className="pl-12 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={() => setShowDummyModal(true)}
                    className="w-full text-left py-2 text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    더미 회원 추가
                  </button>
                  <button 
                    onClick={() => setShowDummyPartnerModal(true)}
                    className="w-full text-left py-2 text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    더미 파트너 추가
                  </button>
                </div>
              )}
            </div>
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
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-800">MediAdmin Dashboard</h1>
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
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="w-full">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="bg-red-50 p-2 rounded-full">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold">삭제 확인</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              정말 삭제하시겠습니까? <br/>
              {itemToDelete?.type === 'booking' ? '해당 예약 정보가 영구적으로 삭제됩니다.' : '해당 파트너 정보가 영구적으로 삭제됩니다.'}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowConfirm(false);
                  setItemToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                취소
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dummy Partner Modal */}
      {showDummyPartnerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <div className="bg-primary/10 p-2 rounded-full">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold">더미 파트너 생성</h3>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">
              생성할 더미 파트너의 숫자를 입력해주세요.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">생성 개수</label>
              <input 
                type="number" 
                value={dummyCount}
                onChange={(e) => setDummyCount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg"
                min="1"
                max="50"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={saveToFirestore}
                    onChange={(e) => setSaveToFirestore(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </div>
                <span className="text-sm font-semibold text-gray-600 group-hover:text-primary transition-colors">Firestore 저장</span>
              </label>
              <p className="text-[10px] text-gray-400 mt-2">
                {saveToFirestore 
                  ? "* 실제 데이터베이스에 저장되어 모든 관리자가 볼 수 있습니다." 
                  : "* 현재 브라우저 목록에만 임시로 추가됩니다. (새로고침 시 삭제)"}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                disabled={isGenerating}
                onClick={() => setShowDummyPartnerModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                취소
              </button>
              <button 
                disabled={isGenerating || dummyCount <= 0}
                onClick={generateDummyPartners}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    생성 중...
                  </>
                ) : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dummy Generation Modal */}
      {showDummyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <div className="bg-primary/10 p-2 rounded-full">
                <FlaskConical size={24} />
              </div>
              <h3 className="text-lg font-bold">더미 회원 생성</h3>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">
              생성할 더미 회원의 숫자를 입력해주세요. <br/>
              입력한 숫자만큼 예약 목록에 추가됩니다.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">생성 개수</label>
              <input 
                type="number" 
                value={dummyCount}
                onChange={(e) => setDummyCount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg"
                min="1"
                max="100"
              />
              <p className="text-[10px] text-gray-400 mt-2">* 최대 100개까지 한 번에 생성 가능합니다.</p>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={saveToFirestore}
                    onChange={(e) => setSaveToFirestore(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </div>
                <span className="text-sm font-semibold text-gray-600 group-hover:text-primary transition-colors">Firestore 저장</span>
              </label>
              <p className="text-[10px] text-gray-400 mt-2">
                {saveToFirestore 
                  ? "* 실제 데이터베이스에 저장되어 모든 관리자가 볼 수 있습니다." 
                  : "* 현재 브라우저 목록에만 임시로 추가됩니다. (새로고침 시 삭제)"}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                disabled={isGenerating}
                onClick={() => setShowDummyModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                취소
              </button>
              <button 
                disabled={isGenerating || dummyCount <= 0}
                onClick={generateDummyBookings}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    생성 중...
                  </>
                ) : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Download Modal */}
      {showExcelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <div className="bg-emerald-50 p-2 rounded-full">
                  <Download size={24} />
                </div>
                <h3 className="text-lg font-bold">엑셀 다운로드</h3>
              </div>
              <button onClick={() => setShowExcelModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setExcelConfig({ ...excelConfig, type: 'all' })}
                  className={`px-4 py-3 rounded-xl border font-semibold transition-all ${excelConfig.type === 'all' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  회원 목록 전체
                </button>
                <button 
                  onClick={() => setExcelConfig({ ...excelConfig, type: 'period' })}
                  className={`px-4 py-3 rounded-xl border font-semibold transition-all ${excelConfig.type === 'period' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  기간 설정
                </button>
              </div>

              {excelConfig.type === 'period' && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">년도</label>
                    <select 
                      value={excelConfig.year}
                      onChange={(e) => setExcelConfig({ ...excelConfig, year: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}년</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">월</label>
                    <select 
                      value={excelConfig.month}
                      onChange={(e) => setExcelConfig({ ...excelConfig, month: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}월</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowExcelModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                취소
              </button>
              <button 
                onClick={handleExcelDownload}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Excel Download Modal */}
      {showPartnerExcelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <div className="bg-emerald-50 p-2 rounded-full">
                  <Download size={24} />
                </div>
                <h3 className="text-lg font-bold">파트너 엑셀 다운로드</h3>
              </div>
              <button onClick={() => setShowPartnerExcelModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPartnerExcelConfig({ ...partnerExcelConfig, type: 'all' })}
                  className={`px-4 py-3 rounded-xl border font-semibold transition-all ${partnerExcelConfig.type === 'all' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  파트너 전체
                </button>
                <button 
                  onClick={() => setPartnerExcelConfig({ ...partnerExcelConfig, type: 'period' })}
                  className={`px-4 py-3 rounded-xl border font-semibold transition-all ${partnerExcelConfig.type === 'period' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  기간 설정
                </button>
              </div>

              {partnerExcelConfig.type === 'period' && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">년도</label>
                    <select 
                      value={partnerExcelConfig.year}
                      onChange={(e) => setPartnerExcelConfig({ ...partnerExcelConfig, year: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}년</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">월</label>
                    <select 
                      value={partnerExcelConfig.month}
                      onChange={(e) => setPartnerExcelConfig({ ...partnerExcelConfig, month: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}월</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowPartnerExcelModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                취소
              </button>
              <button 
                onClick={handlePartnerExcelDownload}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                  {selectedBooking.fullName[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedBooking.fullName}</h3>
                  <p className="text-gray-500 text-sm">예약 상세 정보</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">연락처</label>
                  <p className="font-semibold text-lg">{selectedBooking.phone}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">이메일</label>
                  <p className="font-semibold">{selectedBooking.email}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">로그인 계정</label>
                  <p className="font-semibold">{selectedBooking.loginEmail || '-'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">신청 병원</label>
                  <p className="font-semibold text-lg">{selectedBooking.hospitalName}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">예약 날짜</label>
                  <p className="font-semibold">{selectedBooking.date}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">등록 일시</label>
                  <p className="font-semibold">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500">현재 상태:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  selectedBooking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                  selectedBooking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedBooking.status === 'confirmed' ? '확정' : selectedBooking.status === 'pending' ? '대기' : '취소'}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    updateStatus(selectedBooking.id, 'confirmed');
                    setSelectedBooking({ ...selectedBooking, status: 'confirmed' });
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all"
                >
                  확정 처리
                </button>
                <button 
                  onClick={() => {
                    updateStatus(selectedBooking.id, 'cancelled');
                    setSelectedBooking({ ...selectedBooking, status: 'cancelled' });
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all"
                >
                  취소 처리
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Detail Modal */}
      {showPartnerDetailModal && selectedPartner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                  {selectedPartner.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedPartner.name}</h3>
                  <p className="text-gray-500 text-sm">파트너 상세 정보</p>
                </div>
              </div>
              <button onClick={() => {
                setShowPartnerDetailModal(false);
                setSelectedPartner(null);
              }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">테넌트 ID</label>
                  <p className="font-semibold text-lg">{selectedPartner.tenantId}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">관리자 이메일</label>
                  <p className="font-semibold">{selectedPartner.adminEmail}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">등록 일시</label>
                  <p className="font-semibold">{new Date(selectedPartner.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">SEO 제목</label>
                  <p className="font-semibold">{selectedPartner.seoTitle}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">표시 타이틀</label>
                  <p className="font-semibold text-sm">{selectedPartner.displayTitle}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">카카오톡 링크</label>
                  <p className="font-semibold text-sm break-all">
                    {selectedPartner.kakaoLink ? (
                      <a href={selectedPartner.kakaoLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {selectedPartner.kakaoLink}
                      </a>
                    ) : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setShowPartnerDetailModal(false);
                  setShowPartnerEditModal(true);
                }}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                수정하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Edit Modal */}
      {showPartnerEditModal && selectedPartner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                  {selectedPartner.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">파트너 정보 수정</h3>
                  <p className="text-gray-500 text-sm">{selectedPartner.name}</p>
                </div>
              </div>
              <button onClick={() => {
                setShowPartnerEditModal(false);
                setSelectedPartner(null);
              }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdatePartner} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">파트너 이름 *</label>
                  <input 
                    type="text" 
                    required
                    value={selectedPartner.name}
                    onChange={(e) => setSelectedPartner({ ...selectedPartner, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">파트너 아이디 (tenant_id) *</label>
                  <input 
                    type="text" 
                    required
                    disabled
                    value={selectedPartner.tenantId}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl outline-none cursor-not-allowed text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">관리자 이메일 (지메일) *</label>
                <input 
                  type="email" 
                  required
                  value={selectedPartner.adminEmail}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, adminEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">페이지 제목 (SEO) *</label>
                <input 
                  type="text" 
                  required
                  value={selectedPartner.seoTitle}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, seoTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">타이틀명 (프론트 표시) *</label>
                <textarea 
                  required
                  value={selectedPartner.displayTitle}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, displayTitle: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">카카오톡 링크 주소</label>
                <input 
                  type="url" 
                  value={selectedPartner.kakaoLink || ''}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, kakaoLink: e.target.value })}
                  placeholder="https://pf.kakao.com/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowPartnerEditModal(false);
                    setSelectedPartner(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                  수정 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
