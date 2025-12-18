
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

type OracleMode = 'TEXT' | 'GENERATE' | 'EDIT';

const ASPECT_RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"];
const IMAGE_SIZES = ["1K", "2K", "4K"];

const Oracle: React.FC = () => {
  // Mode State
  const [mode, setMode] = useState<OracleMode>('TEXT');
  const [textModel, setTextModel] = useState<'gemini-2.5-flash' | 'gemini-3-pro-preview'>('gemini-2.5-flash');

  // Input State
  const [query, setQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState('1K');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);

  // Result State
  const [answer, setAnswer] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [sources, setSources] = useState<{uri: string, title: string}[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSourcePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && mode !== 'EDIT') return;
    if (mode === 'EDIT' && (!sourceFile && !query.trim())) return; // Allow generic "describe" if file present

    setLoading(true);
    setAnswer(null);
    setGeneratedImage(null);
    setSources([]);
    setError(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      if (mode === 'TEXT') {
        const response = await ai.models.generateContent({
          model: textModel,
          contents: query,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: "You are the Wise Old Sage of this RPG realm. You provide helpful, accurate, real-world information based on the user's query, but you speak with a slight medieval fantasy flair (like a RuneScape NPC). Keep answers concise and useful.",
          },
        });

        if (response.text) {
          setAnswer(response.text);
        }

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          const webSources = chunks
            .map((c: any) => c.web)
            .filter((w: any) => w && w.uri && w.title);
          setSources(webSources);
        }

      } else if (mode === 'GENERATE') {
          // Nano Banana Pro (Gemini 3 Pro Image Preview)
          const response = await ai.models.generateContent({
              model: 'gemini-3-pro-image-preview',
              contents: {
                  parts: [{ text: query }]
              },
              config: {
                  imageConfig: {
                      imageSize: selectedSize,
                      aspectRatio: selectedRatio
                  }
              }
          });

          // Extract image
          const parts = response.candidates?.[0]?.content?.parts;
          if (parts) {
              for (const part of parts) {
                  if (part.inlineData) {
                      setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
                      break;
                  }
              }
          }
          if (!generatedImage && !response.candidates?.[0]?.content?.parts) {
             // Fallback to text if model refused or output text
             const txt = response.candidates?.[0]?.content?.parts?.[0]?.text;
             if (txt) setAnswer(txt);
             else throw new Error("No image generated.");
          }

      } else if (mode === 'EDIT') {
          // Nano Banana Flash (Gemini 2.5 Flash Image)
          const partsPayload: any[] = [];
          
          if (sourceFile) {
              const base64Data = await fileToBase64(sourceFile);
              partsPayload.push({ 
                  inlineData: { 
                      mimeType: sourceFile.type, 
                      data: base64Data 
                  } 
              });
          }
          
          if (query.trim()) {
              partsPayload.push({ text: query });
          }

          if (partsPayload.length === 0) throw new Error("Provide image or text.");

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                  parts: partsPayload
              },
              config: {
                  imageConfig: {
                      aspectRatio: selectedRatio
                  }
              }
          });

           // Extract image OR text (Flash Image can analyze or edit)
           const parts = response.candidates?.[0]?.content?.parts;
           if (parts) {
               for (const part of parts) {
                   if (part.inlineData) {
                       setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
                   }
                   if (part.text) {
                       setAnswer(prev => (prev ? prev + "\n" + part.text : part.text));
                   }
               }
           }
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "The spirits are chaotic... The spell failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header Panel */}
      <div className="bg-[#362f2b] border-2 border-[#5d5447] p-6 shadow-osrs relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] pointer-events-none"></div>
        <div className="relative z-10 text-center">
            <div className="flex justify-center gap-4 mb-4">
                 <button 
                    onClick={() => { setMode('TEXT'); setError(null); setAnswer(null); }}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-all shadow-lg ${mode === 'TEXT' ? 'bg-[#1a1816] border-[#ffff00] text-cyan-400 scale-110' : 'bg-[#2b2522] border-[#5d5447] text-gray-500 hover:text-white'}`}
                    title="The Oracle (Text)"
                 >
                     <i className="fa-solid fa-eye"></i>
                 </button>
                 <button 
                    onClick={() => { setMode('GENERATE'); setError(null); setAnswer(null); }}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-all shadow-lg ${mode === 'GENERATE' ? 'bg-[#1a1816] border-[#ffff00] text-purple-400 scale-110' : 'bg-[#2b2522] border-[#5d5447] text-gray-500 hover:text-white'}`}
                    title="The Artist (Generation)"
                 >
                     <i className="fa-solid fa-wand-magic-sparkles"></i>
                 </button>
                 <button 
                    onClick={() => { setMode('EDIT'); setError(null); setAnswer(null); }}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-all shadow-lg ${mode === 'EDIT' ? 'bg-[#1a1816] border-[#ffff00] text-green-400 scale-110' : 'bg-[#2b2522] border-[#5d5447] text-gray-500 hover:text-white'}`}
                    title="The Alchemist (Editing)"
                 >
                     <i className="fa-solid fa-flask"></i>
                 </button>
            </div>
            <h1 className="text-3xl font-bold text-[#ff981f] drop-shadow-[2px_2px_0_#000] mb-2">
                {mode === 'TEXT' ? 'The Town Oracle' : mode === 'GENERATE' ? 'Arcane Artist' : 'Matter Alchemist'}
            </h1>
            <p className="text-[#dcdcdc] italic text-sm">
                {mode === 'TEXT' ? '"Seek knowledge from the spirits of the Web..."' : mode === 'GENERATE' ? '"Conjure visions from the void..."' : '"Transmute matter with your words..."'}
            </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-[#2b2522] border-2 border-[#5d5447] p-1 shadow-osrs">
         <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-[#1a1816] p-4">
             
             {/* TEXT MODE CONFIG */}
             {mode === 'TEXT' && (
                 <div className="flex gap-4 mb-2 p-2 bg-[#0b0b0b] border border-[#5d5447] shadow-inner items-center">
                     <span className="text-[10px] font-bold text-[#9a9a9a] uppercase mr-2">Casting Level:</span>
                     <button
                        type="button"
                        onClick={() => setTextModel('gemini-2.5-flash')}
                        className={`px-3 py-1 text-xs font-bold border-2 transition-all ${textModel === 'gemini-2.5-flash' ? 'bg-[#3e3226] border-[#ffff00] text-[#00ff00]' : 'bg-[#1a1816] border-[#5d5447] text-gray-500'}`}
                     >
                         <i className="fa-solid fa-bolt mr-1"></i> Flash (Fast)
                     </button>
                     <button
                        type="button"
                        onClick={() => setTextModel('gemini-3-pro-preview')}
                        className={`px-3 py-1 text-xs font-bold border-2 transition-all ${textModel === 'gemini-3-pro-preview' ? 'bg-[#3e3226] border-[#ffff00] text-[#a855f7]' : 'bg-[#1a1816] border-[#5d5447] text-gray-500'}`}
                     >
                         <i className="fa-solid fa-brain mr-1"></i> Pro (Smart)
                     </button>
                 </div>
             )}

             {/* IMAGE CONFIG (Size/Ratio) */}
             {(mode === 'GENERATE' || mode === 'EDIT') && (
                 <div className="flex flex-wrap gap-4 mb-2 p-2 bg-[#0b0b0b] border border-[#5d5447] shadow-inner">
                     {mode === 'GENERATE' && (
                         <div>
                             <label className="block text-[10px] font-bold text-[#9a9a9a] mb-1 uppercase">Size</label>
                             <select 
                                value={selectedSize} 
                                onChange={(e) => setSelectedSize(e.target.value)}
                                className="bg-[#2b2522] text-[#ff981f] border border-[#5d5447] text-sm px-2 py-1 focus:outline-none cursor-pointer"
                             >
                                 {IMAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                         </div>
                     )}
                     <div>
                         <label className="block text-[10px] font-bold text-[#9a9a9a] mb-1 uppercase">Aspect Ratio</label>
                         <select 
                            value={selectedRatio} 
                            onChange={(e) => setSelectedRatio(e.target.value)}
                            className="bg-[#2b2522] text-[#ff981f] border border-[#5d5447] text-sm px-2 py-1 focus:outline-none cursor-pointer"
                         >
                             {ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                         </select>
                     </div>
                 </div>
             )}

             {/* FILE INPUT (For Edit Mode) */}
             {mode === 'EDIT' && (
                 <div className="mb-2">
                     <label className="block text-xs font-bold text-[#ff981f] mb-1 uppercase tracking-wider">Source Material</label>
                     <input 
                        type="file" 
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                     />
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-[#5d5447] bg-[#0b0b0b] flex items-center justify-center cursor-pointer hover:border-[#ffff00] transition-colors relative overflow-hidden group"
                     >
                         {sourcePreview ? (
                             <img src={sourcePreview} alt="Source" className="h-full w-full object-contain" />
                         ) : (
                             <div className="text-center text-gray-500 group-hover:text-[#dcdcdc]">
                                 <i className="fa-solid fa-upload text-2xl mb-2"></i>
                                 <p className="text-xs font-mono">Upload Image to Transmute</p>
                             </div>
                         )}
                     </div>
                     {sourcePreview && (
                         <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setSourceFile(null); setSourcePreview(null); }}
                            className="text-xs text-red-500 hover:text-red-400 mt-1 font-bold"
                         >
                             <i className="fa-solid fa-trash mr-1"></i> Clear Image
                         </button>
                     )}
                 </div>
             )}

             <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-[#ff981f] mb-1 uppercase tracking-wider">
                        {mode === 'TEXT' ? 'Your Question' : mode === 'GENERATE' ? 'Vision Description' : 'Transmutation Instructions'}
                    </label>
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={mode === 'TEXT' ? "How do I make bread?" : mode === 'GENERATE' ? "A knight fighting a dragon, pixel art style" : "Add a wizard hat, or 'Describe this scene'"}
                        className="w-full bg-[#0b0b0b] border border-[#5d5447] text-[#dcdcdc] p-3 focus:outline-none focus:border-[#ffff00] font-mono shadow-inner"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`px-8 py-3 font-bold uppercase tracking-wide border-2 shadow-[2px_2px_0_#000] active:translate-y-1 active:shadow-none transition-all mt-auto
                        ${loading 
                            ? 'bg-[#5d5447] border-[#362f2b] text-gray-500 cursor-not-allowed' 
                            : 'bg-[#701414] border-[#4a0d0d] text-white hover:brightness-110'
                        }`}
                >
                    {loading ? (
                        <span><i className="fa-solid fa-spinner fa-spin mr-2"></i> Casting...</span>
                    ) : (
                        <span><i className={`fa-solid ${mode === 'TEXT' ? 'fa-scroll' : 'fa-bolt'} mr-2`}></i> Invoke</span>
                    )}
                </button>
             </div>
         </form>
      </div>

      {/* Response Area */}
      {(answer || generatedImage || error) && (
          <div className="bg-[#362f2b] border-2 border-[#5d5447] p-6 shadow-osrs relative min-h-[200px] animate-in fade-in slide-in-from-bottom-4">
               {/* Decorative corners */}
               <div className="absolute top-2 left-2 w-2 h-2 bg-[#ff981f] opacity-50 rounded-full"></div>
               <div className="absolute top-2 right-2 w-2 h-2 bg-[#ff981f] opacity-50 rounded-full"></div>
               <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#ff981f] opacity-50 rounded-full"></div>
               <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#ff981f] opacity-50 rounded-full"></div>

               {error ? (
                   <div className="text-red-500 font-bold text-center p-8 bg-[#1a1816] border border-red-900 font-pixel">
                       <i className="fa-solid fa-skull text-3xl mb-4 block"></i>
                       {error}
                   </div>
               ) : (
                   <div className="space-y-6">
                       
                       {/* Text Output */}
                       {answer && (
                           <div className="flex gap-4">
                               <div className="flex-shrink-0 mt-1">
                                   <img src="https://i.imgur.com/81j18dD.png" alt="Sage" className="w-8 h-8 opacity-80" />
                               </div>
                               <div className="prose prose-invert prose-yellow max-w-none w-full">
                                   <div className="text-[#ffff00] font-bold text-lg mb-2">The Oracle speaks:</div>
                                   <div className="text-[#dcdcdc] leading-relaxed whitespace-pre-wrap font-sans bg-[#1a1816] p-4 border border-[#5d5447] rounded shadow-inner">
                                       {answer}
                                   </div>
                               </div>
                           </div>
                       )}

                       {/* Image Output */}
                       {generatedImage && (
                           <div className="flex flex-col items-center">
                               <div className="border-4 border-[#5d5447] bg-black shadow-[0_0_20px_rgba(255,152,31,0.3)] p-1 max-w-full">
                                   <img src={generatedImage} alt="Generated Vision" className="max-h-[500px] object-contain" />
                               </div>
                               <div className="mt-4">
                                   <a 
                                      href={generatedImage} 
                                      download={`life-rpg-${mode.toLowerCase()}-${Date.now()}.png`}
                                      className="bg-wood-light border-2 border-[#5d5447] text-white px-4 py-2 text-sm font-bold hover:bg-wood-dark shadow-[2px_2px_0_#000] active:translate-y-1 active:shadow-none inline-flex items-center"
                                   >
                                       <i className="fa-solid fa-download mr-2"></i> Save Vision
                                   </a>
                               </div>
                           </div>
                       )}

                       {/* Grounding Sources (Only Text Mode) */}
                       {sources.length > 0 && mode === 'TEXT' && (
                           <div className="mt-6 pt-4 border-t border-[#5d5447]/50">
                               <h3 className="text-[#ff981f] font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                                   <i className="fa-solid fa-link"></i> Sources of Knowledge
                               </h3>
                               <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                                   {sources.map((source, idx) => (
                                       <a 
                                           key={idx} 
                                           href={source.uri} 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           className="flex items-center gap-3 bg-[#1a1816] p-3 border border-[#5d5447] hover:border-[#ffff00] hover:bg-[#252525] transition-colors group"
                                       >
                                           <div className="w-8 h-8 flex items-center justify-center bg-[#2b2522] text-[#dcdcdc] group-hover:text-[#ffff00] font-bold font-mono text-xs border border-[#5d5447]">
                                               {idx + 1}
                                           </div>
                                           <div className="flex-1 min-w-0">
                                               <div className="text-[#ff981f] text-sm font-bold truncate group-hover:underline">
                                                   {source.title}
                                               </div>
                                               <div className="text-gray-500 text-xs truncate">
                                                   {new URL(source.uri).hostname}
                                               </div>
                                           </div>
                                           <i className="fa-solid fa-external-link-alt text-gray-600 group-hover:text-[#ffff00]"></i>
                                       </a>
                                   ))}
                               </div>
                           </div>
                       )}
                   </div>
               )}
          </div>
      )}
    </div>
  );
};

export default Oracle;
