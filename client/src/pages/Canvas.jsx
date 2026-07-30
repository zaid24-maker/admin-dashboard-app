import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Canvas = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [workflow, setWorkflow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const debounceTimer = useRef(null);

    useEffect(() => {
        fetchWorkflow();
    }, [id]);

    const fetchWorkflow = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/workflows/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const d = await res.json();
            if (d.success) {
                setWorkflow(d.data);

                // Construct basic nodes from trigger and action
                const initialNodes = [
                    {
                        id: 'trigger-node',
                        position: d.data.uiPosition?.trigger || { x: 50, y: 150 },
                        data: { label: `Trigger: ${d.data.trigger}` },
                        type: 'input',
                        style: { background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }
                    },
                    {
                        id: 'action-node',
                        position: d.data.uiPosition?.action || { x: 450, y: 150 },
                        data: { label: `Action: ${d.data.action}` },
                        type: 'output',
                        style: { background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }
                    }
                ];

                const initialEdges = [
                    { id: 'e1-2', source: 'trigger-node', target: 'action-node', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 } }
                ];

                setNodes(initialNodes);
                setEdges(initialEdges);
            }
        } catch (e) {
            toast.error("Failed to load workflow canvas");
        } finally {
            setLoading(false);
        }
    };

    const saveCoordinates = async (newPositions) => {
        setSaving(true);
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/workflows/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uiPosition: newPositions })
            });
        } catch (e) {
            console.error("Save failed", e);
        } finally {
            setSaving(false);
        }
    };

    const onNodesChange = useCallback(
        (changes) => {
            setNodes((nds) => {
                const newNodes = applyNodeChanges(changes, nds);

                // Check if any position actually changed
                const hasPositionChange = changes.some(c => c.type === 'position' && !c.dragging);
                if (hasPositionChange) {
                    if (debounceTimer.current) clearTimeout(debounceTimer.current);
                    debounceTimer.current = setTimeout(() => {
                        const triggerNode = newNodes.find(n => n.id === 'trigger-node');
                        const actionNode = newNodes.find(n => n.id === 'action-node');
                        if (triggerNode && actionNode) {
                            saveCoordinates({
                                trigger: triggerNode.position,
                                action: actionNode.position
                            });
                        }
                    }, 1500); // 1.5s defensive debounce
                }

                return newNodes;
            });
        },
        [id]
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    if (loading) return <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-transparent text-white font-bold tracking-widest text-xs uppercase animate-pulse">Initializing Graphical Canvas...</div>;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full w-full flex flex-col bg-background rounded-xl overflow-hidden shadow-2xl border border-border">
            <div className="flex justify-between items-center p-4 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/workflows')} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
                        <ArrowLeft size={16} className="text-slate-300" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-white">{workflow?.name}</h2>
                        <p className="text-xs text-slate-400 font-mono tracking-widest">DRAG NODES TO ORCHESTRATE</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {saving ? (
                        <div className="flex items-center text-slate-400 text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-full"><Loader2 className="animate-spin mr-2" size={14} /> SYNCING</div>
                    ) : (
                        <div className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-900/50"><Save size={14} className="mr-2" /> SYNCED</div>
                    )}
                </div>
            </div>

            <div className="flex-1 w-full relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    proOptions={{ hideAttribution: true }}
                    className="bg-background"
                >
                    <Background color="#334155" gap={20} size={1} />
                </ReactFlow>
            </div>
        </motion.div>
    );
};

export default Canvas;
