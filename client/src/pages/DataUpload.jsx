import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File as FileIcon, FileText, FileSpreadsheet, Loader2, CheckCircle2, Trash2, Edit, X } from 'lucide-react';

const DataUpload = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadComplete, setUploadComplete] = useState(false);
    const inputRef = useRef(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFile, setEditingFile] = useState(null);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || `\${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`}/api/files', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUploadedFiles(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch files", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you intentionally want to permanently delete this file and its metadata?")) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || `\${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`)}/api/files/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchFiles();
        } catch (error) {
            console.error("Delete Error", error);
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        if (!editingFile) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || `\${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`)}/api/files/${editingFile._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ originalName: newName })
            });
            setIsEditModalOpen(false);
            fetchFiles();
        } catch (error) {
            console.error("Update Error", error);
        }
    };

    const openEdit = (f) => {
        setEditingFile(f);
        setNewName(f.originalName);
        setIsEditModalOpen(true);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave" || e.type === "drop") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const uploadFileToServer = async () => {
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('document', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || `\${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`}/api/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                setUploadComplete(true);
                setFile(null);
                fetchFiles();

                setTimeout(() => setUploadComplete(false), 3000);
            }
        } catch (error) {
            console.error("File upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (mimeType) => {
        if (mimeType.includes('csv')) return <FileText className="text-emerald-400" size={24} />;
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileSpreadsheet className="text-green-500" size={24} />;
        if (mimeType.includes('json')) return <FileIcon className="text-yellow-400" size={24} />;
        return <FileIcon className="text-indigo-400" size={24} />;
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">Data Upload Center</h1>
                <p className="text-slate-400 text-sm font-medium tracking-wide">Securely import massive external datasets, CSVs, and logs directly into your Node backend.</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8"
            >
                {/* Upload Zone */}
                <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)] relative overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <h2 className="text-xl font-bold text-slate-200 mb-6">Upload Dataset</h2>

                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current.click()}
                        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${dragActive ? 'border-emerald-400 bg-emerald-500/10 scale-[1.02]' : 'border-slate-600 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-500 hover:scale-[1.01]'
                            }`}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        {!file ? (
                            <>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner border transition-all duration-300 ${dragActive ? 'bg-emerald-900/80 border-emerald-500' : 'bg-slate-800/80 border-slate-700'}`}>
                                    <UploadCloud size={40} className={`transition-colors duration-300 ${dragActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-200 mb-2">Drag & Drop a file here</h3>
                                <p className="text-slate-500 text-sm text-center px-4">Supports heavy CSV, JSON, XML, or Text spreadsheets directly from your SSD</p>
                                <button className="mt-8 px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all border border-slate-600 shadow-lg">
                                    Browse Files
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center w-full">
                                <div className="w-16 h-16 rounded-full bg-emerald-900/50 flex items-center justify-center mb-4 border border-emerald-500/50">
                                    {getFileIcon(file.type)}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 truncate w-full text-center px-4">{file.name}</h3>
                                <p className="text-emerald-400 font-medium text-sm mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                                <div className="w-full flex space-x-3 mt-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-600"
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); uploadFileToServer(); }}
                                        disabled={uploading}
                                        className="flex-1 flex items-center justify-center py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] active:scale-[0.98]"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin mr-2" />
                                                Uploading...
                                            </>
                                        ) : uploadComplete ? (
                                            <>
                                                <CheckCircle2 size={18} className="mr-2" />
                                                Perfect!
                                            </>
                                        ) : (
                                            'Lock In Upload'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* File History Table */}
                <div className="bg-slate-800 border border-slate-700 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[500px]">
                    <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-900/50 to-slate-800/20">
                        <h2 className="text-xl font-bold text-slate-200">Processing History</h2>
                    </div>

                    <div className="overflow-y-auto flex-1 p-6">
                        {uploadedFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <FileText size={48} className="mb-6 opacity-20" />
                                <p className="font-medium">No files successfully uploaded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {uploadedFiles.map((f) => (
                                    <div key={f._id} className="bg-slate-900/60 hover:bg-slate-700/50 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between transition-colors group cursor-default shadow-md">
                                        <div className="flex items-center space-x-4 overflow-hidden">
                                            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-slate-900 border border-transparent group-hover:border-slate-600 transition-colors">
                                                {getFileIcon(f.mimeType)}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-white font-bold text-sm truncate">{f.originalName}</p>
                                                <p className="text-slate-400 font-semibold text-xs mt-1">{(f.size / 1024 / 1024).toFixed(2)} MB • {new Date(f.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(f)} className="text-slate-400 hover:text-indigo-400 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(f._id)} className="text-slate-400 hover:text-rose-400 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                                <h2 className="text-xl font-bold text-white">Rename Data File</h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleEditSave} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">File Label</label>
                                    <input
                                        type="text"
                                        required
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="pt-4 flex justify-end space-x-3">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all">Cancel</button>
                                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-emerald-950 font-bold py-2 px-6 rounded-xl transition-all shadow-lg">
                                        Rename
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DataUpload;
