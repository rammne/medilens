import React, { useRef, useState } from 'react';
import { Camera, Loader2, Image, X } from 'lucide-react';

interface ScanButtonProps {
  onImageSelected: (file: File) => void;
  isProcessing: boolean;
}

export const ScanButton: React.FC<ScanButtonProps> = ({ onImageSelected, isProcessing }) => {
  const [isOpen, setIsOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelected(file);
      setIsOpen(false);
    }
    // Reset inputs
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const toggleMenu = () => {
    if (!isProcessing) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full my-8 z-20">
      {/* Hidden Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Options */}
      {isOpen && (
        <div className="absolute bottom-full mb-6 flex flex-col gap-3 z-50 w-48">
           <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-3 bg-teal-600 text-white p-4 rounded-2xl shadow-xl shadow-teal-100 hover:bg-teal-700 transition-transform active:scale-95"
          >
            <div className="bg-white/20 p-2 rounded-lg">
                <Camera size={20} />
            </div>
            <span className="font-semibold text-sm">Take Photo</span>
          </button>
          
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center gap-3 bg-white text-slate-700 p-4 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 hover:bg-slate-50 transition-transform active:scale-95"
          >
             <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                <Image size={20} />
            </div>
            <span className="font-semibold text-sm">Upload File</span>
          </button>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={toggleMenu}
        disabled={isProcessing}
        className={`
          relative flex items-center justify-center z-50
          w-24 h-24 rounded-full
          shadow-xl transition-all duration-300
          ${isOpen ? 'bg-slate-800 text-white rotate-90 shadow-slate-300' : 'bg-teal-500 text-white shadow-teal-200 hover:bg-teal-600'}
          ${isProcessing ? 'scale-95 opacity-80 cursor-wait' : 'hover:scale-105 active:scale-95'}
        `}
      >
        {isProcessing ? (
          <>
             <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
             <Loader2 size={40} className="animate-spin" />
          </>
        ) : (
          isOpen ? <X size={36} /> : <Camera size={40} />
        )}
      </button>

      <p className="mt-4 text-slate-500 font-medium text-sm relative z-50">
        {isProcessing ? 'Analyzing...' : (isOpen ? 'Select source' : 'Tap to Scan')}
      </p>
    </div>
  );
};