"use client";

import Header from "@/components/layout/Header"
import WorkspaceSideBar from "@/components/layout/WorkspaceSideBar"
import { useSidebar } from "@/context/SidebarContext"

const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
    const { isLeftSidebarCollapsed, toggleLeftSidebar } = useSidebar();

    // Helper to close sidebar on mobile
    const closeSidebar = () => {
        if (!isLeftSidebarCollapsed) {
            toggleLeftSidebar();
        }
    };

    return (
        <div className='flex flex-col w-full h-screen bg-[#FAFBFF] text-xs relative overflow-hidden'>
            <Header />
            <div className='flex h-full w-full relative'>
                {/* Desktop Sidebar */}
                <div className={`hidden md:block h-full transition-all duration-300 ${isLeftSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
                    <WorkspaceSideBar />
                </div>

                {/* Mobile Drawer Sidebar */}
                <div 
                    className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isLeftSidebarCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
                >
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={toggleLeftSidebar}
                    />
                    {/* Drawer Content */}
                    <div className={`absolute inset-y-0 left-0 w-64 bg-white transform transition-transform duration-300 ${isLeftSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
                        <WorkspaceSideBar onClose={closeSidebar} />
                    </div>
                </div>

                <main className='flex-1 overflow-y-auto p-4 md:p-8 bg-[#FAFBFF] w-full'>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default WorkspaceLayout