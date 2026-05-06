import React from 'react';
import {
  MessageSquare,
  Clock,
  Star,
  Lock,
  Layers,
  Zap,
  PartyPopper
} from 'lucide-react';

const LearningdeckDashboard = () => {
  return (
    <div className="h-full  text-[#6b6b6b] font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Section: Welcome & Input */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="  text-[#1a1a1a]">
            How would you like to use Learningdeck today?
          </h2>

          <div className="bg-white border border-[#ededed] rounded p-6  min-h-[350px] flex flex-col justify-between">
            <div className="flex gap-4">
              <div className="mt-1">
                <div className="p-2 bg-[#f0f0f0] rounded">
                  <Zap size={18} className="text-orange-500" />
                </div>
              </div>
              <div className="bg-[#f0f0f0] p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                <p className=" leading-relaxed">
                  Hi there! 👋 Tell me what you're working on and I'll help you get started with Learningdeck.
                  I can help create exams, questions, generate tests, and more.
                </p>
              </div>
            </div>

            <div className="relative mt-8">
              <input
                type="text"
                placeholder="Tell us what you want to build..."
                className="w-full  border border-[#ededed] rounded py-4 px-6 pr-24 outline-none focus:border-orange-400 transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#ff6b3d]/10 text-[#ff6b3d]  py-2 px-5 rounded hover:bg-[#ff6b3d]/20 transition-colors">
                Let's Go
              </button>
            </div>
          </div>

          {/* Bottom Section: Recent Activity */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className=" text-[#1a1a1a]">Pick up where you left off</h3>
              <div className="flex bg-[#f0f0f0] rounded p-1 p-0.5">
                <button className="flex items-center gap-1 px-3 py-1 bg-white  rounded  ">
                  Recents
                </button>
                <button className="flex items-center gap-1 px-3 py-1  ">
                  Favorites
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#ededed] rounded overflow-hidden">
              <div className="flex items-center gap-4 p-4 border-b border-[#ededed] hover:bg-[#fcfcfc] cursor-pointer group">
                <Lock size={16} />
                <span className=" text-[#1a1a1a] group-hover:text-[#ff6b3d]">My Workspace</span>
              </div>
              <div className="flex items-center gap-4 p-4 border-b border-[#ededed] hover:bg-[#fcfcfc] cursor-pointer group">
                <Layers size={16} />
                <div className="">
                  <span className=" text-[#1a1a1a] group-hover:text-[#ff6b3d]">Local Environment</span>
                  <span className="mx-2 opacity-50">•</span>
                  <span>My Workspace</span>
                </div>
              </div>
              <div className="hidden flex items-center gap-4 p-4 hover:bg-[#fcfcfc] cursor-pointer group">
                <Zap size={16} />
                <div className="">
                  <span className=" text-[#1a1a1a] group-hover:text-[#ff6b3d]">Identify the IP of an Incoming Request</span>
                  <span className="mx-2 opacity-50">•</span>
                  <span>My Workspace</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Attention */}
        <div className="space-y-6">
          <h2 className="  text-[#1a1a1a]">Needs your attention</h2>
          <div className="bg-white border border-[#ededed] rounded p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="mb-4">
              <PartyPopper size={32} className="text-orange-400" />
            </div>
            <h4 className="text-[#1a1a1a]  mb-2">All caught up!</h4>
            <p className=" text-balance">
               Start managing your first workspace to manage your exams, questions, and students. LearningDeck is here to help you streamline your educational management process and make learning more engaging for everyone involved.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LearningdeckDashboard;