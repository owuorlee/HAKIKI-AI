/**
 * HAKIKI AI v2.0 - Situation Room Dashboard
 * Main application component with fraud visualization and controls
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Smartphone,
  MessageSquareWarning,
  TrendingUp,
  DollarSign,
  Briefcase
} from 'lucide-react';
import SentinelApp from './components/SentinelApp';
import WhistleblowerModal from './components/WhistleblowerModal';
import ChatWidget from './components/ChatWidget';
import GraphVisualization from './components/GraphVisualization';
import StatsPanel from './components/StatsPanel';
import AnomaliesPanel from './components/AnomaliesPanel';
import Toast from './components/Toast';
import type {
  GraphData,
  DashboardStats,
  SalaryAnomaly,
  AuditResponse,
  GraphNode
} from './types';
import './App.css';

// API base URL - direct to backend
const API_BASE = 'http://localhost:8000/api/v1';

function App() {
  // State
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalFlags: 0,
    ghostFamilies: 0,
    identityTheft: 0,
    livingDead: 0,
    salaryAnomalies: 0,
    totalAtRisk: 0,
  });
  const [anomalies, setAnomalies] = useState<SalaryAnomaly[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Loading states
  const [auditLoading, setAuditLoading] = useState(false);
  const [mlLoading, setMlLoading] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showSentinel, setShowSentinel] = useState(false);
  const [showWhistleblower, setShowWhistleblower] = useState(false);

  // Priority 2: Wow Factor
  const [redMode, setRedMode] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'danger' | 'success' | 'warning' } | null>(null);
  const [triggerFlash, setTriggerFlash] = useState(false);
  // Priority 2: Wow Factory (version controls dataset)
  const [auditVersion, setAuditVersion] = useState('v2');  // v2=July 2025 (perfect), v1=June 2025 (legacy)

  // Run the full sovereign audit
  const runAudit = useCallback(async () => {
    setAuditLoading(true);
    setAuditComplete(false);

    try {
      // Step 1: Run the sovereign audit (ETL + Graph Build + Detection)
      setStatusMessage('Step 1/3: Running ETL & Building Graph...');
      console.log(`[HAKIKI] Step 1: Calling run-sovereign-audit with version=${auditVersion}...`);
      const auditRes = await fetch(`${API_BASE}/audit/run-sovereign-audit?version=${auditVersion}`, {
        method: 'POST',
      });

      if (!auditRes.ok) throw new Error(`Audit failed: ${auditRes.status}`);
      const auditData: AuditResponse = await auditRes.json();
      console.log('[HAKIKI] Audit response:', auditData);

      // Update stats from audit - using new API field names
      setStats({
        totalEmployees: auditData.etl_summary?.employees || 0,
        totalFlags: auditData.total_flags || 0,
        ghostFamilies: auditData.ghost_families_detected || 0,
        identityTheft: auditData.identity_theft_detected || 0,
        livingDead: auditData.living_dead_detected || 0,
        salaryAnomalies: 0,
        totalAtRisk: auditData.at_risk_amount || 0,
      });

      // Step 2: Run ML Analysis (optional - don't block on failure)
      setStatusMessage('Step 2/3: Training ML Model...');
      console.log('[HAKIKI] Step 2: Calling analyze-ml...');
      try {
        const mlRes = await fetch(`${API_BASE}/audit/analyze-ml`, {
          method: 'POST',
        });

        if (mlRes.ok) {
          const mlData = await mlRes.json();
          console.log('[HAKIKI] ML response:', mlData);
          setAnomalies(mlData.anomalies || []);
          setStats(prev => ({
            ...prev,
            salaryAnomalies: mlData.anomalies?.length || 0,
            totalAtRisk: mlData.total_salary_at_risk || prev.totalAtRisk,
          }));
        }
      } catch (mlError) {
        console.warn('[HAKIKI] ML analysis failed (non-blocking):', mlError);
      }

      // Step 3: Fetch graph visualization data
      setStatusMessage('Step 3/3: Loading Network Visualization...');
      console.log('[HAKIKI] Step 3: Calling visualize...');
      const graphRes = await fetch(`${API_BASE}/audit/visualize`);

      if (graphRes.ok) {
        const graph = await graphRes.json();
        console.log('[HAKIKI] Graph data:', graph);
        console.log('[HAKIKI] Nodes count:', graph.nodes?.length);
        console.log('[HAKIKI] Links count:', graph.links?.length);
        setGraphData(graph);
      } else {
        console.error('[HAKIKI] Visualize failed:', graphRes.status);
      }

      setStatusMessage('Audit Complete!');
      setAuditComplete(true);
    } catch (error) {
      console.error('[HAKIKI] Audit failed:', error);
      setStatusMessage(`Error: ${error}`);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  // Run ML analysis
  const runMLAnalysis = useCallback(async () => {
    setMlLoading(true);

    try {
      const res = await fetch(`${API_BASE}/audit/analyze-ml`, {
        method: 'POST',
      });
      const data = await res.json();

      setAnomalies(data.anomalies || []);
      setStats(prev => ({
        ...prev,
        salaryAnomalies: data.anomalies?.length || 0,
        totalAtRisk: data.total_salary_at_risk || prev.totalAtRisk,
      }));
    } catch (error) {
      console.error('ML analysis failed:', error);
    } finally {
      setMlLoading(false);
    }
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Treasury Lock Flash */}
      <AnimatePresence>
        {triggerFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-600/50 z-[100] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Sovereign Branding */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 tracking-tight">
                  HAKIKI AI
                </h1>
                <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Sovereign Payroll Defense
                </p>
              </div>
            </div>

            {/* Audit Period Dropdown */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Audit Period</span>
                <select
                  value={auditVersion}
                  onChange={(e) => setAuditVersion(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="v2">July 2025 (Live)</option>
                  <option value="v1">June 2025 (Archived)</option>
                </select>
              </div>

              <div className="h-8 w-px bg-zinc-700"></div>

              {/* Run Audit Button */}
              <motion.button
                onClick={runAudit}
                disabled={auditLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
                transition-all duration-300 shadow-lg
                ${auditLoading
                    ? 'bg-zinc-800 text-zinc-400 cursor-wait'
                    : auditComplete
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25'
                      : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white shadow-blue-500/25'
                  }
              `}
              >
                {auditLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {statusMessage || 'Running Audit...'}
                  </>
                ) : auditComplete ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Audit Complete
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Run Sovereign Audit
                  </>
                )}
              </motion.button>

              {/* Sentinel Mobile Button */}
              <motion.button
                onClick={() => setShowSentinel(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm
                       bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 
                       text-white shadow-lg shadow-purple-500/25 transition-all duration-300"
              >
                <Smartphone className="w-5 h-5" />
                Open Sentinel Mobile
              </motion.button>

              {/* Report Fraud Button */}
              <button
                onClick={() => setShowWhistleblower(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm
                       bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/50
                       transition-all duration-300"
              >
                <MessageSquareWarning className="w-5 h-5" />
                Report Fraud
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto p-6 space-y-6">
        {/* Stats Panel */}
        <StatsPanel stats={stats} loading={auditLoading} />

        {/* Potential Savings Card - The "Money Shot" */}
        {anomalies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0f1a0f] p-6 rounded-xl border border-emerald-500/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-900/30 rounded-lg text-emerald-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider">Potential Monthly Savings</h3>
            </div>
            <div className="text-4xl font-mono font-bold text-white">
              KES {anomalies.reduce((acc, curr) => acc + (curr.gross_salary || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {anomalies.length} flagged employees • Recurrent Expenditure at Risk
            </p>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Graph Section (3 cols) */}
          <div className="xl:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                Network Visualization
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-500 uppercase">Focus Mode</span>
                <button
                  onClick={() => setRedMode(!redMode)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${redMode
                    ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.7)]'
                    : 'bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500'
                    }`}
                >
                  {redMode ? '🔴 SUSPECTS ONLY' : 'ALL DATA'}
                </button>
              </div>
            </div>

            <GraphVisualization
              data={graphData}
              showSuspectsOnly={redMode}
              anomalies={anomalies}
              onNodeClick={handleNodeClick}
            />

            {/* Selected Node Info */}
            <AnimatePresence>
              {selectedNode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-[#1a1a2e] rounded-xl p-4 border border-zinc-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">Selected Node</p>
                      <p className="text-lg font-semibold">{selectedNode.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium capitalize
                        ${selectedNode.type === 'employee' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                        ${selectedNode.type === 'bank' ? 'bg-red-500/20 text-red-400' : ''}
                        ${selectedNode.type === 'department' ? 'bg-purple-500/20 text-purple-400' : ''}
                      `}>
                        {selectedNode.type}
                      </span>
                    </div>
                  </div>
                  {selectedNode.fraudType && selectedNode.fraudType !== 'None' && (
                    <div className="mt-3 flex items-center gap-2 text-amber-400 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      {selectedNode.fraudType}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Anomalies Panel (1 col) */}
          <div className="xl:col-span-1">
            <AnomaliesPanel
              anomalies={anomalies}
              loading={mlLoading}
              onAnalyze={runMLAnalysis}
              onTreasuryLock={(_name: string, id: string) => {
                setTriggerFlash(true);
                setTimeout(() => setTriggerFlash(false), 800);
                setToast({
                  type: 'danger',
                  msg: `IFMIS API: SALARY DISBURSEMENT BLOCKED FOR ID #${id}`
                });
              }}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12 py-6">
        <div className="max-w-[1920px] mx-auto px-6 text-center text-xs text-zinc-600">
          HAKIKI AI v2.0 • Sovereign Payroll Intelligence •
          <span className="text-emerald-500 ml-1">Air-Gapped & Secure</span>
        </div>
      </footer>

      {/* Sentinel Mobile Overlay */}
      <AnimatePresence>
        {showSentinel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <SentinelApp onClose={() => setShowSentinel(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Whistleblower Modal Overlay */}
      <AnimatePresence>
        {showWhistleblower && (
          <WhistleblowerModal onClose={() => setShowWhistleblower(false)} />
        )}
      </AnimatePresence>

      {/* Floating Chat Widget */}
      <ChatWidget selectedSuspect={selectedNode} anomalies={anomalies} />
    </div>
  );
}

export default App;
