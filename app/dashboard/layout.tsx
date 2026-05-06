import React from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

const DashLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col w-full h-screen bg-[#FAFBFF] text-xs'>
      <Header />
      <div className='flex h-full w-full  '>
        <Sidebar />
        <main className='flex-1 overflow-y-auto p-8 bg-[#FAFBFF]'>{children}</main>
      </div>
    </div>
  )
}

export default DashLayout