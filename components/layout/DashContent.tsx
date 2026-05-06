"use client"
import React from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { useSidebar } from '@/context/SidebarContext'

const DashContent = ({ children }: { children: React.ReactNode }) => {
  const { isLeftSidebarCollapsed } = useSidebar();

  return (
    <div className='flex flex-col w-full h-screen overflow-hidden bg-[#FAFBFF] text-xs'>
      <Header />
      <div className='flex h-full w-full'>
        {/* If your Sidebar component handles its own collapsed state internally, 
            pass the prop. If not, conditional rendering is fine. */}
        {!isLeftSidebarCollapsed && <Sidebar />}
        
        <main className='flex-1 overflow-y-auto p-8 bg-[#FAFBFF]'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashContent