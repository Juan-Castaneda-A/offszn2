import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  BiGridFill, 
  BiDiscFill, 
  BiCloudArrowUpFill, 
  BiFileEarmarkMusicFill, 
  BiTicketPerforatedFill, 
  BiPeopleFill, 
  BiMortarboardFill, 
  BiBarChartFill, 
  BiCameraReelsFill, 
  BiRocketTakeoffFill 
} from 'react-icons/bi';
import logo from '../assets/images/LOGO-OFFSZN.png'; // Asegúrate de tener la ruta correcta

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-black text-white font-inter flex">
      {/* --- FONDO RADIAL GLOW (CSS original migrado) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none"
           style={{
             background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08), transparent 70%)'
           }}
      />

      {/* --- SIDEBAR --- */}
      <Sidebar />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-[80px] p-10 relative z-10">
        {/* Aquí se renderizarán las páginas hijas (Overview, Settings, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}

// --- SUB-COMPONENTE: SIDEBAR ---
function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed top-0 left-0 h-screen w-[80px] bg-black border-r border-[#1A1A1A] z-50 flex flex-col items-center py-5 gap-2">
      
      {/* LOGO */}
      <Link to="/" className="w-11 h-11 flex items-center justify-center mb-2">
        <img src={logo} alt="OFFSZN" className="w-9 mix-blend-screen" />
      </Link>

      {/* --- GRUPO 1: GESTIÓN --- */}
      <Divider />
      <SidebarItem to="/dashboard" icon={<BiGridFill />} label="Dashboard" active={isActive('/dashboard')} />
      <SidebarItem to="/dashboard/kits" icon={<BiDiscFill />} label="Mis Kits" active={isActive('/dashboard/kits')} />
      <SidebarItem to="/dashboard/upload" icon={<BiCloudArrowUpFill />} label="Subir" active={isActive('/dashboard/upload')} />

      {/* --- GRUPO 2: NEGOCIO --- */}
      <Divider />
      <SidebarItem to="/dashboard/licencias" icon={<BiFileEarmarkMusicFill />} label="Licencias" active={isActive('/dashboard/licencias')} />
      <SidebarItem to="/dashboard/cupones" icon={<BiTicketPerforatedFill />} label="Cupones" active={isActive('/dashboard/cupones')} />
      <SidebarItem to="/dashboard/collab" icon={<BiPeopleFill />} label="Colaboraciones" active={isActive('/dashboard/collab')} />

      {/* --- GRUPO 3: ACADEMIA --- */}
      <Divider />
      <SidebarItem to="/dashboard/cursos" icon={<BiMortarboardFill />} label="Cursos" active={isActive('/dashboard/cursos')} />
      <SidebarItem to="/dashboard/analytics" icon={<BiBarChartFill />} label="Estadísticas" active={isActive('/dashboard/analytics')} />

      {/* --- GRUPO 4: SOCIAL --- */}
      <Divider />
      <SidebarItem to="/dashboard/reels" icon={<BiCameraReelsFill />} label="Reels" active={isActive('/dashboard/reels')} />

      {/* --- UPGRADE (ROCKET) --- */}
      <div className="mt-auto">
        <Link 
          to="/dashboard/planes" 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#FFD700] bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.2)] hover:scale-105 hover:bg-[rgba(255,215,0,0.2)] hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all duration-200 relative group"
        >
          <BiRocketTakeoffFill size={20} />
          {/* Tooltip personalizado */}
          <span className="absolute left-[70px] bg-[#111] border border-[#333] text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50 font-medium">
            Mejorar Plan
          </span>
        </Link>
      </div>
    </aside>
  );
}

// --- HELPER COMPONENTS ---

function SidebarItem({ to, icon, label, active }) {
  return (
    <Link 
      to={to} 
      className={`
        w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-200 relative group
        ${active 
          ? 'bg-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' 
          : 'text-[#666] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
        }
      `}
    >
      {icon}
      
      {/* Tooltip flotante (CSS based logic replica) */}
      <span className="absolute left-[70px] bg-[#111] border border-[#333] text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50 font-medium">
        {label}
      </span>
    </Link>
  );
}

function Divider() {
  return <div className="w-10 border-b border-[#222] my-1.5 opacity-50"></div>;
}