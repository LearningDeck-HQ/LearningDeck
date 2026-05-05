import React from 'react';
import { Download, Monitor, Globe, Box, Code, Zap } from 'lucide-react'; // Icons for visual flair

const Downloads = () => {
  return (
    <div className="h-full px-6 py-16 pt-24 bg-white font-sans text-[#212121]">
      {/* --- Header Section --- */}
      <header className="py-16 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          Download LearningDeck
        </h1>
        <p className="text-lg md:text-xl text-[#6b6b6b] leading-relaxed">
          Download the desktop app for the most complete LearningDeck experience, with native Git support and deeper integration into your development workflow.
        </p>
      </header>

      {/* --- Main Hero Section --- */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Download Controls */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* The LearningDeck App */}
            <section>
              <h2 className="text-2xl font-semibold mb-3">The LearningDeck app</h2>
              <p className="text-[#6b6b6b] mb-6">
                Download the app to get started with the LearningDeck API Platform.
              </p>
              <button className="bg-[#ff6c37] hover:bg-[#e05a2b] text-white font-bold py-3 px-6 rounded flex items-center transition-colors">
                <Monitor className="w-5 h-5 mr-2" />
                Windows x64
              </button>
              <a href="#" className="block mt-4 text-[#006aff] hover:underline text-sm font-medium">
                Download for Windows ARM64 →
              </a>
              <p className="text-[12px] text-[#6b6b6b] mt-6 leading-snug">
                By downloading and using LearningDeck, I agree to the <a href="#" className="underline">Privacy Policy</a> and <a href="#" className="underline">Terms</a>.
              </p>
              <a href="#" className="inline-block mt-4 text-xs text-[#6b6b6b] hover:text-[#212121] transition-colors">
                Release Notes →
              </a>
            </section>

            <hr className="border-[#e6e6e6]" />

            {/* LearningDeck on the Web */}
            <section>
              <h2 className="text-2xl font-semibold mb-3">LearningDeck on the web</h2>
              <p className="text-[#6b6b6b] mb-6">
                Use LearningDeck in your web browser to get started quickly, with lightweight access for exploring APIs and running requests. Create a free account and you're in.
              </p>
              <button className="border border-[#e6e6e6] hover:bg-gray-50 text-[#212121] font-semibold py-2.5 px-6 rounded transition-colors">
                Launch LearningDeck
              </button>
            </section>

            <hr className="border-[#e6e6e6]" />

            {/* Desktop Agent */}
            <section>
              <h2 className="text-2xl font-semibold mb-3">LearningDeck desktop agent</h2>
              <p className="text-[#6b6b6b] mb-4">
                If you're using LearningDeck in a web browser, download the LearningDeck desktop agent to make API requests to local and private networks and overcome browser limitations like CORS.
              </p>
              <a href="#" className="text-[#006aff] hover:underline text-sm font-medium">
                Download LearningDeck Agent →
              </a>
            </section>
          </div>

          {/* Right Column: Desktop UI Placeholder (Empty as requested) */}
          <div className="lg:col-span-7  bg-[#fcfcfc] border border-[#e6e6e6] rounded overflow-hidden flex items-center justify-center">
           <img src="/dashboard.jpg" alt="LearningDeck Desktop App UI Placeholder" className="object-cover h-full w-full" />
          </div>
        </div>
      </main>

      {/* --- Footer Tools Section --- */}
      <section className="bg-white border-t border-[#e6e6e6] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Work with LearningDeck in your existing tools</h2>
            <p className="text-[#6b6b6b] text-lg">We have more than one way to help streamline building, testing and deploying your APIs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ToolCard 
              title="LearningDeck CLI"
              description="The LearningDeck CLI is the command-line companion that is developed, supported, and signed by LearningDeck. It enables you to run collections, lint API schemas, and log in/out from your local environment."
              linkText="Read the installation docs →"
              icon={<Box className="text-[#ff6c37]" />}
            />
            <ToolCard 
              title="LearningDeck VS Code extension"
              description="The LearningDeck VS Code extension lets you explore, test, and organize APIs from within Visual Studio Code. It works alongside the LearningDeck desktop app for native Git support."
              linkText="Get the extension →"
              icon={<Code className="text-[#3399ff]" />}
            />
            <ToolCard 
              title="LearningDeck Interceptor"
              description="LearningDeck Interceptor helps you bring browser network traffic into LearningDeck. Capture and inspect traffic between your client and APIs without switching between tools."
              linkText="Learn more →"
              icon={<Zap className="text-[#ffcc00]" />}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

/* --- Component: ToolCard --- */
interface ToolCardProps {
  title: string;
  description: string;
  linkText: string;
  icon: React.ReactNode;
}

const ToolCard = ({ title, description, linkText, icon }: ToolCardProps) => (
  <div className="group">
    <div className="w-12 h-12 mb-6 bg-gray-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-[#6b6b6b] text-sm leading-relaxed mb-4 min-h-[80px]">
      {description}
    </p>
    <a href="#" className="text-[#006aff] hover:underline text-sm font-medium">
      {linkText}
    </a>
  </div>
);

export default Downloads;