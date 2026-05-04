import React from 'react'
import Sidebar from '@/components/layout/Sidebar'

const DashLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className='flex h-screen w-full bg-[#FAFBFF] text-xs'>
      <Sidebar />
      <main className='flex-1 overflow-y-auto p-8'>{children}</main>
    </div>
  )
}

export default DashLayout