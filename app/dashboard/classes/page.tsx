"use client";

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { GraduationCap, Plus, Users, BookOpen, ChevronRight } from 'lucide-react';
import { classApi } from '@/lib/api/classes';
import { Class } from '@/types';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await classApi.list();
        if (res.data) setClasses(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DashboardHeader
        title="Class Management"
        description="Manage your student groups and academic year structures."
      >
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          Create Class
        </Button>
      </DashboardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-[200px] bg-gray-100 rounded-3xl animate-pulse" />)
        ) : classes.length > 0 ? (
          classes.map((cls) => (
            <Card key={cls.id} className="group transition-all border border-zinc-200 bg-white rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="text-[17px] text-[#1B2559]">{cls.name}</h3>
                    <p className="text-[13px] text-[#6b7280]">Class ID: {cls.id}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-200 text-[14px] text-[#6b7280]">
                  <div className="flex items-center gap-3">
                    <Users size={16} /> Enrolled: --
                  </div>
                  <button className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-[#E0E5F2]">
            <p className="text-[#6b7280]">No classes defined yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
