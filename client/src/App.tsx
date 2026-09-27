import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { FamilyMembers } from './pages/FamilyMembers';
import { MemberDetail } from './pages/MemberDetail';
import { MedicinesList } from './pages/MedicinesList';
import { Adherence } from './pages/Adherence';
import { Login } from './pages/Login';
import { AddMemberModal } from './components/AddMemberModal';
import { AddMedicineModal } from './components/AddMedicineModal';
import type { FamilyMember, Medicine } from './types';
import { api } from './services/api';

const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  // Modal states
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);

  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [editMedicine, setEditMedicine] = useState<Medicine | null>(null);
  const [selectedMemberIdForMed, setSelectedMemberIdForMed] = useState<string | undefined>(undefined);

  const [members, setMembers] = useState<FamilyMember[]>([]);

  const fetchMembers = async () => {
    try {
      const data = await api.getMembers();
      setMembers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMembers();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EAF6F6] via-[#E2F1F8] to-[#E0F0FF]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-700">Loading MediCare Family...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleMemberSubmit = async (data: any) => {
    if (editMember) {
      await api.updateMember(editMember.id, data);
      showToast('success', 'Member Updated', `${data.name}'s profile was updated.`);
    } else {
      await api.createMember(data);
      showToast('success', 'Member Added', `${data.name} was added to the family.`);
    }
    await fetchMembers();
  };

  const handleMedicineSubmit = async (data: any) => {
    if (editMedicine) {
      await api.updateMedicine(editMedicine.id, data);
      showToast('success', 'Medicine Updated', `Schedule for ${data.name} was updated.`);
    } else {
      await api.createMedicine(data);
      showToast('success', 'Medicine Added', `${data.name} was scheduled with daily timings.`);
    }
    await fetchMembers();
  };

  const openAddMedicine = (memberId?: string) => {
    setEditMedicine(null);
    setSelectedMemberIdForMed(memberId);
    setIsMedicineModalOpen(true);
  };

  const openEditMedicine = (med: Medicine) => {
    setEditMedicine(med);
    setSelectedMemberIdForMed(med.memberId);
    setIsMedicineModalOpen(true);
  };

  const openAddMember = () => {
    setEditMember(null);
    setIsMemberModalOpen(true);
  };

  const openEditMember = (member: FamilyMember) => {
    setEditMember(member);
    setIsMemberModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar
        onOpenAddMember={openAddMember}
        onOpenAddMedicine={() => openAddMedicine()}
      />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        <Sidebar />

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <Dashboard
                      onOpenAddMedicine={() => openAddMedicine()}
                      onOpenAddMember={openAddMember}
                    />
                  }
                />
                <Route
                  path="/members"
                  element={
                    <FamilyMembers
                      onOpenAddMember={openAddMember}
                      onEditMember={openEditMember}
                    />
                  }
                />
                <Route
                  path="/members/:id"
                  element={
                    <MemberDetail
                      onOpenAddMedicineForMember={(mId) => openAddMedicine(mId)}
                      onEditMedicine={openEditMedicine}
                    />
                  }
                />
                <Route
                  path="/medicines"
                  element={
                    <MedicinesList
                      onOpenAddMedicine={() => openAddMedicine()}
                      onEditMedicine={openEditMedicine}
                    />
                  }
                />
                <Route path="/adherence" element={<Adherence />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global Modals */}
      <AddMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditMember(null);
        }}
        onSubmit={handleMemberSubmit}
        editMember={editMember}
      />

      <AddMedicineModal
        isOpen={isMedicineModalOpen}
        onClose={() => {
          setIsMedicineModalOpen(false);
          setEditMedicine(null);
        }}
        onSubmit={handleMedicineSubmit}
        members={members}
        selectedMemberId={selectedMemberIdForMed}
        editMedicine={editMedicine}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
